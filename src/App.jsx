import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Enseignants from './pages/admin/Enseignants';
import Matieres from './pages/admin/Matieres';
import Heures from './pages/admin/Heures';
import AnneeAcademique from './pages/admin/AnneeAcademique';
import Exports from './pages/admin/Exports';
import Utilisateurs from './pages/admin/Utilisateurs';
import AuditLog from './pages/admin/AuditLog';
import EtatGlobal from './pages/admin/EtatGlobal';
import RhDashboard from './pages/rh/Dashboard';
import RhHeures from './pages/rh/Heures';
import EtatPaiement from './pages/rh/EtatPaiement';
import EnseignantDashboard from './pages/enseignant/Dashboard';
import Recapitulatif from './pages/enseignant/Recapitulatif';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Routes Admin */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['admin']}><Dashboard /></PrivateRoute>
          } />
          <Route path="/admin/enseignants" element={
            <PrivateRoute roles={['admin']}><Enseignants /></PrivateRoute>
          } />
          <Route path="/admin/matieres" element={
            <PrivateRoute roles={['admin']}><Matieres /></PrivateRoute>
          } />
          <Route path="/admin/heures" element={
            <PrivateRoute roles={['admin']}><Heures /></PrivateRoute>
          } />
          <Route path="/admin/annees" element={
            <PrivateRoute roles={['admin']}><AnneeAcademique /></PrivateRoute>
          } />
          <Route path="/admin/exports" element={
            <PrivateRoute roles={['admin']}><Exports /></PrivateRoute>
          } />
          <Route path="/admin/utilisateurs" element={
            <PrivateRoute roles={['admin']}><Utilisateurs /></PrivateRoute>
          } />
          <Route path="/admin/audit" element={
            <PrivateRoute roles={['admin']}><AuditLog /></PrivateRoute>
          } />
          <Route path="/admin/etat-global" element={
            <PrivateRoute roles={['admin']}><EtatGlobal /></PrivateRoute>
          } />

          {/* Routes RH */}
          <Route path="/rh/dashboard" element={
            <PrivateRoute roles={['rh']}><RhDashboard /></PrivateRoute>
          } />
          <Route path="/rh/enseignants" element={
            <PrivateRoute roles={['rh']}><Enseignants /></PrivateRoute>
          } />
          <Route path="/rh/heures" element={
            <PrivateRoute roles={['rh']}><RhHeures /></PrivateRoute>
          } />
          <Route path="/rh/exports" element={
            <PrivateRoute roles={['rh']}><Exports /></PrivateRoute>
          } />
          <Route path="/rh/etat-paiement" element={
            <PrivateRoute roles={['rh']}><EtatPaiement /></PrivateRoute>
          } />

          {/* Routes Enseignant */}
          <Route path="/enseignant/dashboard" element={
            <PrivateRoute roles={['enseignant']}><EnseignantDashboard /></PrivateRoute>
          } />
          <Route path="/enseignant/recapitulatif" element={
            <PrivateRoute roles={['enseignant']}><Recapitulatif /></PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;