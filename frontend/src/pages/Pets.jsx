import { useEffect, useState } from 'react';
import { PawPrint, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { api, dateOnly } from '../api';

const emptyForm = { name: '', species: 'Perro', breed: '', birthDate: '', notes: '' };

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function load() { const data = await api('/pets'); setPets(data.pets); }
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  function startNew() { setEditingId(null); setForm(emptyForm); setError(''); setShowForm(true); }
  function startEdit(pet) { setEditingId(pet.id); setForm({ name: pet.name, species: pet.species, breed: pet.breed || '', birthDate: pet.birthDate ? String(pet.birthDate).slice(0,10) : '', notes: pet.notes || '' }); setError(''); setShowForm(true); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = { ...form, birthDate: form.birthDate || undefined };
      await api(editingId ? `/pets/${editingId}` : '/pets', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      setShowForm(false); setForm(emptyForm); setEditingId(null); await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(pet) {
    if (!window.confirm(`¿Eliminar la ficha de ${pet.name}? No se podrá borrar si tiene turnos asociados.`)) return;
    try { await api(`/pets/${pet.id}`, { method: 'DELETE' }); await load(); }
    catch (err) { setError(err.message); }
  }
  return <>
    <div className="page-title-row"><div><span className="eyebrow">REGISTROS</span><h1>Mis mascotas</h1><p>Guardá la información necesaria para organizar su atención veterinaria.</p></div><button className="button primary" onClick={startNew}><Plus size={17}/> Agregar mascota</button></div>
    {error && <div className="alert error">{error}</div>}
    {showForm && <div className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">FICHA DE MASCOTA</span><h3>{editingId ? 'Editar información' : 'Nueva mascota'}</h3></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Cerrar"><X size={18}/></button></div><form className="form-grid" onSubmit={submit}><label>Nombre<input required maxLength="80" placeholder="Ej. Mora" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></label><label>Especie<select value={form.species} onChange={(e)=>setForm({...form,species:e.target.value})}><option>Perro</option><option>Gato</option><option>Otro</option><option>Ave</option><option>Conejo</option></select></label><label>Raza <span className="optional">(opcional)</span><input maxLength="80" placeholder="Ej. Mestizo" value={form.breed} onChange={(e)=>setForm({...form,breed:e.target.value})}/></label><label>Fecha de nacimiento <span className="optional">(opcional)</span><input type="date" max={new Date().toISOString().slice(0,10)} value={form.birthDate} onChange={(e)=>setForm({...form,birthDate:e.target.value})}/></label><label className="full-field">Observaciones <span className="optional">(opcional)</span><textarea rows="3" maxLength="1000" placeholder="Alergias, antecedentes o información importante…" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></label><div className="form-actions"><button type="button" className="button ghost" onClick={()=>setShowForm(false)}>Cancelar</button><button className="button primary" disabled={busy}><Save size={16}/>{busy ? 'Guardando…' : 'Guardar ficha'}</button></div></form></div>}
    {pets.length ? <div className="pet-grid">{pets.map((pet) => <article className="pet-card" key={pet.id}><div className="pet-card-top"><div className="pet-card-icon"><PawPrint size={24}/></div><div className="pet-actions"><button className="icon-button" onClick={()=>startEdit(pet)} title="Editar"><Pencil size={16}/></button><button className="icon-button danger-icon" onClick={()=>remove(pet)} title="Eliminar"><Trash2 size={16}/></button></div></div><h3>{pet.name}</h3><p className="pet-species">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p><div className="pet-detail-line"><span>Fecha de nacimiento</span><strong>{pet.birthDate ? dateOnly(pet.birthDate) : 'Sin informar'}</strong></div>{pet.notes && <div className="pet-notes">{pet.notes}</div>}</article>)}</div> : !showForm && <div className="panel empty-state large-empty"><PawPrint size={34}/><h3>Todavía no registraste mascotas</h3><p>Creá una ficha por cada mascota para reservar turnos más rápido.</p><button className="button primary" onClick={startNew}><Plus size={17}/> Agregar primera mascota</button></div>}
  </>;
}
