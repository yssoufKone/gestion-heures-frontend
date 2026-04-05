import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const Matieres = () => {
  const [matieres, setMatieres] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    intitule: '', filiere: '', niveau: 'L1',
    volumeHorairePrevu: '', anneeAcademiqueId: ''
  });

  const fetchData = async () => {
    try {
      const [m, a] = await Promise.all([
        api.get('/matieres'),
        api.get('/annees')
      ]);
      setMatieres(m.data.data);
      setAnnees(a.data.data);
      if (a.data.data.length > 0) {
        setForm(f => ({ ...f, anneeAcademiqueId: a.data.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      if (editData) {
        await api.put(`/matieres/${editData.id}`, form);
      } else {
        await api.post('/matieres', form);
      }
      setShowModal(false);
      setEditData(null);
      setForm({ intitule: '', filiere: '', niveau: 'L1', volumeHorairePrevu: '', anneeAcademiqueId: annees[0]?.id || '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (m) => {
    setEditData(m);
    setForm({
      intitule: m.intitule, filiere: m.filiere,
      niveau: m.niveau, volumeHorairePrevu: m.volumeHorairePrevu,
      anneeAcademiqueId: m.anneeAcademiqueId
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      await api.delete(`/matieres/${id}`);
      fetchData();
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#f8fafc',
    marginTop: '6px'
  };

  const labelStyle = { fontSize: '13px', fontWeight: '500', color: '#0f172a' };

  const niveauColors = {
    'L1': { bg: '#eff6ff', color: '#2563eb' },
    'L2': { bg: '#f0fdf4', color: '#16a34a' },
    'L3': { bg: '#fffbeb', color: '#d97706' },
    'M1': { bg: '#fdf4ff', color: '#9333ea' },
    'M2': { bg: '#fef2f2', color: '#dc2626' },
  };

  return (
    <Layout>
      {/* Topbar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Gestion des Matières
        </h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#1e3a5f', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '8px 18px', fontSize: '14px',
            fontWeight: '500', cursor: 'pointer'
          }}
        >+ Ajouter une matière</button>
      </div>

      {/* Content */}
      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Intitulé', 'Filière', 'Niveau', 'Volume Horaire Prévu', 'Année Académique', 'Actions'].map((h, i) => (
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
              ) : matieres.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucune matière trouvée</td></tr>
              ) : matieres.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '500', fontSize: '14px' }}>{m.intitule}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{m.filiere}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: niveauColors[m.niveau]?.bg,
                      color: niveauColors[m.niveau]?.color
                    }}>{m.niveau}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{m.volumeHorairePrevu}h</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{m.anneeAcademique?.libelle}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(m)}
                        style={{
                          padding: '5px 12px', borderRadius: '6px',
                          border: '1px solid #e2e8f0', background: 'white',
                          fontSize: '12px', cursor: 'pointer', color: '#1e3a5f'
                        }}
                      >✏️ Modifier</button>
                      <button
                        onClick={() => handleDelete(m.id)}
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

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '28px', width: '480px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a5f', marginBottom: '24px' }}>
              {editData ? 'Modifier la matière' : 'Ajouter une matière'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Intitulé du cours</label>
                <input style={inputStyle} value={form.intitule} onChange={e => setForm({ ...form, intitule: e.target.value })} placeholder="ex: Algorithmique" />
              </div>
              <div>
                <label style={labelStyle}>Filière</label>
                <input style={inputStyle} value={form.filiere} onChange={e => setForm({ ...form, filiere: e.target.value })} placeholder="ex: Informatique" />
              </div>
              <div>
                <label style={labelStyle}>Niveau</label>
                <select style={inputStyle} value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}>
                  {['L1', 'L2', 'L3', 'M1', 'M2'].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Volume horaire prévu (h)</label>
                <input style={inputStyle} type="number" value={form.volumeHorairePrevu} onChange={e => setForm({ ...form, volumeHorairePrevu: e.target.value })} placeholder="ex: 45" />
              </div>
              <div>
                <label style={labelStyle}>Année académique</label>
                <select style={inputStyle} value={form.anneeAcademiqueId} onChange={e => setForm({ ...form, anneeAcademiqueId: e.target.value })}>
                  {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                </select>
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

export default Matieres;