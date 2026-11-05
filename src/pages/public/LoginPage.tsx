import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = (location.state as any)?.from?.pathname;
  const redirectMessage = (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);
      showToast(`Welcome back, ${loggedUser.name}!`, 'success');

      if (redirectPath) {
        navigate(redirectPath);
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await login(demoEmail, demoPass);
      showToast(`Signed in as ${loggedUser.name}`, 'success');
      if (redirectPath) {
        navigate(redirectPath);
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-light py-5 min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
              {/* Logo Header */}
              <div className="text-center mb-4">
                <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-2">
                  <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-building fs-5" />
                  </div>
                  <span className="fw-bold fs-4 text-dark">Serene Haven</span>
                </Link>
                <h4 className="fw-bold text-dark mb-1">Sign In to Your Account</h4>
                <p className="text-muted small">Enter your credentials or use a quick demo account below</p>
              </div>

              {redirectMessage && (
                <div className="alert alert-warning border-warning d-flex align-items-center gap-3 py-2 px-3 mb-4 rounded-3 shadow-sm">
                  <i className="bi bi-exclamation-triangle-fill text-warning fs-5 flex-shrink-0" />
                  <div className="small">
                    <strong>Authentication Required:</strong> {redirectMessage}
                  </div>
                </div>
              )}

              {/* Demo Account Quick Pickers */}
              <div className="p-3 bg-light rounded-3 border mb-4">
                <small className="fw-bold text-uppercase text-muted d-block mb-2" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-lightning-charge-fill text-warning me-1" /> 1-Click Demo Login
                </small>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm flex-fill text-nowrap"
                    onClick={() => handleQuickLogin('admin@example.com', 'admin123')}
                    disabled={isLoading}
                  >
                    <i className="bi bi-shield-lock me-1" /> Admin Portal
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm flex-fill text-nowrap"
                    onClick={() => handleQuickLogin('customer@example.com', 'customer123')}
                    disabled={isLoading}
                  >
                    <i className="bi bi-person me-1" /> Guest Portal
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill fs-6" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  icon="bi-envelope"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon="bi-lock"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="d-flex justify-content-between align-items-center mb-4 small">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label className="form-check-label text-secondary" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-primary text-decoration-none fw-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 py-2.5 mb-3 fw-bold"
                  isLoading={isLoading}
                  icon="bi-box-arrow-in-right"
                >
                  Sign In
                </Button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 mb-4"
                  onClick={() => handleQuickLogin('customer@example.com', 'customer123')}
                >
                  <i className="bi bi-google text-danger" />
                  <span className="small fw-medium">Continue with Google</span>
                </button>

                <div className="text-center small text-muted">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="text-primary fw-bold text-decoration-none">
                    Register Now
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
