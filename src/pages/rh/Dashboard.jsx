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
        const [e, h] = await Promise.all([
          api.get('/enseignants'),
          api.get('/heures')
        ]);
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
    { label: 'Heures en attente', value: heuresEnAttente, icon: '⏳', color: '#f59e0b' },
    { label: 'Heures validées', value: heuresValidees, icon: '✅', color: '#10b981' },
    { label: 'Total heures', value: heures.length, icon: '⏱️', color: '#6366f1' },
  ];

  if (loading) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <p>Chargement...</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Tableau de bord — Service RH
        </h1>
        <span style={{
          background: '#eff6ff', color: '#3b82f6',
          padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '500'
        }}>
          📅 Année 2025/2026
        </span>
      </div>

      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '20px',
              borderTop: `3px solid ${stat.color}`
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '20px', marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
            Répartition des heures par type
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="heures" fill="#3b82f6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Heures en attente */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600' }}>Heures en attente de validation</h2>
            <span style={{
              background: '#fffbeb', color: '#d97706',
              padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '500'
            }}>{heuresEnAttente} en attente</span>
          </div>
          <div style={{ padding: '0 20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Date', 'Enseignant', 'Matière', 'Type', 'Durée', 'Action'].map((h, i) => (
                    <th key={i} style={{
                      textAlign: 'left', fontSize: '11px', fontWeight: '600',
                      textTransform: 'uppercase', letterSpacing: '0.8px',
                      color: '#64748b', padding: '12px 0',
                      borderBottom: '1px solid #e2e8f0'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heures.filter(h => !h.valide).map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.date}</td>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.enseignant?.prenom} {h.enseignant?.nom}</td>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.matiere?.intitule}</td>
                    <td style={{ padding: '13px 0' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                        background: h.typeHeure === 'CM' ? '#eff6ff' : h.typeHeure === 'TD' ? '#f0fdf4' : '#fffbeb',
                        color: h.typeHeure === 'CM' ? '#2563eb' : h.typeHeure === 'TD' ? '#16a34a' : '#d97706'
                      }}>{h.typeHeure}</span>
                    </td>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.duree}h</td>
                    <td style={{ padding: '13px 0' }}>
                      <button
                        onClick={async () => {
                          await api.put(`/heures/valider/${h.id}`);
                          const res = await api.get('/heures');
                          setHeures(res.data.data);
                        }}
                        style={{
                          padding: '5px 12px', borderRadius: '6px',
                          border: '1px solid #bbf7d0', background: '#f0fdf4',
                          fontSize: '12px', cursor: 'pointer', color: '#16a34a'
                        }}
                      >✅ Valider</button>
                    </td>
                  </tr>
                ))}
                {heures.filter(h => !h.valide).length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      Aucune heure en attente ✅
                    </td>
                  </tr>
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