import { useEffect, useState } from 'react';
import { CalendarClock, CalendarPlus, PawPrint, Plus, ArrowRight, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, dateTime, money } from '../api';

export default function Dashboard() {
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api('/pets'), api('/appointments'), api('/services')])
      .then(([p, a, s]) => { setPets(p.pets); setAppointments(a.appointments); setServices(s.services); })
      .catch((err) => setError(err.message));
  }, []);
  const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.startAt) >= new Date()).sort((a,b) => new Date(a.startAt)-new Date(b.startAt)).slice(0,3);
  return <>
    <div className="welcome-banner"><div><span className="eyebrow-light">TU ESPACIO DE CUIDADO</span><h1>Todo listo para cuidar<br/>mejor a tus mascotas.</h1><p>Administrá sus datos y encontrá un horario para su próxima visita.</p><Link to="/reservar" className="button white"><CalendarPlus size={17}/> Reservar un turno</Link></div><div className="welcome-art"><div className="pet-blob"><PawPrint size={86}/></div><span className="floating-heart"><HeartPulse size={22}/></span></div></div>
    {error && <div className="alert error">{error}</div>}
    <div className="section-heading"><div><span className="eyebrow">RESUMEN</span><h2>Tu cuenta</h2></div></div>
    <div className="stats-grid"><div className="stat-card"><span className="stat-icon mint"><PawPrint/></span><div><small>Mascotas registradas</small><strong>{pets.length}</strong></div></div><div className="stat-card"><span className="stat-icon peach"><CalendarClock/></span><div><small>Turnos próximos</small><strong>{upcoming.length}</strong></div></div><div className="stat-card"><span className="stat-icon lilac"><HeartPulse/></span><div><small>Servicios disponibles</small><strong>{services.length}</strong></div></div></div>
    <div className="dashboard-columns"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">AGENDA</span><h3>Próximos turnos</h3></div><Link to="/turnos" className="text-link">Ver todos <ArrowRight size={15}/></Link></div>{upcoming.length ? <div className="appointment-list">{upcoming.map((item) => <div className="appointment-row" key={item.id}><div className="date-tile"><strong>{new Intl.DateTimeFormat('es-AR',{day:'2-digit',timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(item.startAt))}</strong><small>{new Intl.DateTimeFormat('es-AR',{month:'short',timeZone:'America/Argentina/Buenos_Aires'}).format(new Date(item.startAt))}</small></div><div className="appointment-info"><strong>{item.petName} · {item.serviceName}</strong><small>{dateTime(item.startAt)} · {item.vetName}</small></div><span className={`status status-${item.status}`}>{item.status === 'pending' ? 'Pendiente' : 'Confirmado'}</span></div>)}</div> : <div className="empty-state"><CalendarClock size={28}/><strong>No tenés turnos próximos</strong><p>Cuando reserves una visita, la vas a ver acá.</p><Link to="/reservar" className="button secondary small">Reservar turno</Link></div>}</section>
    <section className="panel"><div className="panel-heading"><div><span className="eyebrow">FAMILIA</span><h3>Mis mascotas</h3></div><Link to="/mascotas" className="text-link">Administrar <ArrowRight size={15}/></Link></div>{pets.length ? <div className="pet-mini-list">{pets.slice(0,4).map((pet) => <div className="pet-mini" key={pet.id}><div className="pet-avatar"><PawPrint size={19}/></div><div><strong>{pet.name}</strong><small>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</small></div></div>)}</div> : <div className="empty-state"><PawPrint size={28}/><strong>Agregá tu primera mascota</strong><p>Creá su ficha para poder reservar turnos.</p><Link to="/mascotas" className="button secondary small"><Plus size={15}/> Agregar mascota</Link></div>}</section></div>
    <section className="panel services-panel"><div className="panel-heading"><div><span className="eyebrow">ATENCIÓN</span><h3>Servicios disponibles</h3></div><Link to="/reservar" className="text-link">Sacar turno <ArrowRight size={15}/></Link></div><div className="service-cards">{services.slice(0,4).map((service) => <div className="service-card" key={service.id}><div className="service-card-icon"><HeartPulse size={18}/></div><strong>{service.name}</strong><small>{service.durationMinutes} minutos</small><b>{money(service.price)}</b></div>)}</div></section>
  </>;
}
