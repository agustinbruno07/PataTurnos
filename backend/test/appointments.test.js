import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAvailableSlots, canClientCancel, canTransitionStatus, overlaps, validateAppointmentWindow,
} from '../src/domain/appointments.js';

const fixedNow = new Date('2026-11-12T12:00:00-03:00');

test('rechaza turnos con menos de dos horas de anticipación', () => {
  const result = validateAppointmentWindow('2026-11-12T13:00:00-03:00', 30, fixedNow);
  assert.equal(result.ok, false);
  assert.match(result.message, /2 horas/);
});

test('rechaza los domingos', () => {
  const result = validateAppointmentWindow('2026-11-15T10:00:00-03:00', 30, fixedNow);
  assert.equal(result.ok, false);
  assert.match(result.message, /domingos/);
});

test('rechaza turnos fuera del horario de atención', () => {
  const result = validateAppointmentWindow('2026-11-13T18:00:00-03:00', 30, fixedNow);
  assert.equal(result.ok, false);
  assert.match(result.message, /09:00 a 18:00/);
});

test('acepta un turno dentro del horario y calcula su finalización', () => {
  const result = validateAppointmentWindow('2026-11-13T10:00:00-03:00', 60, fixedNow);
  assert.equal(result.ok, true);
  assert.equal(result.endAt.toISOString(), '2026-11-13T14:00:00.000Z');
});

test('detecta intervalos superpuestos y permite los contiguos', () => {
  assert.equal(overlaps('2026-11-13T10:00:00Z', '2026-11-13T10:30:00Z', '2026-11-13T10:15:00Z', '2026-11-13T10:45:00Z'), true);
  assert.equal(overlaps('2026-11-13T10:00:00Z', '2026-11-13T10:30:00Z', '2026-11-13T10:30:00Z', '2026-11-13T11:00:00Z'), false);
});

test('no ofrece slots ocupados', () => {
  const slots = buildAvailableSlots('2026-11-13', 30, [
    { start_at: '2026-11-13T12:00:00-03:00', end_at: '2026-11-13T12:30:00-03:00' },
  ], new Date('2026-11-12T08:00:00-03:00'));
  assert.equal(slots.some((slot) => slot.time === '12:00'), false);
  assert.equal(slots.some((slot) => slot.time === '12:30'), true);
});

test('un cliente puede cancelar con más de dos horas, pero no después', () => {
  assert.equal(canClientCancel('2026-11-13T12:00:00-03:00', fixedNow), true);
  assert.equal(canClientCancel('2026-11-12T13:00:00-03:00', fixedNow), false);
});

test('las transiciones de estado respetan el ciclo de vida', () => {
  assert.equal(canTransitionStatus('pending', 'confirmed').ok, true);
  assert.equal(canTransitionStatus('completed', 'confirmed').ok, false);
  assert.equal(canTransitionStatus('confirmed', 'completed', '2026-11-12T10:00:00Z', fixedNow).ok, true);
  assert.equal(canTransitionStatus('confirmed', 'completed', '2026-11-13T10:00:00Z', fixedNow).ok, false);
});

test('rechaza horarios con segundos, aunque el minuto sea :00 o :30', () => {
  const result = validateAppointmentWindow('2026-11-13T10:00:15-03:00', 30, fixedNow);
  assert.equal(result.ok, false);
  assert.match(result.message, /exactamente/);
});
