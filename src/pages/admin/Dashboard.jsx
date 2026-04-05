import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [heures, setHeures] = useState([]);
  const [etatEnseignants, setEtatEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, m, h] = await Promise.all([
          api.get('/enseignants'),
          api.get('/matieres'),
          api.get('/heures'),
        ]);
        setEnseignants(e.data.data);
        setMatieres(m.data.data);
        setHeures(h.data.data);

        // Calcul état par enseignant
        const etats = await Promise.all(
          e.data.data.map(async (ens) => {
            const res = await api.get(`/heures/enseignant/${ens.id}`);
            return {
              ...ens,
              totaux: res.data.data.totaux,
              heuresComplementaires: res.data.data.heuresComplementaires,
              montant: res.data.data.montant,
              enDepassement: res.data.data.heuresComplementaires > 0
            };
          })
        );
        setEtatEnseignants(etats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats générales
  const totalCM = heures.filter(h => h.typeHeure === 'CM').reduce((acc, h) => acc + h.duree, 0);
  const totalTD = heures.filter(h => h.typeHeure === 'TD').reduce((acc, h) => acc + h.duree, 0);
  const totalTP = heures.filter(h => h.typeHeure === 'TP').reduce((acc, h) => acc + h.duree, 0);

  // Chart répartition par type
  const chartTypeData = [
    { type: 'CM', heures: totalCM },
    { type: 'TD', heures: totalTD },
    { type: 'TP', heures: totalTP },
  ];

  // Heures par département
  const departements = [...new Set(enseignants.map(e => e.departement))];
  const chartDeptData = departements.map(dept => {
    const enseignantsDept = etatEnseignants.filter(e => e.departement === dept);
    const totalHeures = enseignantsDept.reduce((acc, e) => acc + (e.totaux?.totalEquivalent || 0), 0);
    return { departement: dept, heures: totalHeures };
  });

  // Répartition par filière
  const filieres = [...new Set(matieres.map(m => m.filiere))];
  const chartFiliereData = filieres.map(filiere => {
    const matieresFil = matieres.filter(m => m.filiere === filiere);
    return { name: filiere, value: matieresFil.length };
  });
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

  // Statistiques mensuelles
  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const chartMensuelData = moisLabels.map((mois, i) => {
    const heuresMois = heures.filter(h => {
      const date = new Date(h.date);
      return date.getMonth() === i;
    });
    return {
      mois,
      heures: heuresMois.reduce((acc, h) => acc + h.duree, 0)
    };
  });

  // Enseignants en dépassement
  const enDepassement = etatEnseignants.filter(e => e.enDepassement);

  const stats = [
    { label: 'Enseignants actifs', value: enseignants.length, icon: '👨‍🏫', color: '#3b82f6' },
    { label: 'Matières', value: matieres.length, icon: '📚', color: '#10b981' },
    { label: 'Heures enregistrées', value: heures.length, icon: '⏱️', color: '#f59e0b' },
    { label: 'En dépassement', value: enDepassement.length, icon: '⚠️', color: '#ef4444' },
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
          Tableau de bord
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

        {/* Graphiques ligne 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

          {/* Répartition par type */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '20px'
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              Répartition des heures par type
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartTypeData}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="heures" fill="#3b82f6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition par filière */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '20px'
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              Répartition des matières par filière
            </h2>
            {chartFiliereData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartFiliereData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {chartFiliereData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>
                Aucune matière enregistrée
              </div>
            )}
          </div>
        </div>

        {/* Graphiques ligne 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

          {/* Heures par département */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '20px'
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              Heures totales par département
            </h2>
            {chartDeptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartDeptData}>
                  <XAxis dataKey="departement" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="heures" fill="#10b981" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>
                Aucune donnée disponible
              </div>
            )}
          </div>

          {/* Statistiques mensuelles */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '20px'
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
              Statistiques mensuelles
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartMensuelData}>
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="heures" fill="#f59e0b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enseignants en dépassement */}
        {enDepassement.length > 0 && (
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', overflow: 'hidden', marginBottom: '24px'
          }}>
            <div style={{
              padding: '18px 20px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600' }}>⚠️ Enseignants en dépassement</h2>
              <span style={{
                background: '#fef2f2', color: '#dc2626',
                padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '500'
              }}>{enDepassement.length} enseignant(s)</span>
            </div>
            <div style={{ padding: '0 20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Enseignant', 'Département', 'H. Contract.', 'H. Effectuées', 'H. Compl.', 'Montant'].map((h, i) => (
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
                  {enDepassement.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: '#fffbeb' }}>
                      <td style={{ padding: '13px 0', fontSize: '13.5px', fontWeight: '500' }}>
                        {e.prenom} {e.nom}
                      </td>
                      <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{e.departement}</td>
                      <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{e.heuresContractuelles}h</td>
                      <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{e.totaux?.totalEquivalent}h</td>
                      <td style={{ padding: '13px 0', fontSize: '13.5px', color: '#d97706', fontWeight: '600' }}>
                        +{e.heuresComplementaires}h
                      </td>
                      <td style={{ padding: '13px 0', fontSize: '13.5px', fontWeight: '600', color: '#1e3a5f' }}>
                        {e.montant?.toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tableau enseignants */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '18px 20px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: '600' }}>Tous les enseignants</h2>
          </div>
          <div style={{ padding: '0 20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Nom', 'Grade', 'Département', 'Statut', 'H. Effectuées', 'H. Compl.'].map((h, i) => (
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
                {etatEnseignants.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '13px 0', fontSize: '13.5px', fontWeight: '500' }}>
                      {e.prenom} {e.nom}
                    </td>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{e.grade}</td>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{e.departement}</td>
                    <td style={{ padding: '13px 0' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                        background: e.statut === 'Permanent' ? '#f0fdf4' : '#eff6ff',
                        color: e.statut === 'Permanent' ? '#16a34a' : '#2563eb'
                      }}>{e.statut}</span>
                    </td>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{e.totaux?.totalEquivalent || 0}h</td>
                    <td style={{ padding: '13px 0', fontSize: '13.5px' }}>
                      <span style={{
                        color: e.heuresComplementaires > 0 ? '#d97706' : '#64748b',
                        fontWeight: e.heuresComplementaires > 0 ? '600' : '400'
                      }}>
                        {e.heuresComplementaires > 0 ? `+${e.heuresComplementaires}h ⚠️` : '—'}
                      </span>
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

export default Dashboard;