import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Recapitulatif = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [annees, setAnnees] = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [enseignantId, setEnseignantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const fetchData = async (selectedAnneeId = null) => {
    try {
      const [profilRes, anneesRes] = await Promise.all([
        api.get('/auth/mon-profil-enseignant'),
        api.get('/annees')
      ]);

      const enseignant = profilRes.data.data;
      const anneesList = anneesRes.data.data;

      if (enseignant) {
        setEnseignantId(enseignant.id);
        const anneeToUse = selectedAnneeId || anneesList[0]?.id || '';
        setAnneeId(anneeToUse);

        if (anneeToUse) {
          const res = await api.get(`/heures/enseignant/${enseignant.id}?anneeId=${anneeToUse}`);
          setData(res.data.data);
        }
      }
      setAnnees(anneesList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'enseignant') fetchData();
  }, [user]);

  const handleAnneeChange = (e) => {
    const newId = e.target.value;
    setAnneeId(newId);
    if (enseignantId && newId) fetchData(newId);
  };

  // Téléchargement PDF
  const handleDownloadPDF = async () => {
    if (!enseignantId || !anneeId) return;
    try {
      setLoadingPDF(true);
      const response = await api.get(`/exports/pdf/${enseignantId}/${anneeId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recapitulatif_${anneeId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du téléchargement PDF. Vérifie que le backend est bien en ligne.');
    } finally {
      setLoadingPDF(false);
    }
  };

  // Téléchargement Excel
  const handleDownloadExcel = async () => {
    if (!enseignantId || !anneeId) return;
    try {
      setLoadingExcel(true);
      const response = await api.get(`/exports/excel/${enseignantId}/${anneeId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recapitulatif_${anneeId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du téléchargement Excel. Vérifie que le backend est bien en ligne.');
    } finally {
      setLoadingExcel(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Chargement de votre récapitulatif...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Mon Récapitulatif
        </h1>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownloadPDF}
            disabled={loadingPDF || !enseignantId || !anneeId}
            style={{
              background: '#ef4444', color: 'white', padding: '9px 20px',
              borderRadius: '8px', border: 'none', fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {loadingPDF ? '⏳ PDF...' : '📄 PDF'}
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={loadingExcel || !enseignantId || !anneeId}
            style={{
              background: '#10b981', color: 'white', padding: '9px 20px',
              borderRadius: '8px', border: 'none', fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {loadingExcel ? '⏳ Excel...' : '📊 Excel'}
          </button>
        </div>
      </div>

      <div style={{ padding: '28px' }}>
        {/* Sélection année */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '20px', marginBottom: '24px'
        }}>
          <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
            Année académique
          </label>
          <select
            value={anneeId}
            onChange={handleAnneeChange}
            style={{
              width: '300px', padding: '10px 14px',
              border: '1.5px solid #e2e8f0', borderRadius: '8px',
              fontSize: '14px', outline: 'none', background: '#f8fafc'
            }}
          >
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
        </div>

        {data && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total CM', value: `${data.totaux.totalCM}h`, icon: '📖', color: '#3b82f6' },
                { label: 'Total TD', value: `${data.totaux.totalTD}h`, icon: '📝', color: '#10b981' },
                { label: 'Total TP', value: `${data.totaux.totalTP}h`, icon: '🔬', color: '#f59e0b' },
                { label: 'H. Complémentaires', value: `${data.heuresComplementaires}h`, icon: '➕', color: '#ef4444' },
              ].map((stat, i) => (
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

            {/* Récapitulatif financier */}
            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '24px', marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
                Récapitulatif financier
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Heures contractuelles</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a5f' }}>{data.heuresContractuelles}h</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total équivalent effectué</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a5f' }}>{data.totaux.totalEquivalent}h</div>
                </div>
                <div style={{
                  background: data.montant > 0 ? '#fef2f2' : '#f0fdf4',
                  borderRadius: '8px', padding: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Montant à percevoir</div>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: data.montant > 0 ? '#ef4444' : '#16a34a' }}>
                    {data.montant.toLocaleString()} FCFA
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des heures */}
            <div style={{
              background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', overflow: 'hidden'
            }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600' }}>Détail de mes heures</h2>
              </div>
              <div style={{ padding: '0 20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'Matière', 'Type', 'Durée', 'Équivalent', 'Salle', 'Statut'].map((h, i) => (
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
                    {data.heures.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          Aucune heure enregistrée
                        </td>
                      </tr>
                    ) : data.heures.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.date}</td>
                        <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.matiere?.intitule}</td>
                        <td style={{ padding: '13px 0' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                            background: h.typeHeure === 'CM' ? '#eff6ff' : h.typeHeure === 'TD' ? '#f0fdf4' : '#fffbeb',
                            color: h.typeHeure === 'CM' ? '#2563eb' : h.typeHeure === 'TD' ? '#16a34a' : '#d97706'
                          }}>{h.typeHeure}</span>
                        </td>
                        <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.duree}h</td>
                        <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.dureeEquivalente}h</td>
                        <td style={{ padding: '13px 0', fontSize: '13.5px' }}>{h.salle || '—'}</td>
                        <td style={{ padding: '13px 0' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                            background: h.valide ? '#f0fdf4' : '#fffbeb',
                            color: h.valide ? '#16a34a' : '#d97706'
                          }}>{h.valide ? '✅ Validée' : '⏳ En attente'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Recapitulatif;