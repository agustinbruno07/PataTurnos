import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, Clock3, PawPrint, Stethoscope } from 'lucide-react';
import { api, dateTime } from '../api';

const labels = { pending: 'Pendiente', confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado' };
export default function VetDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  async function load() { const data = await api('/appointments'); setAppointments(data.appointments); }
  useEffect(()=>{load().catch((err)=>setError(err.message));},[]);
  const upcoming = useMemo(()=>appointments.filter((a)=>['pending','confirmed'].includes(a.status)).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt)),[appointments]);
  async function changeStatus(id,status) {
    setBusyId(id); setError('');
    try { await api(`/appointments/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}); await load(); }
    catch(err){setError(err.message);} finally{setBusyId('');}
  }
  return <>
    <div className="page-title-row"><div><span className="eyebrow">ÁREA PROFESIONAL</span><h1>Mi agenda</h1><p>Revisá las reservas asignadas y actualizá su estado de atención.</p></div><div className="title-icon"><Stethoscope size={25}/></div></div>
    {error&&<div className="alert error">{error}</div>}
    <div className="stats-grid three-stats"><div className="stat-card"><span className="stat-icon mint"><CalendarCheck/></span><div><small>Turnos por atender</small><strong>{upcoming.length}</strong></div></div><div className="stat-card"><span className="stat-icon peach"><Clock3/></span><div><small>Pendientes de confirmar</small><strong>{appointments.filter(a=>a.status==='pending').length}</strong></div></div><div className="stat-card"><span className="stat-icon lilac"><PawPrint/></span><div><small>Atenciones completadas</small><strong>{appointments.filter(a=>a.status==='completed').length}</strong></div></div></div>
    <section className="panel table-panel"><div className="panel-heading table-panel-heading"><div><span className="eyebrow">TRABAJO DIARIO</span><h3>Turnos asignados</h3></div></div>{appointments.length?<div className="table-wrap"><table><thead><tr><th>Fecha y hora</th><th>Mascota</th><th>Cliente</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{appointments.map((a)=><tr key={a.id}><td><strong>{dateTime(a.startAt)}</strong></td><td><strong>{a.petName}</strong><small>{a.petSpecies}</small></td><td>{a.clientName}<small>{a.clientPhone||a.clientEmail}</small></td><td>{a.serviceName}</td><td><span className={`status status-${a.status}`}>{labels[a.status]}</span></td><td><div className="table-actions">{a.status==='pending'&&<button className="button tiny primary" disabled={busyId===a.id} onClick={()=>changeStatus(a.id,'confirmed')}>Confirmar</button>}{a.status==='confirmed'&&<button className="button tiny secondary" disabled={busyId===a.id} onClick={()=>changeStatus(a.id,'completed')}><Check size={14}/> Completar</button>}</div></td></tr>)}</tbody></table></div>:<div className="empty-state"><CalendarCheck size={30}/><strong>No hay turnos asignados</strong><p>Las nuevas reservas aparecerán en esta agenda.</p></div>}</section>
  </>;
}
