import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, Clock3, PawPrint, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, money, dateTime } from '../api';

function minDate() { return new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }); }

export default function Booking() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [services, setServices] = useState([]);
  const [vets, setVets] = useState([]);
  const [form, setForm] = useState({ petId: '', serviceId: '', vetId: '', date: '', time: '', notes: '' });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const selectedService = useMemo(() => services.find((s) => s.id === form.serviceId), [services, form.serviceId]);

  useEffect(() => {
    Promise.all([api('/pets'), api('/services'), api('/vets')])
      .then(([p,s,v]) => { setPets(p.pets); setServices(s.services); setVets(v.vets); })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!form.date || !form.vetId || !form.serviceId) { setSlots([]); return; }
    setLoadingSlots(true); setForm((previous) => ({ ...previous, time: '' }));
    api(`/appointments/availability?vetId=${encodeURIComponent(form.vetId)}&serviceId=${encodeURIComponent(form.serviceId)}&date=${encodeURIComponent(form.date)}`)
      .then((data) => setSlots(data.slots))
      .catch((err) => { setSlots([]); setError(err.message); })
      .finally(() => setLoadingSlots(false));
  }, [form.date, form.vetId, form.serviceId]);

  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const startAt = new Date(`${form.date}T${form.time}:00-03:00`).toISOString();
      const data = await api('/appointments', { method: 'POST', body: JSON.stringify({ petId: form.petId, serviceId: form.serviceId, vetId: form.vetId, startAt, notes: form.notes }) });
      setSuccess(data.appointment);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  if (success) return <div className="panel booking-success"><div className="success-icon"><CheckCircle2 size={34}/></div><span className="eyebrow">SOLICITUD REGISTRADA</span><h1>¡Tu turno está reservado!</h1><p>La solicitud quedó registrada y figura como pendiente de confirmación por la clínica.</p><div className="success-details"><div><span>Mascota</span><strong>{success.petName}</strong></div><div><span>Servicio</span><strong>{success.serviceName}</strong></div><div><span>Profesional</span><strong>{success.vetName}</strong></div><div><span>Fecha y hora</span><strong>{dateTime(success.startAt)}</strong></div><div><span>Estado</span><strong className="status status-pending">Pendiente</strong></div></div><div className="success-actions"><button className="button primary" onClick={()=>navigate('/turnos')}>Ver mis turnos</button><button className="button ghost" onClick={()=>navigate('/')}>Volver al inicio</button></div></div>;

  return <>
    <div className="page-title-row"><div><span className="eyebrow">NUEVA RESERVA</span><h1>Reservar un turno</h1><p>Elegí la mascota, el servicio, el profesional y un horario disponible.</p></div><div className="title-icon"><CalendarPlus size={25}/></div></div>
    {error && <div className="alert error">{error}</div>}
    {pets.length === 0 ? <div className="panel empty-state large-empty"><PawPrint size={34}/><h3>Primero necesitás registrar una mascota</h3><p>Para crear un turno, la mascota debe estar asociada a tu cuenta.</p><button className="button primary" onClick={()=>navigate('/mascotas')}>Registrar mascota</button></div> : <form className="booking-layout" onSubmit={submit}><section className="panel booking-form"><div className="panel-heading"><div><span className="eyebrow">PASO 1</span><h3>Datos de la consulta</h3></div><span className="step-number">01</span></div><label className="field-with-icon"><span>Mascota</span><div className="select-wrap"><PawPrint size={17}/><select required value={form.petId} onChange={(e)=>setForm({...form,petId:e.target.value})}><option value="">Seleccioná una mascota</option>{pets.map((p)=><option value={p.id} key={p.id}>{p.name} · {p.species}</option>)}</select></div></label><label className="field-with-icon"><span>Servicio</span><div className="select-wrap"><Stethoscope size={17}/><select required value={form.serviceId} onChange={(e)=>setForm({...form,serviceId:e.target.value})}><option value="">Seleccioná un servicio</option>{services.map((s)=><option value={s.id} key={s.id}>{s.name} · {money(s.price)}</option>)}</select></div></label><label className="field-with-icon"><span>Veterinario/a</span><div className="select-wrap"><Stethoscope size={17}/><select required value={form.vetId} onChange={(e)=>setForm({...form,vetId:e.target.value})}><option value="">Seleccioná un profesional</option>{vets.map((v)=><option value={v.id} key={v.id}>{v.name}</option>)}</select></div></label><div className="form-divider"/><div className="panel-heading"><div><span className="eyebrow">PASO 2</span><h3>Fecha y horario</h3></div><span className="step-number">02</span></div><label>Fecha<input type="date" required min={minDate()} max={new Date(Date.now()+90*86400000).toLocaleDateString('en-CA',{timeZone:'America/Argentina/Buenos_Aires'})} value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})}/></label><div className="slot-header"><span>Horarios disponibles</span>{loadingSlots && <small>Buscando…</small>}</div>{!form.date || !form.vetId || !form.serviceId ? <div className="slot-placeholder"><Clock3 size={20}/> Completá servicio, profesional y fecha para consultar la disponibilidad.</div> : loadingSlots ? <div className="slot-placeholder">Consultando agenda…</div> : slots.length ? <div className="slot-grid">{slots.map((slot)=><button type="button" key={slot.time} className={`slot-button ${form.time===slot.time?'selected':''}`} onClick={()=>setForm({...form,time:slot.time})}>{slot.time}</button>)}</div> : <div className="slot-placeholder">No hay horarios disponibles para ese día. Probá con otra fecha.</div>}<label>Comentarios <span className="optional">(opcional)</span><textarea rows="3" maxLength="1000" placeholder="Contanos si hay algo que debamos saber…" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></label><button className="button primary full" disabled={busy || !form.time}>{busy ? 'Reservando…' : 'Confirmar reserva'}</button><p className="form-hint">La reserva queda pendiente hasta que la clínica la confirme.</p></section><aside className="booking-aside"><div className="panel summary-panel"><span className="eyebrow">RESUMEN</span><h3>Tu consulta</h3><div className="summary-illustration"><PawPrint size={42}/></div><div className="summary-line"><span>Mascota</span><strong>{pets.find((p)=>p.id===form.petId)?.name || 'A seleccionar'}</strong></div><div className="summary-line"><span>Servicio</span><strong>{selectedService?.name || 'A seleccionar'}</strong></div>{selectedService && <div className="summary-line"><span>Duración</span><strong>{selectedService.durationMinutes} minutos</strong></div>}<div className="summary-line"><span>Profesional</span><strong>{vets.find((v)=>v.id===form.vetId)?.name || 'A seleccionar'}</strong></div><div className="summary-line"><span>Fecha</span><strong>{form.date ? new Intl.DateTimeFormat('es-AR',{dateStyle:'medium',timeZone:'UTC'}).format(new Date(`${form.date}T12:00:00Z`)) : 'A seleccionar'}</strong></div><div className="summary-line"><span>Horario</span><strong>{form.time || 'A seleccionar'}</strong></div><div className="summary-total"><span>Valor del servicio</span><strong>{selectedService ? money(selectedService.price) : '—'}</strong></div></div><div className="info-note"><Clock3 size={18}/><p><strong>Horarios de atención</strong><br/>Lunes a viernes: 09:00 a 18:00<br/>Sábados: 09:00 a 13:00<br/>Domingos: cerrado.</p></div></aside></form>}
  </>;
}
