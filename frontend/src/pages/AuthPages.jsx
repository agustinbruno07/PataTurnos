import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PawPrint, ShieldCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AuthFrame({ children, headline, subhead }) {
  return <div className="auth-page"><section className="auth-visual"><div className="auth-logo"><span><PawPrint size={23} /></span><strong>PataTurnos</strong></div><div className="auth-visual-copy"><span className="eyebrow-light">UNA CLÍNICA MÁS ORGANIZADA</span><h1>Su salud merece<br /><em>todo nuestro cuidado.</em></h1><p>Turnos claros, información ordenada y más tiempo para cuidar a tus mascotas.</p><div className="auth-feature"><span><Stethoscope size={18} /></span> Atención veterinaria organizada</div><div className="auth-feature"><span><ShieldCheck size={18} /></span> Tus datos, protegidos</div></div><div className="auth-visual-foot">PataTurnos · Gestión veterinaria</div></section><section className="auth-form-side"><div className="auth-card"><div className="auth-heading"><div className="auth-mobile-mark"><PawPrint size={22}/></div><span className="eyebrow">BIENVENIDO/A A PATATURNOS</span><h2>{headline}</h2><p>{subhead}</p></div>{children}</div></section></div>;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'vet' ? '/veterinario' : '/'} replace />;
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { const current = await login(form.email, form.password); navigate(current.role === 'admin' ? '/admin' : current.role === 'vet' ? '/veterinario' : '/'); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <AuthFrame headline="Ingresá a tu cuenta" subhead="Accedé para gestionar tus mascotas y turnos."><form className="form-stack" onSubmit={submit}><label>Correo electrónico<input type="email" autoComplete="email" required placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label><label>Contraseña<input type="password" autoComplete="current-password" required placeholder="Tu contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/></label>{error && <div className="alert error">{error}</div>}<button className="button primary full" disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</button></form><p className="auth-switch">¿Todavía no tenés cuenta? <Link to="/registro">Crear cuenta</Link></p></AuthFrame>;
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  async function submit(event) {
    event.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.');
    setBusy(true);
    try { await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password }); navigate('/'); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <AuthFrame headline="Creá tu cuenta" subhead="Registrate para administrar las fichas y los turnos de tus mascotas."><form className="form-stack" onSubmit={submit}><label>Nombre y apellido<input required minLength="2" maxLength="120" autoComplete="name" placeholder="Ej. Martina López" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}/></label><label>Correo electrónico<input required type="email" autoComplete="email" placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label><label>Teléfono <span className="optional">(opcional)</span><input type="tel" autoComplete="tel" placeholder="11 1234 5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/></label><div className="two-fields"><label>Contraseña<input required type="password" minLength="8" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/></label><label>Repetir contraseña<input required type="password" autoComplete="new-password" placeholder="Repetí la clave" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}/></label></div>{error && <div className="alert error">{error}</div>}<button className="button primary full" disabled={busy}>{busy ? 'Creando cuenta…' : 'Crear mi cuenta'}</button></form><p className="auth-switch">¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link></p></AuthFrame>;
}
