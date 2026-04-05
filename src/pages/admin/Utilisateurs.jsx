import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const Utilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteNom, setDeleteNom] = useState('');
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '',
    password: '', role: 'enseignant', actif: true
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/utilisateurs');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async () => {
    try {
      if (editData) {
        await api.put(`/utilisateurs/${editData.id}`, form);
      } else {
        await api.post('/utilisateurs', form);
      }
      setShowModal(false);
      setEditData(null);
      setForm({ nom: '', prenom: '', email: '', password: '', role: 'enseignant', actif: true });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (u) => {
    setEditData(u);
    setForm({
      nom: u.nom, prenom: u.prenom, email: u.email,
      password: '', role: u.role, actif: u.actif
    });
    setShowModal(true);
  };

  const handleToggleActif = async (u) => {
    await api.put(`/utilisateurs/${u.id}`, { ...u, actif: !u.actif });
    fetchUsers();
  };

  const confirmDelete = (u) => {
    setDeleteId(u.id);
    setDeleteNom(`${u.prenom} ${u.nom}`);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/utilisateurs/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteNom('');
      fetchUsers();
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

  const roleColors = {
    'admin': { bg: '#fdf4ff', color: '#9333ea' },
    'rh': { bg: '#eff6ff', color: '#2563eb' },
    'enseignant': { bg: '#f0fdf4', color: '#16a34a' },
  };

  return (
    <Layout>
      <div style={{
        background: 'white', borderBottom: '1px solid #e2e8f0',
        padding: '0 28px', height: '58px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <h1 style={{ fontSize: '17px', fontWeight: '600', color: '#1e3a5f' }}>
          Gestion des Utilisateurs
        </h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#1e3a5f', color: 'white',
            border: 'none', borderRadius: '8px',
            padding: '8px 18px', fontSize: '14px',
            fontWeight: '500', cursor: 'pointer'
          }}
        >+ Ajouter un utilisateur</button>
      </div>

      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Nom & Prénom', 'Email', 'Rôle', 'Statut', 'Actions'].map((h, i) => (
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
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chargement...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucun utilisateur trouvé</td></tr>
              ) : users.map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #1e3a5f)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '12px', fontWeight: '700', flexShrink: 0
                      }}>
                        {u.prenom?.charAt(0)}{u.nom?.charAt(0)}
                      </div>
                      <div style={{ fontWeight: '500', fontSize: '14px' }}>{u.prenom} {u.nom}</div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px', color: '#64748b' }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: roleColors[u.role]?.bg,
                      color: roleColors[u.role]?.color
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: u.actif ? '#f0fdf4' : '#fef2f2',
                      color: u.actif ? '#16a34a' : '#dc2626'
                    }}>{u.actif ? '✅ Actif' : '❌ Inactif'}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(u)} style={{
                        padding: '5px 12px', borderRadius: '6px',
                        border: '1px solid #e2e8f0', background: 'white',
                        fontSize: '12px', cursor: 'pointer', color: '#1e3a5f'
                      }}>✏️ Modifier</button>
                      <button onClick={() => handleToggleActif(u)} style={{
                        padding: '5px 12px', borderRadius: '6px',
                        border: `1px solid ${u.actif ? '#fecaca' : '#bbf7d0'}`,
                        background: u.actif ? '#fef2f2' : '#f0fdf4',
                        fontSize: '12px', cursor: 'pointer',
                        color: u.actif ? '#dc2626' : '#16a34a'
                      }}>{u.actif ? '🔒 Désactiver' : '🔓 Activer'}</button>
                      <button onClick={() => confirmDelete(u)} style={{
                        padding: '5px 12px', borderRadius: '6px',
                        border: '1px solid #fecaca', background: '#fef2f2',
                        fontSize: '12px', cursor: 'pointer', color: '#dc2626'
                      }}>🗑️ Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout/Modification */}
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
              {editData ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
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
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Mot de passe {editData && '(laisser vide pour ne pas changer)'}</label>
                <input style={inputStyle} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
              <div>
                <label style={labelStyle}>Rôle</label>
                <select style={inputStyle} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Administrateur</option>
                  <option value="rh">Service RH</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '22px' }}>
                <input
                  type="checkbox" id="actif" checked={form.actif}
                  onChange={e => setForm({ ...form, actif: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="actif" style={{ ...labelStyle, cursor: 'pointer' }}>Compte actif</label>
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

      {/* Modal Confirmation Suppression */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '32px', width: '420px',
            textAlign: 'center'
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
              Vous êtes sur le point de supprimer le compte de
            </p>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              {deleteNom}
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '28px' }}>
              Cette action est irréversible. Toutes les données associées seront perdues.
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

export default Utilisateurs;