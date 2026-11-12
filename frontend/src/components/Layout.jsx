import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Cat, ClipboardList, LayoutDashboard, LogOut, PawPrint, ShieldCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin'
    ? [{ to: '/admin', label: 'Panel', icon: LayoutDashboard }, { to: '/turnos', label: 'Turnos', icon: CalendarDays }]
    : user?.role === 'vet'
      ? [{ to: '/veterinario', label: 'Mi agenda', icon: Stethoscope }, { to: '/turnos', label: 'Turnos', icon: ClipboardList }]
      : [{ to: '/inicio', label: 'Inicio', icon: LayoutDashboard }, { to: '/mascotas', label: 'Mis mascotas', icon: PawPrint }, { to: '/reservar', label: 'Reservar turno', icon: CalendarDays }, { to: '/turnos', label: 'Mis turnos', icon: ClipboardList }];

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to={user?.role === 'admin' ? '/admin' : user?.role === 'vet' ? '/veterinario' : '/inicio'} className="brand">
          <span className="brand-mark"><PawPrint size={22} /></span>
          <span><strong>PataTurnos</strong><small>Clínica veterinaria</small></span>
        </NavLink>
        <div className="nav-caption">MENÚ PRINCIPAL</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/inicio'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} />{label}</NavLink>)}
          {user?.role === 'admin' && <div className="nav-note"><ShieldCheck size={15} /> Administración</div>}
          {user?.role === 'vet' && <div className="nav-note"><Stethoscope size={15} /> Área veterinaria</div>}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-chip"><div className="avatar">{user?.fullName?.charAt(0)?.toUpperCase() || 'P'}</div><div className="user-meta"><strong>{user?.fullName}</strong><small>{user?.role === 'client' ? 'Cliente' : user?.role === 'vet' ? 'Veterinario/a' : 'Administrador/a'}</small></div></div>
          <button className="logout-button" onClick={handleLogout}><LogOut size={17} /> Cerrar sesión</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar"><div><span className="topbar-eyebrow">GESTIÓN VETERINARIA</span><strong>Hola, {user?.fullName?.split(' ')[0] || 'bienvenido/a'}</strong></div><div className="topbar-paw"><Cat size={21} /><span>El cuidado empieza con una buena organización.</span></div></header>
        <div className="page-content"><Outlet /></div>
        <footer className="footer">PataTurnos <span>·</span> Cuidamos a quienes forman parte de tu familia.</footer>
      </main>
    </div>
  );
}
