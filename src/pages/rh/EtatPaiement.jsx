import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const EtatPaiement = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [etat, setEtat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, a] = await Promise.all([
          api.get('/enseignants'),
          api.get('/annees')
        ]);
        setEnseignants(e.data.data);
        setAnnees(a.data.data);
        if (a.data.data.length > 0) {
          setAnneeId(a.data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const genererEtat = async () => {
    try {
      setLoading(true);
      const results = [];
      for (const enseignant of enseignants) {
        const res = await api.get(`/heures/enseignant/${enseignant.id}`);
        const data = res.data.data;
        results.push({
          id: enseignant.id,
          nom: enseignant.nom,
          prenom: enseignant.prenom,
          grade: enseignant.grade,
          statut: enseignant.statut,
          departement: enseignant.departement,
          heuresContractuelles: data.heuresContractuelles,
          totalCM: data.totaux.totalCM,
          totalTD: data.totaux.totalTD,
          totalTP: data.totaux.totalTP,
          totalEquivalent: data.totaux.totalEquivalent,
          heuresComplementaires: data.heuresComplementaires,
          montant: data.montant,
          enDepassement: data.heuresComplementaires > 0
        });
      }
      setEtat(results);
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
      a.download = 'etat_paiement.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExport(false);
    }
  };

  const handleExportPDF = async (enseignantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/exports/pdf/${enseignantId}/${anneeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiche_${enseignantId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const totalMontant = etat.reduce((acc, e) => acc + e.montant, 0);
  const totalComplementaires = etat.reduce((acc, e) => acc + e.heuresComplementaires, 0);
  const enDepassement = etat.filter(e => e.enDepassement).length;

  return (
    <Layout>
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          États de Paiement
        </h1>
        {etat.length > 0 && (
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

        {/* Stats */}
        {etat.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '20px', borderTop: '3px solid #3b82f6'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏱️</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{totalComplementaires}h</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>Total heures complémentaires</div>
            </div>
            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '20px', borderTop: '3px solid #ef4444'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{enDepassement}</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>Enseignants en dépassement</div>
            </div>
            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '20px', borderTop: '3px solid #10b981'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💰</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{totalMontant.toLocaleString()} FCFA</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>Montant total à payer</div>
            </div>
          </div>
        )}

        {/* Tableau */}
        {etat.length > 0 && (
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', overflow: 'hidden'
          }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600' }}>
                État de paiement — {annees.find(a => a.id == anneeId)?.libelle}
              </h2>
            </div>
            <div style={{ padding: '0 20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Enseignant', 'Grade', 'CM', 'TD', 'TP', 'H. Contract.', 'H. Compl.', 'Montant', 'Fiche'].map((h, i) => (
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
                  {etat.map((e, i) => (
                    <tr key={i} style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: e.enDepassement ? '#fffbeb' : 'white'
                    }}>
                      <td style={{ padding: '13px 0', fontSize: '13.5px', fontWeight: '500' }}>
                        {e.prenom} {e.nom}
                        {e.enDepassement && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#d97706' }}>⚠️</span>}
                      </td>
                      <td style={{ padding: '13px 0', fontSize: '13px', color: '#64748b' }}>{e.grade}</td>
                      <td style={{ padding: '13px 0', fontSize: '13px' }}>{e.totalCM}h</td>
                      <td style={{ padding: '13px 0', fontSize: '13px' }}>{e.totalTD}h</td>
                      <td style={{ padding: '13px 0', fontSize: '13px' }}>{e.totalTP}h</td>
                      <td style={{ padding: '13px 0', fontSize: '13px' }}>{e.heuresContractuelles}h</td>
                      <td style={{ padding: '13px 0', fontSize: '13px', color: e.heuresComplementaires > 0 ? '#d97706' : '#64748b', fontWeight: e.heuresComplementaires > 0 ? '600' : '400' }}>
                        {e.heuresComplementaires}h
                      </td>
                      <td style={{ padding: '13px 0', fontSize: '13px', fontWeight: '600', color: '#1e3a5f' }}>
                        {e.montant.toLocaleString()} FCFA
                      </td>
                      <td style={{ padding: '13px 0' }}>
                        <button
                          onClick={() => handleExportPDF(e.id)}
                          style={{
                            padding: '4px 10px', borderRadius: '6px',
                            border: '1px solid #fecaca', background: '#fef2f2',
                            fontSize: '11px', cursor: 'pointer', color: '#dc2626'
                          }}
                        >📄 PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {etat.length === 0 && !loading && (
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '60px',
            textAlign: 'center', color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <p style={{ fontSize: '15px', fontWeight: '500' }}>Sélectionnez une année académique et cliquez sur "Générer l'état"</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EtatPaiement;