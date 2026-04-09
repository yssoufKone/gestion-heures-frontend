import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../services/api';

const RhHeures = () => {
  const [heures, setHeures] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    setError(null);

    try {
      // Fetches individuels pour ne pas tout bloquer si une route est interdite
      const [heuresRes, enseignantsRes, matieresRes, anneesRes] = await Promise.all([
        api.get('/heures').catch(() => ({ data: { data: [] } })),
        api.get('/enseignants').catch(() => ({ data: { data: [] } })),
        api.get('/matieres').catch(() => ({ data: { data: [] } })),
        api.get('/annees').catch(() => ({ data: { data: [] } })),
      ]);

      setHeures(heuresRes.data.data || []);
      setEnseignants(enseignantsRes.data.data || []);
      setMatieres(matieresRes.data.data || []);
      setAnnees(anneesRes.data.data || []);

      // Année active par défaut
      const anneeActive = anneesRes.data.data?.find(a => a.active === true) || anneesRes.data.data?.[0];
      if (anneeActive) setFiltreAnnee(anneeActive.id.toString());

      // Valeurs par défaut dans le formulaire
      setForm(f => ({
        ...f,
        enseignantId: enseignantsRes.data.data?.[0]?.id || '',
        matiereId: matieresRes.data.data?.[0]?.id || '',
        anneeAcademiqueId: anneeActive?.id || ''
      }));

    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      await api.post('/heures', form);
      setShowModal(false);
      fetchData(); // rafraîchir la liste
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’enregistrement');
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

  // ... (le reste du code tableau et filtres reste IDENTIQUE)

  const heuresFiltrees = heures.filter(h => {
    const matchAnnee = filtreAnnee === '' || h.anneeAcademiqueId?.toString() === filtreAnnee;
    const matchType = filtreType === '' || h.typeHeure === filtreType;
    const matchStatut = filtreStatut === '' ||
      (filtreStatut === 'valide' && h.valide) ||
      (filtreStatut === 'attente' && !h.valide);
    return matchAnnee && matchType && matchStatut;
  });

  const inputStyle = { /* ton style inchangé */ };
  const labelStyle = { /* ton style inchangé */ };

  const typeColors = { /* ton style inchangé */ };

  return (
    <Layout>
      {/* Topbar et tableau inchangés ... */}

      {/* Modal Saisie */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e3a5f', marginBottom: '24px' }}>
              Saisir des heures
            </h2>

            {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}

            {enseignants.length === 0 && <p style={{ color: '#f59e0b', marginBottom: '16px' }}>⚠️ Aucune enseignant chargé (vérifie les permissions backend)</p>}
            {matieres.length === 0 && <p style={{ color: '#f59e0b', marginBottom: '16px' }}>⚠️ Aucune matière chargée (vérifie les permissions backend)</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Date, Enseignant, Matière, Type, Durée, Salle, Observations, Année */}
              {/* Tes inputs restent exactement les mêmes */}
              {/* ... (je ne recopie pas tout pour gagner de la place, mais ils sont identiques à ton code) */}

              <div>
                <label style={labelStyle}>Enseignant</label>
                <select style={inputStyle} value={form.enseignantId} onChange={e => setForm({ ...form, enseignantId: e.target.value })}>
                  <option value="">Sélectionner un enseignant</option>
                  {enseignants.map(e => (
                    <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Matière</label>
                <select style={inputStyle} value={form.matiereId} onChange={e => setForm({ ...form, matiereId: e.target.value })}>
                  <option value="">Sélectionner une matière</option>
                  {matieres.map(m => (
                    <option key={m.id} value={m.id}>{m.intitule}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Année académique</label>
                <select style={inputStyle} value={form.anneeAcademiqueId} onChange={e => setForm({ ...form, anneeAcademiqueId: e.target.value })}>
                  <option value="">Sélectionner une année</option>
                  {annees.map(a => (
                    <option key={a.id} value={a.id}>{a.libelle}</option>
                  ))}
                </select>
              </div>

              {/* Les autres champs restent identiques */}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ /* ton style Annuler */ }}>Annuler</button>
              <button onClick={handleSubmit} style={{ /* ton style Enregistrer */ }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RhHeures;