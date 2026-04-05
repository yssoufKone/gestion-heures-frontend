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
    setForm({
      nom: e.nom, prenom: e.prenom, grade: e.grade,
      statut: e.statut, departement: e.departement,
      tauxHoraire: e.tauxHoraire, heuresContractuelles: e.heuresContractuelles,
      email: e.user?.email || ''
    });
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
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#f8fafc',
    marginTop: '6px'
  };

  const labelStyle = { fontSize: '13px', fontWeight: '500', color: '#0f172a' };

  return (
    <Layout>
      {/* Topbar */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Gestion des Enseignants
        </h1>
        {/* Bouton Ajouter visible uniquement pour l'admin */}
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#1e3a5f', color: 'white',
              border: 'none', borderRadius: '8px',
              padding: '8px 18px', fontSize: '14px',
              fontWeight: '500', cursor: 'pointer'
            }}
          >+ Ajouter un enseignant</button>
        )}
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
                {['Nom & Prénom', 'Grade', 'Statut', 'Département', 'H. Contractuelles', 'Taux Horaire', ...(isAdmin ? ['Actions'] : [])].map((h, i) => (
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
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chargement...</td></tr>
              ) : enseignants.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucun enseignant trouvé</td></tr>
              ) : enseignants.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>{e.prenom} {e.nom}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{e.grade}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: e.statut === 'Permanent' ? '#f0fdf4' : '#eff6ff',
                      color: e.statut === 'Permanent' ? '#16a34a' : '#2563eb'
                    }}>{e.statut}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{e.departement}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{e.heuresContractuelles}h</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{e.tauxHoraire} FCFA</td>
                  {/* Boutons Actions visibles uniquement pour l'admin */}
                  {isAdmin && (
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(e)}
                          style={{
                            padding: '5px 12px', borderRadius: '6px',
                            border: '1px solid #e2e8f0', background: 'white',
                            fontSize: '12px', cursor: 'pointer', color: '#1e3a5f'
                          }}
                        >✏️ Modifier</button>
                        <button
                          onClick={() => confirmDelete(e)}
                          style={{
                            padding: '5px 12px', borderRadius: '6px',
                            border: '1px solid #fecaca', background: '#fef2f2',
                            fontSize: '12px', cursor: 'pointer', color: '#dc2626'
                          }}
                        >🗑️ Supprimer</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout/Modification — Admin uniquement */}
      {showModal && isAdmin && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '28px', width: '520px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a5f', marginBottom: '24px' }}>
              {editData ? "Modifier l'enseignant" : 'Ajouter un enseignant'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nom</label>
                <input style={inputStyle} value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Nom" />
              </div>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input style={inputStyle} value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" />
              </div>
              <div>
                <label style={labelStyle}>Grade</label>
                <select style={inputStyle} value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                  <option>Assistant</option>
                  <option>Maître-Assistant</option>
                  <option>Professeur</option>
                  <option>Autres</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Statut</label>
                <select style={inputStyle} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                  <option>Permanent</option>
                  <option>Vacataire</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Département</label>
                <input style={inputStyle} value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })} placeholder="Département" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" />
              </div>
              <div>
                <label style={labelStyle}>Taux horaire (FCFA)</label>
                <input style={inputStyle} type="number" value={form.tauxHoraire} onChange={e => setForm({ ...form, tauxHoraire: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Heures contractuelles</label>
                <input style={inputStyle} type="number" value={form.heuresContractuelles} onChange={e => setForm({ ...form, heuresContractuelles: e.target.value })} placeholder="192" />
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

      {/* Modal Confirmation Suppression — Admin uniquement */}
      {showDeleteModal && isAdmin && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '32px', width: '420px', textAlign: 'center'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#fef2f2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: '24px'
            }}>🗑️</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
              Confirmer la suppression
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
              Vous êtes sur le point de supprimer
            </p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              {deleteNom}
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '28px' }}>
              Cette action supprimera aussi son compte utilisateur et toutes ses heures.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteId(null); }}
                style={{
                  padding: '10px 24px', borderRadius: '8px',
                  border: '1px solid #e2e8f0', background: 'white',
                  fontSize: '14px', cursor: 'pointer', fontWeight: '500'
                }}
              >Annuler</button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '10px 24px', borderRadius: '8px',
                  border: 'none', background: '#dc2626', color: 'white',
                  fontSize: '14px', cursor: 'pointer', fontWeight: '600'
                }}
              >Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Enseignants;