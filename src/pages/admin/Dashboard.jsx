import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [heures, setHeures] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [anneeSelectionnee, setAnneeSelectionnee] = useState('');
  const [etatEnseignants, setEtatEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (anneeId) => {
    try {
      setLoading(true);
      const [e, m, h, a] = await Promise.all([
        api.get('/enseignants'),
        api.get('/matieres'),
        api.get('/heures'),
        api.get('/annees'),
      ]);
      setEnseignants(e.data.data);
      setMatieres(m.data.data);
      setAnnees(a.data.data);
      const heuresFiltrees = anneeId
        ? h.data.data.filter(heure => heure.anneeAcademiqueId?.toString() === anneeId.toString())
        : h.data.data;
      setHeures(heuresFiltrees);
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

  useEffect(() => {
    const init = async () => {
      const a = await api.get('/annees');
      const anneesList = a.data.data;
      setAnnees(anneesList);
      const anneeActive = anneesList.find(a => a.active) || anneesList[0];
      if (anneeActive) {
        setAnneeSelectionnee(anneeActive.id.toString());
        fetchData(anneeActive.id);
      } else {
        fetchData(null);
      }
    };
    init();
  }, []);

  const handleAnneeChange = (anneeId) => {
    setAnneeSelectionnee(anneeId);
    fetchData(anneeId);
  };

  const totalCM = heures.filter(h => h.typeHeure === 'CM').reduce((acc, h) => acc + h.duree, 0);
  const totalTD = heures.filter(h => h.typeHeure === 'TD').reduce((acc, h) => acc + h.duree, 0);
  const totalTP = heures.filter(h => h.typeHeure === 'TP').reduce((acc, h) => acc + h.duree, 0);
  const chartTypeData = [
    { type: 'CM', heures: totalCM },
    { type: 'TD', heures: totalTD },
    { type: 'TP', heures: totalTP },
  ];
  const departements = [...new Set(enseignants.map(e => e.departement))];
  const chartDeptData = departements.map(dept => {
    const enseignantsDept = etatEnseignants.filter(e => e.departement === dept);
    const totalHeures = enseignantsDept.reduce((acc, e) => acc + (e.totaux?.totalEquivalent || 0), 0);
    return { departement: dept, heures: totalHeures };
  });
  const filieres = [...new Set(matieres.map(m => m.filiere))];
  const chartFiliereData = filieres.map(filiere => ({
    name: filiere,
    value: matieres.filter(m => m.filiere === filiere).length
  }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];
  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const chartMensuelData = moisLabels.map((mois, i) => ({
    mois,
    heures: heures.filter(h => new Date(h.date).getMonth() === i).reduce((acc, h) => acc + h.duree, 0)
  }));
  const enDepassement = etatEnseignants.filter(e => e.enDepassement);
  const stats = [
    { label: 'Enseignants actifs', value: enseignants.length, icon: '👨‍🏫', color: '#3b82f6' },
    { label: 'Matières', value: matieres.length, icon: '📚', color: '#10b981' },
    { label: 'Heures enregistrées', value: heures.length, icon: '⏱️', color: '#f59e0b' },
    { label: 'En dépassement', value: enDepassement.length, icon: '⚠️', color: '#ef4444' },
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
        .dashboard-topbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 20px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dashboard-content {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 768px) {
          .dashboard-topbar {
            padding: 0 16px 0 60px;
          }
          .dashboard-content {
            padding: 12px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="dashboard-topbar">
        <h1 style={{ fontSize: '16px', fontWeight: '600', color: '#1e3a5f' }}>Tableau de bord</h1>
        <select
          value={anneeSelectionnee}
          onChange={e => handleAnneeChange(e.target.value)}
          style={{
            padding: '6px 10px', border: '1.5px solid #e2e8f0',
            borderRadius: '8px', fontSize: '12px', outline: 'none',
            background: '#eff6ff', color: '#3b82f6', fontWeight: '500', cursor: 'pointer'
          }}
        >
          <option value="">Toutes les années</option>
          {annees.map(a => <option key={a.id} value={a.id}>📅 {a.libelle}</option>)}
        </select>
      </div>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '16px',
              borderTop: `3px solid ${stat.color}`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="charts-grid">
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Heures par type</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartTypeData}>
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="heures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Matières par filière</h2>
            {chartFiliereData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={chartFiliereData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                    label={({ name, value }) => `${name}(${value})`} labelLine={false}>
                    {chartFiliereData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 0', fontSize: '13px' }}>Aucune matière</div>
            )}
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Heures par département</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartDeptData}>
                <XAxis dataKey="departement" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="heures" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>Statistiques mensuelles</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartMensuelData}>
                <XAxis dataKey="mois" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="heures" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enseignants en dépassement */}
        {enDepassement.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '600' }}>⚠️ Enseignants en dépassement</h2>
              <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500' }}>{enDepassement.length}</span>
            </div>
            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr>
                    {['Enseignant', 'Dept.', 'H.Contract.', 'H.Effectuées', 'H.Compl.', 'Montant'].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enDepassement.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: '#fffbeb' }}>
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '500' }}>{e.prenom} {e.nom}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px' }}>{e.departement}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px' }}>{e.heuresContractuelles}h</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px' }}>{e.totaux?.totalEquivalent}h</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#d97706', fontWeight: '600' }}>+{e.heuresComplementaires}h</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: '600', color: '#1e3a5f' }}>{e.montant?.toLocaleString()} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tableau enseignants */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '13px', fontWeight: '600' }}>Tous les enseignants</h2>
          </div>
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr>
                  {['Nom', 'Grade', 'Département', 'Statut', 'H. Effectuées', 'H. Compl.'].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', color: '#64748b', padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {etatEnseignants.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: '500' }}>{e.prenom} {e.nom}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{e.grade}</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{e.departement}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500', background: e.statut === 'Permanent' ? '#f0fdf4' : '#eff6ff', color: e.statut === 'Permanent' ? '#16a34a' : '#2563eb' }}>{e.statut}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px' }}>{e.totaux?.totalEquivalent || 0}h</td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: e.heuresComplementaires > 0 ? '#d97706' : '#64748b', fontWeight: e.heuresComplementaires > 0 ? '600' : '400' }}>
                      {e.heuresComplementaires > 0 ? `+${e.heuresComplementaires}h ⚠️` : '—'}
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