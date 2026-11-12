const TZ = 'America/Argentina/Buenos_Aires';
const MIN_NOTICE_MS = 2 * 60 * 60 * 1000;
const MAX_ADVANCE_MS = 90 * 24 * 60 * 60 * 1000;

export function argentinaDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

export function validateAppointmentWindow(startAtInput, durationMinutes, now = new Date()) {
  const startAt = new Date(startAtInput);
  if (Number.isNaN(startAt.getTime())) return { ok: false, message: 'La fecha y hora del turno no son válidas.' };
  if (![30, 60].includes(Number(durationMinutes))) return { ok: false, message: 'La duración del servicio no es válida.' };
  if (startAt.getTime() < now.getTime() + MIN_NOTICE_MS) {
    return { ok: false, message: 'Los turnos deben reservarse con al menos 2 horas de anticipación.' };
  }
  if (startAt.getTime() > now.getTime() + MAX_ADVANCE_MS) {
    return { ok: false, message: 'Solo se pueden reservar turnos dentro de los próximos 90 días.' };
  }

  const parts = argentinaDateParts(startAt);
  const weekday = parts.weekday;
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  if (![0, 30].includes(minute) || startAt.getUTCSeconds() !== 0 || startAt.getUTCMilliseconds() !== 0) {
    return { ok: false, message: 'Los turnos deben comenzar exactamente en minutos :00 o :30.' };
  }

  const endAt = new Date(startAt.getTime() + Number(durationMinutes) * 60_000);
  const endParts = argentinaDateParts(endAt);
  const endMinutes = Number(endParts.hour) * 60 + Number(endParts.minute);
  const startMinutes = hour * 60 + minute;
  const closingMinutes = weekday === 'Sat' ? 13 * 60 : 18 * 60;
  const isOpenDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(weekday);

  if (!isOpenDay || startMinutes < 9 * 60 || endMinutes > closingMinutes || endParts.weekday !== weekday) {
    return {
      ok: false,
      message: weekday === 'Sun'
        ? 'La clínica permanece cerrada los domingos.'
        : weekday === 'Sat'
          ? 'Los sábados atendemos de 09:00 a 13:00.'
          : 'La clínica atiende de lunes a viernes de 09:00 a 18:00.',
    };
  }

  return { ok: true, startAt, endAt };
}

export function overlaps(startA, endA, startB, endB) {
  return new Date(startA).getTime() < new Date(endB).getTime()
    && new Date(endA).getTime() > new Date(startB).getTime();
}

export function buildAvailableSlots(date, durationMinutes, occupied, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const [year, month, day] = date.split('-').map(Number);
  const dateCheck = new Date(Date.UTC(year, month - 1, day));
  if (dateCheck.getUTCFullYear() !== year || dateCheck.getUTCMonth() !== month - 1 || dateCheck.getUTCDate() !== day) return [];

  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(new Date(`${date}T12:00:00-03:00`));
  if (weekday === 'Sun') return [];
  const opening = 9 * 60;
  const closing = weekday === 'Sat' ? 13 * 60 : 18 * 60;
  const slots = [];
  for (let minute = opening; minute + durationMinutes <= closing; minute += 30) {
    const hourText = String(Math.floor(minute / 60)).padStart(2, '0');
    const minuteText = String(minute % 60).padStart(2, '0');
    const startAt = new Date(`${date}T${hourText}:${minuteText}:00-03:00`);
    const validation = validateAppointmentWindow(startAt, durationMinutes, now);
    if (!validation.ok) continue;
    const isOccupied = occupied.some((item) => overlaps(validation.startAt, validation.endAt, item.start_at, item.end_at));
    if (!isOccupied) slots.push({ time: `${hourText}:${minuteText}`, startAt: validation.startAt.toISOString() });
  }
  return slots;
}

export function canTransitionStatus(currentStatus, nextStatus, endAt, now = new Date()) {
  const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };
  if (!transitions[currentStatus]?.includes(nextStatus)) {
    return { ok: false, message: `No se puede cambiar un turno de ${currentStatus} a ${nextStatus}.` };
  }
  if (nextStatus === 'completed' && new Date(endAt).getTime() > now.getTime()) {
    return { ok: false, message: 'El turno solo puede marcarse como completado después de su horario de finalización.' };
  }
  return { ok: true };
}

export function canClientCancel(startAt, now = new Date()) {
  return new Date(startAt).getTime() - now.getTime() >= MIN_NOTICE_MS;
}
