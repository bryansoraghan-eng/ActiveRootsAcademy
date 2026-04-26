import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ara-login-root">
      {/* Left — dark navy */}
      <div className="ara-login-left">
        <div className="ara-login-logo">
          <img src="/logo-mark.svg" alt="" className="ara-login-logo-img" />
          <div>
            <div className="ara-login-wordmark">
              Active <span>Roots</span>
            </div>
            <div className="ara-login-wordmark-sub">ACADEMY</div>
          </div>
        </div>

        <div>
          <div className="ara-login-eyebrow">HQ Console</div>
          <h1 className="ara-login-headline">
            Building strong<br />foundations for<br />the future.
          </h1>
          <p className="ara-login-lede">
            Manage your schools, coaches, classes,<br />and programmes — all in one place.
          </p>
        </div>

        <div className="ara-login-tagline">"Start small. Roots take time."</div>
      </div>

      {/* Right — warm paper */}
      <div className="ara-login-right">
        <div className="ara-login-form-wrap">
          <h2 className="ara-login-form-title">Sign in</h2>
          <p className="ara-login-form-sub">Welcome back — enter your details below.</p>

          {error && <div className="ara-login-error">{error}</div>}

          <form className="ara-login-form" onSubmit={handleSubmit}>
            <div>
              <label className="ara-field-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="ara-field-input"
                placeholder="you@school.ie"
              />
            </div>
            <div>
              <label className="ara-field-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="ara-field-input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="ara-btn ara-btn-primary ara-login-submit">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="ara-login-footer">
            New to the platform?{' '}
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
