import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const Heures = () => {
  const [heures, setHeures] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filtreAnnee, setFiltreAnnee] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [form, setForm] = useState({
    date: '', typeHeure: 'CM', duree: '',
    salle: '', observations: '',
    enseignantId: '', matiereId: '', anneeAcademiqueId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Récupération de toutes les données en parallèle
      const [h, e, m, a] = await Promise.all([
        api.get('/heures'),
        api.get('/enseignants'),
        api.get('/matieres'),
        api.get('/annees')
      ]);

      // 2. Mise à jour des états avec les données reçues
      const toutesLesHeures = h.data.data;
      const tousLesEnseignants = e.data.data;
      const toutesLesMatieres = m.data.data;
      const toutesLesAnnees = a.data.data;

      setHeures(toutesLesHeures);
      setEnseignants(tousLesEnseignants);
      setMatieres(toutesLesMatieres);
      setAnnees(toutesLesAnnees);

      // 3. LOGIQUE SECTION 4.4 : Trouver l'année académique active par défaut
      const anneeActive = toutesLesAnnees.find(annee => annee.active === true) || toutesLesAnnees[0];
      
      if (anneeActive) {
        setFiltreAnnee(anneeActive.id.toString());
      }

      // 4. Initialisation du formulaire avec les premières valeurs disponibles
      // On s'assure que l'année par défaut du formulaire est aussi l'année active
      setForm(f => ({
        ...f,
        enseignantId: tousLesEnseignants[0]?.id || '',
        matiereId: toutesLesMatieres[0]?.id || '',
        anneeAcademiqueId: anneeActive?.id || ''
      }));

    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      await api.post('/heures', form);
      setShowModal(false);
      setForm({
        date: '', typeHeure: 'CM', duree: '', salle: '', observations: '',
        enseignantId: enseignants[0]?.id || '',
        matiereId: matieres[0]?.id || '',
        anneeAcademiqueId: annees[0]?.id || ''
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleValider = async (id) => {
    try {
      await api.put(`/heures/valider/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/heures/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrage des heures
  const heuresFiltrees = heures.filter(h => {
    const matchAnnee = filtreAnnee === '' || h.anneeAcademiqueId?.toString() === filtreAnnee;
    const matchType = filtreType === '' || h.typeHeure === filtreType;
    const matchStatut = filtreStatut === '' ||
      (filtreStatut === 'valide' && h.valide) ||
      (filtreStatut === 'attente' && !h.valide);
    return matchAnnee && matchType && matchStatut;
  });

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', background: '#f8fafc',
    marginTop: '6px'
  };

  const labelStyle = { fontSize: '13px', fontWeight: '500', color: '#0f172a' };

  const typeColors = {
    'CM': { bg: '#eff6ff', color: '#2563eb' },
    'TD': { bg: '#f0fdf4', color: '#16a34a' },
    'TP': { bg: '#fffbeb', color: '#d97706' },
  };

  return (
    <Layout>
      {/* Topbar */}
     {/* Tableau */}
<div style={{
  background: 'white', border: '1px solid #e2e8f0',
  borderRadius: '12px', overflow: 'hidden'
}}>
  <div style={{
    padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }}>
    <span style={{ fontSize: '13px', color: '#64748b' }}>
      {heuresFiltrees.length} heure(s) trouvée(s)
    </span>
  </div>
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr style={{ background: '#f8fafc' }}>
        {/* AJOUT DE 'Observations' DANS LE TABLEAU CI-DESSOUS */}
        {['Date', 'Enseignant', 'Matière', 'Type', 'Durée', 'Salle', 'Observations', 'Statut', 'Actions'].map((h, i) => (
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
        <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chargement...</td></tr>
      ) : heuresFiltrees.length === 0 ? (
        <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucune heure trouvée</td></tr>
      ) : heuresFiltrees.map((h, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.date}</td>
          <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>
            {h.enseignant?.prenom} {h.enseignant?.nom}
          </td>
          <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.matiere?.intitule}</td>
          <td style={{ padding: '14px 16px' }}>
            <span style={{
              padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
              background: typeColors[h.typeHeure]?.bg,
              color: typeColors[h.typeHeure]?.color
            }}>{h.typeHeure}</span>
          </td>
          <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.duree}h</td>
          <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.salle || '—'}</td>
          
          {/* NOUVELLE CELLULE POUR LES OBSERVATIONS */}
          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {h.observations || <span style={{ color: '#cbd5e1' }}>Aucune</span>}
          </td>

          <td style={{ padding: '14px 16px' }}>
            <span style={{
              padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
              background: h.valide ? '#f0fdf4' : '#fffbeb',
              color: h.valide ? '#16a34a' : '#d97706'
            }}>{h.valide ? '✅ Validée' : '⏳ En attente'}</span>
          </td>
          <td style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!h.valide && (
                <button
                  onClick={() => handleValider(h.id)}
                  style={{
                    padding: '5px 12px', borderRadius: '6px',
                    border: '1px solid #bbf7d0', background: '#f0fdf4',
                    fontSize: '12px', cursor: 'pointer', color: '#16a34a'
                  }}
                >✅ Valider</button>
              )}
              <button
                onClick={() => confirmDelete(h.id)}
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

      {/* Content */}
      <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>

        {/* Filtres */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '16px 20px',
          marginBottom: '20px',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'
        }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Année académique
            </label>
            <select
              value={filtreAnnee}
              onChange={e => setFiltreAnnee(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                fontSize: '13px', outline: 'none', background: '#f8fafc'
              }}
            >
              <option value="">Toutes les années</option>
              {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Type d'heure
            </label>
            <select
              value={filtreType}
              onChange={e => setFiltreType(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                fontSize: '13px', outline: 'none', background: '#f8fafc'
              }}
            >
              <option value="">Tous les types</option>
              <option value="CM">CM</option>
              <option value="TD">TD</option>
              <option value="TP">TP</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Statut
            </label>
            <select
              value={filtreStatut}
              onChange={e => setFiltreStatut(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                fontSize: '13px', outline: 'none', background: '#f8fafc'
              }}
            >
              <option value="">Tous les statuts</option>
              <option value="valide">Validées</option>
              <option value="attente">En attente</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {heuresFiltrees.length} heure(s) trouvée(s)
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Date', 'Enseignant', 'Matière', 'Type', 'Durée', 'Salle', 'Statut', 'Actions'].map((h, i) => (
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
              ) : heuresFiltrees.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Aucune heure trouvée</td></tr>
              ) : heuresFiltrees.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.date}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>
                    {h.enseignant?.prenom} {h.enseignant?.nom}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.matiere?.intitule}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: typeColors[h.typeHeure]?.bg,
                      color: typeColors[h.typeHeure]?.color
                    }}>{h.typeHeure}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.duree}h</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px' }}>{h.salle || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '99px', fontSize: '11.5px', fontWeight: '500',
                      background: h.valide ? '#f0fdf4' : '#fffbeb',
                      color: h.valide ? '#16a34a' : '#d97706'
                    }}>{h.valide ? '✅ Validée' : '⏳ En attente'}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!h.valide && (
                        <button
                          onClick={() => handleValider(h.id)}
                          style={{
                            padding: '5px 12px', borderRadius: '6px',
                            border: '1px solid #bbf7d0', background: '#f0fdf4',
                            fontSize: '12px', cursor: 'pointer', color: '#16a34a'
                          }}
                        >✅ Valider</button>
                      )}
                      <button
                        onClick={() => confirmDelete(h.id)}
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

      {/* Modal Saisie */}
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
              Saisir des heures
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Date du cours</label>
                <input style={inputStyle} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Enseignant</label>
                <select style={inputStyle} value={form.enseignantId} onChange={e => setForm({ ...form, enseignantId: e.target.value })}>
                  {enseignants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Matière</label>
                <select style={inputStyle} value={form.matiereId} onChange={e => setForm({ ...form, matiereId: e.target.value })}>
                  {matieres.map(m => <option key={m.id} value={m.id}>{m.intitule}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Type d'heure</label>
                <select style={inputStyle} value={form.typeHeure} onChange={e => setForm({ ...form, typeHeure: e.target.value })}>
                  <option>CM</option>
                  <option>TD</option>
                  <option>TP</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Durée (heures)</label>
                <input style={inputStyle} type="number" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder="ex: 2" />
              </div>
              <div>
                <label style={labelStyle}>Salle</label>
                <input style={inputStyle} value={form.salle} onChange={e => setForm({ ...form, salle: e.target.value })} placeholder="ex: Amphi A" />
              </div>
              <div>
                <label style={labelStyle}>Observations</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Observations optionnelles..." />
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
                onClick={() => setShowModal(false)}
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
              >Enregistrer</button>
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
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
              Vous êtes sur le point de supprimer cette heure. Cette action est irréversible.
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

export default Heures;