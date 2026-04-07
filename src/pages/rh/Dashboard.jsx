import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RhDashboard = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [heures, setHeures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, h] = await Promise.all([api.get('/enseignants'), api.get('/heures')]);
        setEnseignants(e.data.data);
        setHeures(h.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const heuresEnAttente = heures.filter(h => !h.valide).length;
  const heuresValidees = heures.filter(h => h.valide).length;
  const totalCM = heures.filter(h => h.typeHeure === 'CM').reduce((acc, h) => acc + h.duree, 0);
  const totalTD = heures.filter(h => h.typeHeure === 'TD').reduce((acc, h) => acc + h.duree, 0);
  const totalTP = heures.filter(h => h.typeHeure === 'TP').reduce((acc, h) => acc + h.duree, 0);
  const chartData = [
    { type: 'CM', heures: totalCM },
    { type: 'TD', heures: totalTD },
    { type: 'TP', heures: totalTP },
  ];
  const stats = [
    { label: 'Enseignants', value: enseignants.length, icon: '👨‍🏫', color: '#3b82f6' },
    { label: 'En attente', value: heuresEnAttente, icon: '⏳', color: '#f59e0b' },
    { label: 'Validées', value: heuresValidees, icon: '✅', color: '#10b981' },
    { label: 'Total heures', value: heures.length, icon: '⏱️', color: '#6366f1' },
  ];

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '200px' }}>
        <p>Chargement...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <style>{`
        .rh-topbar { background: white; border-bottom: 1px solid #e2e8f0; padding: 0 20px; height: 58px; display: flex; align-items: center; justify-content: space-between; }
        .rh-content { padding: 16px; overflow-y: auto; flex: 1; }
        .rh-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
        .table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 768px) {
          .rh-topbar { padding: 0 16px 0 60px; }
          .rh-topbar h1 { font-size: 14px !important; }
          .rh-content { padding: 12px; }
          .rh-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="rh-topbar">
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>Tableau de bord — RH</h1>
        <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '500' }}>📅 2025/2026</span>
      </div>

      <div className="rh-content">
        <div className="rh-stats">
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', borderTop: `3px solid ${stat.color}` }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Répartition des heures par type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="heures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600' }}>Heures en attente de validation</h2>
            <span style={{ background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500' }}>{heuresEnAttente} en attente</span>
          </div>
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
              <thead>
                <tr>
                  {['Date', 'Enseignant', 'Matière', 'Type', 'Durée', 'Action'].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heures.filter(h => !h.valide).map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.date}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.enseignant?.prenom} {h.enseignant?.nom}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.matiere?.intitule}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500', background: h.typeHeure === 'CM' ? '#eff6ff' : h.typeHeure === 'TD' ? '#f0fdf4' : '#fffbeb', color: h.typeHeure === 'CM' ? '#2563eb' : h.typeHeure === 'TD' ? '#16a34a' : '#d97706' }}>{h.typeHeure}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{h.duree}h</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={async () => {
                          await api.put(`/heures/valider/${h.id}`);
                          const res = await api.get('/heures');
                          setHeures(res.data.data);
                        }}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', fontSize: '11px', cursor: 'pointer', color: '#16a34a' }}
                      >✅ Valider</button>
                    </td>
                  </tr>
                ))}
                {heures.filter(h => !h.valide).length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>Aucune heure en attente ✅</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RhDashboard;