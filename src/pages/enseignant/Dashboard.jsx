import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EnseignantDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profilRes = await api.get('/auth/mon-profil-enseignant');
        const enseignant = profilRes.data.data;
        if (enseignant) {
          const res = await api.get(`/heures/enseignant/${enseignant.id}`);
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '200px' }}>
        <p>Chargement...</p>
      </div>
    </Layout>
  );

  if (!data) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '200px' }}>
        <p style={{ color: '#64748b' }}>Aucun profil enseignant associé à votre compte.</p>
      </div>
    </Layout>
  );

  const typeColors = {
    'CM': { bg: '#eff6ff', color: '#2563eb' },
    'TD': { bg: '#f0fdf4', color: '#16a34a' },
    'TP': { bg: '#fffbeb', color: '#d97706' },
  };

  return (
    <Layout>
      <style>{`
        .ens-topbar { background: white; border-bottom: 1px solid #e2e8f0; padding: 0 20px; height: 58px; display: flex; align-items: center; justify-content: space-between; }
        .ens-content { padding: 16px; overflow-y: auto; flex: 1; }
        .ens-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .ens-recap { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 768px) {
          .ens-topbar { padding: 0 16px 0 60px; }
          .ens-topbar h1 { font-size: 14px !important; }
          .ens-content { padding: 12px; }
          .ens-stats { grid-template-columns: repeat(2, 1fr); }
          .ens-recap { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ens-topbar">
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>Mes Heures</h1>
        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '500' }}>📅 2025/2026</span>
      </div>

      <div className="ens-content">
        <div className="ens-stats">
          {[
            { label: 'Total CM', value: `${data.totaux.totalCM}h`, icon: '📖', color: '#3b82f6' },
            { label: 'Total TD', value: `${data.totaux.totalTD}h`, icon: '📝', color: '#10b981' },
            { label: 'Total TP', value: `${data.totaux.totalTP}h`, icon: '🔬', color: '#f59e0b' },
            { label: 'H. Compl.', value: `${data.heuresComplementaires}h`, icon: '➕', color: '#ef4444' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderTop: `3px solid ${stat.color}` }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Récapitulatif</h2>
          <div className="ens-recap">
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Heures contractuelles</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f' }}>{data.heuresContractuelles}h</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Total équivalent</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a5f' }}>{data.totaux.totalEquivalent}h</div>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Montant à payer</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>{data.montant} FCFA</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600' }}>Détail de mes heures</h2>
          </div>
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  {['Date', 'Matière', 'Type', 'Durée', 'Salle', 'Statut'].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.heures.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>Aucune heure enregistrée</td></tr>
                ) : data.heures.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.date}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.matiere?.intitule}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500', background: typeColors[h.typeHeure]?.bg, color: typeColors[h.typeHeure]?.color }}>{h.typeHeure}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.duree}h</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.salle || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500', background: h.valide ? '#f0fdf4' : '#fffbeb', color: h.valide ? '#16a34a' : '#d97706' }}>{h.valide ? '✅ Validée' : '⏳ Attente'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnseignantDashboard;