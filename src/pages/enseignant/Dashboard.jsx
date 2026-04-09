import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EnseignantDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Récupérer le profil de l'enseignant connecté
        const profilRes = await api.get('/auth/mon-profil-enseignant');
        const enseignant = profilRes.data.data;

        if (!enseignant || !enseignant.id) {
          throw new Error('Aucun profil enseignant associé à votre compte.');
        }

        // 2. Récupérer ses heures
        const heuresRes = await api.get(`/heures/enseignant/${enseignant.id}`);
        setData(heuresRes.data.data);

      } catch (err) {
        console.error(err);
        setError(
          err.response?.status === 403
            ? "Accès refusé. Le rôle 'enseignant' n'est pas autorisé sur ces routes."
            : err.message || 'Erreur lors du chargement de vos heures.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'enseignant') {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
          <p>Chargement de vos heures...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ padding: '28px' }}>
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px' }}>{error}</p>
            <p style={{ fontSize: '13px', marginTop: '10px', color: '#64748b' }}>
              Vérifie les permissions backend pour le rôle <strong>enseignant</strong>.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '300px' }}>
          <p style={{ color: '#64748b' }}>Aucune donnée disponible.</p>
        </div>
      </Layout>
    );
  }

  const typeColors = {
    'CM': { bg: '#eff6ff', color: '#2563eb' },
    'TD': { bg: '#f0fdf4', color: '#16a34a' },
    'TP': { bg: '#fffbeb', color: '#d97706' },
  };

  return (
    <Layout>
      {/* Le reste de ton code (style + JSX) reste EXACTEMENT le même */}
      {/* Je ne le recopie pas pour gagner de la place, mais tu peux le garder tel quel */}

      <div className="ens-topbar">
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>Mes Heures</h1>
        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '500' }}>📅 2025/2026</span>
      </div>

      <div className="ens-content">
        {/* Tout ton contenu (stats, récap, tableau) reste identique */}
        {/* ... */}
      </div>
    </Layout>
  );
};

export default EnseignantDashboard;