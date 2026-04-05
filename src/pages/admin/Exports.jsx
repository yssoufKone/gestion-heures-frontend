import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const Exports = () => {
  const [annees, setAnnees] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [enseignantId, setEnseignantId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [a, e] = await Promise.all([
          api.get('/annees'),
          api.get('/enseignants')
        ]);
        setAnnees(a.data.data);
        setEnseignants(e.data.data);
        if (a.data.data.length > 0) setAnneeId(a.data.data[0].id);
        if (e.data.data.length > 0) setEnseignantId(e.data.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/exports/excel/${anneeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'heures_enseignants.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5001/api/exports/pdf/${enseignantId}/${anneeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fiche_enseignant.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#f8fafc',
    marginTop: '6px'
  };

  return (
    <Layout>
      {/* Topbar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Exports
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Export Excel */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '28px',
            borderTop: '3px solid #10b981'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>
              Export Excel Global
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
              Exporte la liste complète des enseignants avec leurs heures, heures complémentaires et montants à payer pour une année académique.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500' }}>Année académique</label>
              <select style={selectStyle} value={anneeId} onChange={e => setAnneeId(e.target.value)}>
                {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
              </select>
            </div>
            <button
              onClick={handleExportExcel}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: '#10b981', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {loading ? 'Export en cours...' : '⬇️ Télécharger Excel'}
            </button>
          </div>

          {/* Export PDF */}
          <div style={{
            background: 'white', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '28px',
            borderTop: '3px solid #ef4444'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>📄</div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a5f', marginBottom: '8px' }}>
              Fiche Individuelle PDF
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
              Génère la fiche individuelle d'un enseignant avec le détail de ses heures, le récapitulatif et le montant total à payer.
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500' }}>Enseignant</label>
              <select style={selectStyle} value={enseignantId} onChange={e => setEnseignantId(e.target.value)}>
                {enseignants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500' }}>Année académique</label>
              <select style={selectStyle} value={anneeId} onChange={e => setAnneeId(e.target.value)}>
                {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
              </select>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: '#ef4444', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {loading ? 'Export en cours...' : '⬇️ Télécharger PDF'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Exports;