import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit');
        setLogs(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const actionColors = {
    'CREATION': { bg: '#f0fdf4', color: '#16a34a' },
    'MODIFICATION': { bg: '#eff6ff', color: '#2563eb' },
    'SUPPRESSION': { bg: '#fef2f2', color: '#dc2626' },
    'VALIDATION': { bg: '#fffbeb', color: '#d97706' },
  };

  const logsFiltres = logs.filter(log =>
    filtre === '' ||
    log.action.includes(filtre.toUpperCase()) ||
    log.entite?.toLowerCase().includes(filtre.toLowerCase()) ||
    log.userEmail?.toLowerCase().includes(filtre.toLowerCase())
  );

  return (
    <Layout>
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Journal d'audit
        </h1>
        <span style={{
          background: '#eff6ff', color: '#3b82f6',
          padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '500'
        }}>{logs.length} actions enregistrées</span>
      </div>

      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>

        {/* Filtre */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          marginBottom: '20px', display: 'flex', gap: '12px'
        }}>
          <input
            placeholder="Rechercher par action, entité ou utilisateur..."
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
            style={{
              flex: 1, padding: '9px 14px',
              border: '1.5px solid #e2e8f0', borderRadius: '8px',
              fontSize: '14px', outline: 'none'
            }}
          />
          <select
            value={filtre}
            onChange={e => setFiltre(e.target.value)}
            style={{
              padding: '9px 14px',
              border: '1.5px solid #e2e8f0', borderRadius: '8px',
              fontSize: '14px', outline: 'none', background: '#f8fafc'
            }}
          >
            <option value="">Toutes les actions</option>
            <option value="CREATION">Création</option>
            <option value="MODIFICATION">Modification</option>
            <option value="SUPPRESSION">Suppression</option>
            <option value="VALIDATION">Validation</option>
          </select>
        </div>

        {/* Tableau */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Date & Heure', 'Utilisateur', 'Action', 'Entité', 'Détails', 'IP'].map((h, i) => (
                  <th key={i} style={{
                    textAlign: 'left', fontSize: '11px', fontWeight: '600',
                    textTransform: 'uppercase', letterSpacing: '0.8px',
                    color: '#64748b', padding: '14px 16px',
                    borderBottom: '1px solid #e2e8f0'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chargement...</td></tr>
              ) : logsFiltres.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucune action enregistrée</td></tr>
              ) : logsFiltres.map((log, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '13px 16px', fontSize: '12.5px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                    {log.userEmail || '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: actionColors[log.action]?.bg || '#f1f5f9',
                      color: actionColors[log.action]?.color || '#64748b'
                    }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px' }}>{log.entite || '—'}</td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.details || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', color: '#64748b' }}>
                    {log.ip || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AuditLog;