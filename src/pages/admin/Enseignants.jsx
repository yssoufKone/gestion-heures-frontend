import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Enseignants = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteNom, setDeleteNom] = useState('');
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    nom: '', prenom: '', grade: 'Assistant',
    statut: 'Permanent', departement: '',
    tauxHoraire: '', heuresContractuelles: 192, email: ''
  });

  const fetchEnseignants = async () => {
    try {
      const res = await api.get('/enseignants');
      setEnseignants(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnseignants(); }, []);

  const handleSubmit = async () => {
    try {
      if (editData) {
        await api.put(`/enseignants/${editData.id}`, form);
      } else {
        await api.post('/enseignants', form);
      }
      setShowModal(false);
      setEditData(null);
      setForm({ nom: '', prenom: '', grade: 'Assistant', statut: 'Permanent', departement: '', tauxHoraire: '', heuresContractuelles: 192, email: '' });
      fetchEnseignants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (e) => {
    setEditData(e);
    setForm({ nom: e.nom, prenom: e.prenom, grade: e.grade, statut: e.statut, departement: e.departement, tauxHoraire: e.tauxHoraire, heuresContractuelles: e.heuresContractuelles, email: e.user?.email || '' });
    setShowModal(true);
  };

  const confirmDelete = (e) => {
    setDeleteId(e.id);
    setDeleteNom(`${e.prenom} ${e.nom}`);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/enseignants/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchEnseignants();
    } catch (err) {
      console.error(err);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '16px', outline: 'none', background: '#f8fafc',
    marginTop: '6px', boxSizing: 'border-box'
  };

  const labelStyle = { fontSize: '13px', fontWeight: '500', color: '#0f172a' };

  return (
    <Layout>
      <style>{`
        .page-topbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 20px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .page-content {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }
        .table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .modal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .page-topbar {
            padding: 0 16px 0 60px;
          }
          .page-topbar h1 {
            font-size: 14px !important;
          }
          .page-content {
            padding: 12px;
          }
          .modal-grid {
            grid-template-columns: 1fr;
          }
          .modal-box {
            width: 92vw !important;
            padding: 20px !important;
          }
          .add-btn span {
            display: none;
          }
        }
      `}</style>

      <div className="page-topbar">
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>Gestion des Enseignants</h1>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} style={{ background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + <span>Ajouter un enseignant</span>
          </button>
        )}
      </div>

      <div className="page-content">
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Nom & Prénom', 'Grade', 'Statut', 'Département', 'H. Contract.', 'Taux', ...(isAdmin ? ['Actions'] : [])].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748b', padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chargement...</td></tr>
                ) : enseignants.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucun enseignant trouvé</td></tr>
                ) : enseignants.map((e, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '500', fontSize: '13px' }}>{e.prenom} {e.nom}</td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>{e.grade}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500', background: e.statut === 'Permanent' ? '#f0fdf4' : '#eff6ff', color: e.statut === 'Permanent' ? '#16a34a' : '#2563eb' }}>{e.statut}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>{e.departement}</td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>{e.heuresContractuelles}h</td>
                    <td style={{ padding: '12px 14px', fontSize: '12px' }}>{e.tauxHoraire} FCFA</td>
                    {isAdmin && (
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button onClick={() => handleEdit(e)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '11px', cursor: 'pointer', color: '#1e3a5f' }}>✏️</button>
                          <button onClick={() => confirmDelete(e)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', fontSize: '11px', cursor: 'pointer', color: '#dc2626' }}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="modal-box" style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '520px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f', marginBottom: '20px' }}>
              {editData ? "Modifier l'enseignant" : 'Ajouter un enseignant'}
            </h2>
            <div className="modal-grid">
              <div><label style={labelStyle}>Nom</label><input style={inputStyle} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom" /></div>
              <div><label style={labelStyle}>Prénom</label><input style={inputStyle} value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" /></div>
              <div><label style={labelStyle}>Grade</label>
                <select style={inputStyle} value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                  <option>Assistant</option><option>Maître-Assistant</option><option>Professeur</option><option>Autres</option>
                </select>
              </div>
              <div><label style={labelStyle}>Statut</label>
                <select style={inputStyle} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                  <option>Permanent</option><option>Vacataire</option>
                </select>
              </div>
              <div><label style={labelStyle}>Département</label><input style={inputStyle} value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })} placeholder="Département" /></div>
              <div><label style={labelStyle}>Email</label><input style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" /></div>
              <div><label style={labelStyle}>Taux horaire (FCFA)</label><input style={inputStyle} type="number" value={form.tauxHoraire} onChange={e => setForm({ ...form, tauxHoraire: e.target.value })} placeholder="0" /></div>
              <div><label style={labelStyle}>Heures contractuelles</label><input style={inputStyle} type="number" value={form.heuresContractuelles} onChange={e => setForm({ ...form, heuresContractuelles: e.target.value })} placeholder="192" /></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowModal(false); setEditData(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleSubmit} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1e3a5f', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>{editData ? 'Modifier' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && isAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '380px', maxWidth: '100%', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '22px' }}>🗑️</div>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Confirmer la suppression</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>Vous êtes sur le point de supprimer</p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#dc2626', marginBottom: '20px' }}>{deleteNom}</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '24px' }}>Cette action supprimera aussi son compte et toutes ses heures.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteId(null); }} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>Annuler</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: '600' }}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Enseignants;