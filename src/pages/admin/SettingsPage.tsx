import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/settings.service';
import { SystemSettings } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useNotifications } from '../../context/NotificationContext';

export const SettingsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'booking' | 'payment'>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    settingsService.get().then((data) => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await settingsService.update(settings);
      showToast('Settings saved successfully!', 'success');
    } catch {
      showToast('Failed to save settings', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <Loader message="Loading settings..." />;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">System & Property Settings</h2>
          <p className="text-muted small mb-0">
            Configure boutique brand identities, check-in policies, tax rates, and payment accounts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
        <div className="border-bottom px-4 pt-3">
          <ul className="nav nav-tabs border-bottom-0">
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 ${activeTab === 'general' ? 'active' : 'text-secondary'}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="bi bi-building me-1.5" /> General Property
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 ${activeTab === 'booking' ? 'active' : 'text-secondary'}`}
                onClick={() => setActiveTab('booking')}
              >
                <i className="bi bi-calendar2-range me-1.5" /> Booking Policies
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-semibold px-4 ${activeTab === 'payment' ? 'active' : 'text-secondary'}`}
                onClick={() => setActiveTab('payment')}
              >
                <i className="bi bi-wallet2 me-1.5" /> Payment Gateways
              </button>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSave} className="p-4 p-md-5">
          {/* 1. General Settings Tab */}
          {activeTab === 'general' && (
            <div>
              <h5 className="fw-bold text-dark mb-3">Property Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    label="Guest House Name"
                    value={settings.general.guestHouseName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, guestHouseName: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Marketing Tagline"
                    value={settings.general.tagline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, tagline: e.target.value }
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Official Email"
                    type="email"
                    value={settings.general.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, email: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Official Phone"
                    value={settings.general.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, phone: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <Input
                    label="Street Address"
                    value={settings.general.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, address: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="City"
                    value={settings.general.city}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, city: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6">
                  <Input
                    label="Country"
                    value={settings.general.country}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, country: e.target.value }
                      })
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-medium text-secondary mb-1">
                    Property Description
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={settings.general.description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, description: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Booking Settings Tab */}
          {activeTab === 'booking' && (
            <div>
              <h5 className="fw-bold text-dark mb-3">Check-in, Check-out & Tariffs</h5>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <Input
                    label="Standard Check-in Time"
                    value={settings.booking.checkInTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        booking: { ...settings.booking, checkInTime: e.target.value }
                      })
                    }
                    placeholder="14:00 (2:00 PM)"
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Standard Check-out Time"
                    value={settings.booking.checkOutTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        booking: { ...settings.booking, checkOutTime: e.target.value }
                      })
                    }
                    placeholder="12:00 (12:00 PM)"
                  />
                </div>

                <div className="col-md-4">
                  <Input
                    label="Government Hotel Tax Rate (%)"
                    type="number"
                    value={settings.booking.taxRatePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        booking: { ...settings.booking, taxRatePercent: Number(e.target.value) }
                      })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-medium text-secondary mb-1">
                    Cancellation Policy Text
                  </label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={settings.booking.cancellationPolicy}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        booking: { ...settings.booking, cancellationPolicy: e.target.value }
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Payment Settings Tab */}
          {activeTab === 'payment' && (
            <div>
              <h5 className="fw-bold text-dark mb-2">Payment Channels & Gateways</h5>
              <p className="text-muted small mb-4">
                Toggle customer-facing payment options and configure account identifiers.
              </p>

              <div className="row g-4">
                {/* Cash on Arrival */}
                <div className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="cashSwitch"
                        checked={settings.payment.cashEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, cashEnabled: e.target.checked }
                          })
                        }
                      />
                      <label className="form-check-label fw-bold text-dark" htmlFor="cashSwitch">
                        Cash on Arrival
                      </label>
                    </div>
                    <small className="text-muted">Allow guests to pay physically at front desk upon check-in.</small>
                  </div>
                </div>

                {/* Credit / Debit Card */}
                <div className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="cardSwitch"
                        checked={settings.payment.cardEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, cardEnabled: e.target.checked }
                          })
                        }
                      />
                      <label className="form-check-label fw-bold text-dark" htmlFor="cardSwitch">
                        Credit / Debit Card (Stripe Gateway)
                      </label>
                    </div>
                    <small className="text-muted">Accept Visa, MasterCard, and international debit cards.</small>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="col-md-12">
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="bankSwitch"
                        checked={settings.payment.bankTransferEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, bankTransferEnabled: e.target.checked }
                          })
                        }
                      />
                      <label className="form-check-label fw-bold text-dark" htmlFor="bankSwitch">
                        Direct Bank Wire Transfer
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      className="form-control form-control-sm mt-2 font-monospace"
                      value={settings.payment.bankDetails}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, bankDetails: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>

                {/* Easypaisa */}
                <div className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="epSwitch"
                        checked={settings.payment.easypaisaEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, easypaisaEnabled: e.target.checked }
                          })
                        }
                      />
                      <label className="form-check-label fw-bold text-dark" htmlFor="epSwitch">
                        Easypaisa Mobile Wallet
                      </label>
                    </div>
                    <Input
                      label="Merchant Mobile Account"
                      value={settings.payment.easypaisaNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, easypaisaNumber: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>

                {/* JazzCash */}
                <div className="col-md-6">
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="jcSwitch"
                        checked={settings.payment.jazzcashEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, jazzcashEnabled: e.target.checked }
                          })
                        }
                      />
                      <label className="form-check-label fw-bold text-dark" htmlFor="jcSwitch">
                        JazzCash Mobile Wallet
                      </label>
                    </div>
                    <Input
                      label="Merchant Mobile Account"
                      value={settings.payment.jazzcashNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          payment: { ...settings.payment, jazzcashNumber: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-top d-flex justify-content-end">
            <Button type="submit" variant="primary" size="lg" isLoading={isSaving} icon="bi-check2-circle">
              Save All Configuration Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
