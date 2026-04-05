import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const EtatGlobal = () => {
  const [annees, setAnnees] = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [etat, setEtat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  useEffect(() => {
    const fetchAnnees = async () => {
      try {
        const res = await api.get('/annees');
        setAnnees(res.data.data);
        if (res.data.data.length > 0) setAnneeId(res.data.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnnees();
  }, []);

  const genererEtat = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/exports/etat-global/${anneeId}`);
      setEtat(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoadingExport(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/exports/excel/${anneeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'etat_global.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExport(false);
    }
  };

  return (
    <Layout>
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          État Global des Heures
        </h1>
        {etat && (
          <button
            onClick={handleExportExcel}
            disabled={loadingExport}
            style={{
              background: '#10b981', color: 'white',
              border: 'none', borderRadius: '8px',
              padding: '8px 18px', fontSize: '14px',
              fontWeight: '500', cursor: 'pointer'
            }}
          >⬇️ Exporter Excel</button>
        )}
      </div>

      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>

        {/* Filtres */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '20px', marginBottom: '24px',
          display: 'flex', alignItems: 'flex-end', gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
              Année académique
            </label>
            <select
              value={anneeId}
              onChange={e => setAnneeId(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                fontSize: '14px', outline: 'none', background: '#f8fafc'
              }}
            >
              {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>
          <button
            onClick={genererEtat}
            disabled={loading}
            style={{
              background: '#1e3a5f', color: 'white',
              border: 'none', borderRadius: '8px',
              padding: '10px 24px', fontSize: '14px',
              fontWeight: '500', cursor: 'pointer'
            }}
          >{loading ? 'Génération...' : '📊 Générer l\'état'}</button>
        </div>

        {etat && (
          <>
            {/* Stats générales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total CM', value: `${etat.totalGeneral.totalCM}h`, icon: '📖', color: '#3b82f6' },
                { label: 'Total TD', value: `${etat.totalGeneral.totalTD}h`, icon: '📝', color: '#10b981' },
                { label: 'Total TP', value: `${etat.totalGeneral.totalTP}h`, icon: '🔬', color: '#f59e0b' },
                { label: 'H. Complémentaires', value: `${etat.totalGeneral.totalComplementaires}h`, icon: '➕', color: '#ef4444' },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'white', border: '1px solid #e2e8f0',
                  borderRadius: '12px', padding: '20px',
                  borderTop: `3px solid ${stat.color}`
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Résumé comptabilité */}
            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '24px', marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
                💰 État pour la comptabilité — {etat.anneeAcademique.libelle}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Nombre d'enseignants</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a5f' }}>{etat.enseignants.length}</div>
                </div>
                <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Enseignants en dépassement</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#d97706' }}>{etat.totalGeneral.nbEnDepassement}</div>
                </div>
                <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Montant total à payer</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#16a34a' }}>{etat.totalGeneral.totalMontant.toLocaleString()} FCFA</div>
                </div>
              </div>
            </div>

            {/* Tableau détaillé */}
            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', overflow: 'hidden'
            }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600' }}>Détail par enseignant</h2>
              </div>
              <div style={{ padding: '0 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Enseignant', 'Grade', 'Dept.', 'CM', 'TD', 'TP', 'Équivalent', 'H. Contract.', 'H. Compl.', 'Montant'].map((h, i) => (
                        <th key={i} style={{
                          textAlign: 'left', fontSize: '11px', fontWeight: '600',
                          textTransform: 'uppercase', letterSpacing: '0.8px',
                          color: '#64748b', padding: '12px 8px',
                          borderBottom: '1px solid #e2e8f0'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {etat.enseignants.map((e, i) => (
                      <tr key={i} style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: e.enDepassement ? '#fffbeb' : 'white'
                      }}>
                        <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '500' }}>
                          {e.enseignant.prenom} {e.enseignant.nom}
                          {e.enDepassement && <span style={{ marginLeft: '4px', fontSize: '11px' }}>⚠️</span>}
                        </td>
                        <td style={{ padding: '13px 8px', fontSize: '12px', color: '#64748b' }}>{e.enseignant.grade}</td>
                        <td style={{ padding: '13px 8px', fontSize: '12px', color: '#64748b' }}>{e.enseignant.departement}</td>
                        <td style={{ padding: '13px 8px', fontSize: '13px' }}>{e.totaux.totalCM}h</td>
                        <td style={{ padding: '13px 8px', fontSize: '13px' }}>{e.totaux.totalTD}h</td>
                        <td style={{ padding: '13px 8px', fontSize: '13px' }}>{e.totaux.totalTP}h</td>
                        <td style={{ padding: '13px 8px', fontSize: '13px' }}>{e.totaux.totalEquivalent}h</td>
                        <td style={{ padding: '13px 8px', fontSize: '13px' }}>{e.enseignant.heuresContractuelles}h</td>
                        <td style={{ padding: '13px 8px', fontSize: '13px', color: e.heuresComplementaires > 0 ? '#d97706' : '#64748b', fontWeight: e.heuresComplementaires > 0 ? '600' : '400' }}>
                          {e.heuresComplementaires > 0 ? `+${e.heuresComplementaires}h` : '—'}
                        </td>
                        <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '600', color: '#1e3a5f' }}>
                          {e.montant.toLocaleString()} FCFA
                        </td>
                      </tr>
                    ))}
                    {/* Ligne total */}
                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                      <td colSpan="3" style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '700' }}>TOTAL GÉNÉRAL</td>
                      <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '700' }}>{etat.totalGeneral.totalCM}h</td>
                      <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '700' }}>{etat.totalGeneral.totalTD}h</td>
                      <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '700' }}>{etat.totalGeneral.totalTP}h</td>
                      <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '700' }}>{etat.totalGeneral.totalEquivalent}h</td>
                      <td style={{ padding: '13px 8px' }}></td>
                      <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '700', color: '#d97706' }}>{etat.totalGeneral.totalComplementaires}h</td>
                      <td style={{ padding: '13px 8px', fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>{etat.totalGeneral.totalMontant.toLocaleString()} FCFA</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!etat && !loading && (
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '60px',
            textAlign: 'center', color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>
              Sélectionnez une année académique et cliquez sur "Générer l'état"
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EtatGlobal;