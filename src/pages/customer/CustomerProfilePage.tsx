import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const CustomerProfilePage: React.FC = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { showToast } = useNotifications();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [cnic, setCnic] = useState(user?.cnic || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Islamabad');
  const [country, setCountry] = useState(user?.country || 'Pakistan');
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUser({
        name,
        phone,
        cnic,
        address,
        city,
        country
      });
      showToast('Profile information updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'danger');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'danger');
      return;
    }
    setIsChangingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update password', 'danger');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Account & Profile Settings</h2>
        <p className="text-muted small mb-0">Update your guest information, address details, and security credentials.</p>
      </div>

      <div className="row g-4">
        {/* Personal Details Form */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-person-lines-fill text-primary me-2" />
              Personal Details
            </h5>

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon="bi-person"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Email Address"
                    value={email}
                    disabled
                    icon="bi-envelope"
                    helpText="Email address cannot be modified directly"
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Mobile Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon="bi-telephone"
                    required
                  />
                </div>

                <div className="col-12">
                  <Input
                    label="CNIC / Passport Number"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    icon="bi-card-heading"
                    placeholder="42101-1234567-1"
                  />
                </div>

                <div className="col-12">
                  <Input
                    label="Street Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    icon="bi-geo-alt"
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button type="submit" variant="primary" isLoading={isSaving} icon="bi-check2">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-shield-lock text-primary me-2" />
              Change Password
            </h5>

            <form onSubmit={handlePasswordSubmit}>
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="mt-3">
                <Button type="submit" variant="outline-primary" className="w-100" isLoading={isChangingPass}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h6 className="fw-bold text-dark mb-2">Member Support</h6>
            <p className="text-muted small mb-3">
              Need assistance with an active booking or custom itinerary? Contact our guest relations manager directly.
            </p>
            <a href="tel:+92512894433" className="btn btn-light border btn-sm w-100">
              <i className="bi bi-telephone me-1" /> Call Concierge (+92 51 289 4433)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
