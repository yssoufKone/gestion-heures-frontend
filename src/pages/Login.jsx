import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'rh') navigate('/rh/dashboard');
      else navigate('/enseignant/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Côté gauche */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, #1e3a5f 0%, #2a5298 60%, #3b82f6 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'white', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px'
          }}>🎓</div>
          <span style={{ fontSize: '22px', fontWeight: '700' }}>GestHeure</span>
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: '700', lineHeight: '1.25', marginBottom: '20px' }}>
          Gestion des heures<br />d'enseignement
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.7', maxWidth: '380px' }}>
          Plateforme centralisée pour le suivi, le calcul et la validation des volumes horaires des enseignants du supérieur.
        </p>
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {['Calcul automatique des heures complémentaires',
            'Suivi par département et par filière',
            'Export PDF & Excel des états de paiement',
            'Gestion des rôles Admin / RH / Enseignant'
          ].map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }}></div>
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Côté droit */}
      <div style={{
        width: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 50px',
        background: 'white'
      }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1e3a5f', marginBottom: '6px' }}>
            Connexion
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '36px' }}>
            Accédez à votre espace selon votre profil
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626',
              padding: '12px', borderRadius: '8px',
              marginBottom: '20px', fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '7px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: admin@universite.com"
                required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '14px', outline: 'none', background: '#f8fafc'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '7px' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '14px', outline: 'none', background: '#f8fafc'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#94a3b8' : '#1e3a5f',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            Mot de passe oublié ? Contactez l'administrateur système.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;