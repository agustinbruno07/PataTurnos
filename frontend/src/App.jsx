import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import Pets from './pages/Pets';
import Booking from './pages/Booking';
import Appointments from './pages/Appointments';
import VetDashboard from './pages/VetDashboard';
import AdminDashboard from './pages/AdminDashboard';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando PataTurnos…</div>;
  if (!user) return <Navigate to="/login" replace/>;
  return <Navigate to={user.role==='admin'?'/admin':user.role==='vet'?'/veterinario':'/inicio'} replace/>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/registro" element={<RegisterPage/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route element={<Layout/>}>
        <Route path="/inicio" element={<ProtectedRoute roles={['client']}/> }><Route index element={<Dashboard/>}/></Route>
        <Route path="/mascotas" element={<ProtectedRoute roles={['client']}/> }><Route index element={<Pets/>}/></Route>
        <Route path="/reservar" element={<ProtectedRoute roles={['client']}/> }><Route index element={<Booking/>}/></Route>
        <Route path="/turnos" element={<Appointments/>}/>
        <Route path="/veterinario" element={<ProtectedRoute roles={['vet']}/> }><Route index element={<VetDashboard/>}/></Route>
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}/> }><Route index element={<AdminDashboard/>}/></Route>
      </Route>
    </Route>
    <Route path="/" element={<HomeRedirect/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes/></AuthProvider></BrowserRouter>;
}
