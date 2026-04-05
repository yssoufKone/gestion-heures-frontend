import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const AnneeAcademique = () => {
  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    libelle: '', dateDebut: '', dateFin: '',
    active: false, coefficientCM: 1.0,
    coefficientTD: 1.0, coefficientTP: 0.67
  });

  const fetchAnnees = async () => {
    try {
      const res = await api.get('/annees');
      setAnnees(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnees(); }, []);

  const handleSubmit = async () => {
    try {
      if (editData) {
        await api.put(`/annees/${editData.id}`, form);
      } else {
        await api.post('/annees', form);
      }
      setShowModal(false);
      setEditData(null);
      setForm({ libelle: '', dateDebut: '', dateFin: '', active: false, coefficientCM: 1.0, coefficientTD: 1.0, coefficientTP: 0.67 });
      fetchAnnees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (a) => {
    setEditData(a);
    setForm({
      libelle: a.libelle, dateDebut: a.dateDebut, dateFin: a.dateFin,
      active: a.active, coefficientCM: a.coefficientCM,
      coefficientTD: a.coefficientTD, coefficientTP: a.coefficientTP
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      await api.delete(`/annees/${id}`);
      fetchAnnees();
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#f8fafc',
    marginTop: '6px'
  };

  const labelStyle = { fontSize: '13px', fontWeight: '500', color: '#0f172a' };

  return (
    <Layout>
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Années Académiques
        </h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#1e3a5f', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '8px 18px', fontSize: '14px',
            fontWeight: '500', cursor: 'pointer'
          }}
        >+ Ajouter une année</button>
      </div>

      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Libellé', 'Date début', 'Date fin', 'Coeff CM', 'Coeff TD', 'Coeff TP', 'Statut', 'Actions'].map((h, i) => (
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
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chargement...</td></tr>
              ) : annees.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucune année trouvée</td></tr>
              ) : annees.map((a, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '500', fontSize: '14px' }}>{a.libelle}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{a.dateDebut}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{a.dateFin}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{a.coefficientCM}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{a.coefficientTD}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{a.coefficientTP}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: a.active ? '#f0fdf4' : '#f1f5f9',
                      color: a.active ? '#16a34a' : '#64748b'
                    }}>{a.active ? '✅ Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(a)}
                        style={{
                          padding: '5px 12px', borderRadius: '6px',
                          border: '1px solid #e2e8f0', background: 'white',
                          fontSize: '12px', cursor: 'pointer', color: '#1e3a5f'
                        }}
                      >✏️ Modifier</button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        style={{
                          padding: '5px 12px', borderRadius: '6px',
                          border: '1px solid #fecaca', background: '#fef2f2',
                          fontSize: '12px', cursor: 'pointer', color: '#dc2626'
                        }}
                      >🗑️ Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '28px', width: '480px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a5f', marginBottom: '24px' }}>
              {editData ? "Modifier l'année" : 'Ajouter une année académique'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Libellé</label>
                <input style={inputStyle} value={form.libelle} onChange={e => setForm({ ...form, libelle: e.target.value })} placeholder="ex: 2025-2026" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Date début</label>
                  <input style={inputStyle} type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Date fin</label>
                  <input style={inputStyle} type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Coeff CM</label>
                  <input style={inputStyle} type="number" step="0.01" value={form.coefficientCM} onChange={e => setForm({ ...form, coefficientCM: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Coeff TD</label>
                  <input style={inputStyle} type="number" step="0.01" value={form.coefficientTD} onChange={e => setForm({ ...form, coefficientTD: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Coeff TP</label>
                  <input style={inputStyle} type="number" step="0.01" value={form.coefficientTP} onChange={e => setForm({ ...form, coefficientTP: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="active" style={{ ...labelStyle, cursor: 'pointer' }}>
                  Année académique active
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowModal(false); setEditData(null); }}
                style={{
                  padding: '10px 20px', borderRadius: '8px',
                  border: '1px solid #e2e8f0', background: 'white',
                  fontSize: '14px', cursor: 'pointer'
                }}
              >Annuler</button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: '10px 20px', borderRadius: '8px',
                  border: 'none', background: '#1e3a5f', color: 'white',
                  fontSize: '14px', cursor: 'pointer', fontWeight: '500'
                }}
              >{editData ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AnneeAcademique;