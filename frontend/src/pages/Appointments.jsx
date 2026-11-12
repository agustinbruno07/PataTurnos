import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Filter, XCircle } from 'lucide-react';
import { api, dateTime, money } from '../api';
import { useAuth } from '../context/AuthContext';

const statusLabels = { pending: 'Pendiente', confirmed: 'Confirmado', completed: 'Completado', cancelled: 'Cancelado' };

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  async function load() { const data = await api('/appointments'); setAppointments(data.appointments); }
  useEffect(() => { load().catch((err)=>setError(err.message)); }, []);
  const filtered = useMemo(()=>appointments.filter((a)=>filter==='all'||a.status===filter),[appointments,filter]);
  async function cancel(id) {
    if (!window.confirm('¿Querés cancelar este turno?')) return;
    try { await api(`/appointments/${id}/cancel`,{method:'PATCH'}); await load(); }
    catch (err) { setError(err.message); }
  }
  return <>
    <div className="page-title-row"><div><span className="eyebrow">AGENDA</span><h1>{user.role==='client'?'Mis turnos':'Turnos de la clínica'}</h1><p>{user.role==='client'?'Consultá el estado y los detalles de tus reservas.':'Consultá los turnos registrados.'}</p></div><div className="title-icon"><CalendarDays size={25}/></div></div>
    {error && <div className="alert error">{error}</div>}
    <div className="filter-row"><Filter size={16}/><span>Filtrar:</span>{['all','pending','confirmed','completed','cancelled'].map((value)=><button key={value} className={`filter-chip ${filter===value?'active':''}`} onClick={()=>setFilter(value)}>{value==='all'?'Todos':statusLabels[value]}</button>)}</div>
    {filtered.length ? <div className="panel table-panel"><div className="table-wrap"><table><thead><tr><th>Fecha y hora</th><th>Mascota</th><th>Servicio</th><th>{user.role==='client'?'Veterinario':'Cliente'}</th><th>Estado</th><th>Importe</th>{user.role==='client'&&<th></th>}</tr></thead><tbody>{filtered.map((a)=><tr key={a.id}><td><strong>{dateTime(a.startAt)}</strong></td><td><strong>{a.petName}</strong><small>{a.petSpecies}</small></td><td>{a.serviceName}</td><td>{user.role==='client'?a.vetName:a.clientName}</td><td><span className={`status status-${a.status}`}>{statusLabels[a.status]}</span></td><td>{money(a.price)}</td>{user.role==='client'&&<td>{['pending','confirmed'].includes(a.status)&&new Date(a.startAt)-Date.now()>=2*60*60*1000?<button className="icon-button danger-icon" title="Cancelar turno" onClick={()=>cancel(a.id)}><XCircle size={17}/></button>:null}</td>}</tr>)}</tbody></table></div></div> : <div className="panel empty-state large-empty"><CalendarDays size={34}/><h3>No hay turnos para mostrar</h3><p>Cuando haya reservas que coincidan con este filtro, aparecerán acá.</p></div>}
  </>;
}
