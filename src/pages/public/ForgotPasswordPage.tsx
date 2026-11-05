import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
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
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
                  style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}
                >
                  <i className="bi bi-key" />
                </div>
                <h4 className="fw-bold text-dark mb-1">Reset Password</h4>
                <p className="text-muted small">
                  Enter your registered account email and we'll send you recovery instructions.
                </p>
              </div>

              {message ? (
                <div className="alert alert-success py-3 px-3 small text-center mb-4">
                  <i className="bi bi-envelope-check-fill fs-5 d-block mb-1" />
                  {message}
                  <div className="mt-3">
                    <Link to="/login" className="btn btn-sm btn-outline-success">
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Account Email Address"
                    type="email"
                    placeholder="name@example.com"
                    icon="bi-envelope"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 py-2.5 mb-3 fw-bold"
                    isLoading={isLoading}
                    icon="bi-send"
                  >
                    Send Reset Link
                  </Button>

                  <div className="text-center small text-muted">
                    Remembered your password?{' '}
                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                      Sign In
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
