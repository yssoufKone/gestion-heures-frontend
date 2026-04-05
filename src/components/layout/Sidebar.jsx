import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const adminMenus = [
    { icon: '📊', label: 'Tableau de bord', path: '/admin/dashboard' },
    { icon: '👨‍🏫', label: 'Enseignants', path: '/admin/enseignants' },
    { icon: '📚', label: 'Matières', path: '/admin/matieres' },
    { icon: '⏱️', label: 'Heures effectuées', path: '/admin/heures' },
    { icon: '📅', label: 'Années académiques', path: '/admin/annees' },
    { icon: '📈', label: 'État global', path: '/admin/etat-global' },
    { icon: '📤', label: 'Exports', path: '/admin/exports' },
    { icon: '👥', label: 'Utilisateurs', path: '/admin/utilisateurs' },
    { icon: '📋', label: "Journal d'audit", path: '/admin/audit' },
  ];

  const rhMenus = [
    { icon: '📊', label: 'Tableau de bord', path: '/rh/dashboard' },
    { icon: '👨‍🏫', label: 'Enseignants', path: '/rh/enseignants' },
    { icon: '⏱️', label: 'Heures effectuées', path: '/rh/heures' },
    { icon: '💰', label: 'États de paiement', path: '/rh/etat-paiement' },
    { icon: '📤', label: 'Exports', path: '/rh/exports' },
  ];

  const enseignantMenus = [
    { icon: '📊', label: 'Mes heures', path: '/enseignant/dashboard' },
    { icon: '📤', label: 'Mon récapitulatif', path: '/enseignant/recapitulatif' },
  ];

  const menus = user?.role === 'admin' ? adminMenus :
    user?.role === 'rh' ? rhMenus : enseignantMenus;

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '12px', left: '12px',
          zIndex: 1100,
          background: '#1e3a5f',
          border: 'none',
          borderRadius: '8px',
          width: '40px', height: '40px',
          cursor: 'pointer',
          fontSize: '18px',
          color: 'white'
        }}
        className="hamburger-btn"
      >☰</button>

      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          width: '240px',
          background: '#1e3a5f',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1000
        }}
      >
        <div style={{
          padding: '22px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            width: '36px', height: '36px',
            background: '#3b82f6', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>🎓</div>
          <span style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>GestHeure</span>
        </div>

        <div style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{
            fontSize: '10px', fontWeight: '600',
            letterSpacing: '1.2px', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', padding: '0 8px', marginBottom: '8px'
          }}>
            Navigation
          </div>
          {menus.map((menu, i) => (
            <div
              key={i}
              onClick={() => handleNavigate(menu.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '7px',
                color: location.pathname === menu.path ? 'white' : 'rgba(255,255,255,0.65)',
                background: location.pathname === menu.path ? 'rgba(59,130,246,0.25)' : 'transparent',
                fontSize: '13.5px', cursor: 'pointer', marginBottom: '2px',
                transition: 'all .15s'
              }}
            >
              <span>{menu.icon}</span>
              {menu.label}
            </div>
          ))}
        </div>

        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '8px', cursor: 'pointer'
          }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #1e3a5f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0
            }}>
              {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
                {user?.prenom} {user?.nom}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>
                {user?.role}
              </div>
            </div>
            <div
              onClick={logout}
              style={{ color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '16px' }}
              title="Déconnexion"
            >
              🚪
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .sidebar-overlay {
            display: block !important;
          }
          .sidebar {
            position: fixed !important;
            left: ${isOpen ? '0' : '-240px'} !important;
            top: 0 !important;
            height: 100vh !important;
            transition: left 0.3s ease !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;