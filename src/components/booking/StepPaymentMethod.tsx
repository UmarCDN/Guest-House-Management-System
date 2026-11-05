import React, { useState } from 'react';
import { PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface StepPaymentMethodProps {
  totalAmount: number;
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onBack: () => void;
  onCompleteBooking: () => void;
  isLoading: boolean;
}

export const StepPaymentMethod: React.FC<StepPaymentMethodProps> = ({
  totalAmount,
  selectedMethod,
  onSelectMethod,
  onBack,
  onCompleteBooking,
  isLoading
}) => {
  // Placeholder mock form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('ZAINAB AHMED');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('889');
  const [mobileWalletNumber, setMobileWalletNumber] = useState('03001234567');
  const [transactionCode, setTransactionCode] = useState('');

  return (
    <div>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">
              <i className="bi bi-wallet2 text-primary me-2" />
              Step 3: Select Payment Method
            </h5>
            <p className="text-muted small mb-0">
              Choose your preferred payment gateway. Transactions are secured and encrypted.
            </p>
          </div>
          <div className="mt-2 mt-md-0 text-md-end">
            <span className="text-muted small d-block">Amount Due:</span>
            <span className="h4 fw-bold text-primary font-monospace">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Payment Methods Selection Grid */}
        <div className="row g-3 mb-4">
          {/* Credit / Debit Card */}
          <div className="col-md-4 col-sm-6">
            <div
              className={`p-3 rounded-3 text-center cursor-pointer h-100 transition-all payment-card position-relative ${
                selectedMethod === 'Credit/Debit Card' ? 'active' : ''
              }`}
              onClick={() => onSelectMethod('Credit/Debit Card')}
            >
              {selectedMethod === 'Credit/Debit Card' && (
                <span className="badge bg-white text-primary rounded-pill small px-2 py-0.5 position-absolute top-0 end-0 m-2 shadow-sm">
                  <i className="bi bi-check-lg" />
                </span>
              )}
              <div className={`fs-3 mb-2 ${selectedMethod === 'Credit/Debit Card' ? 'text-white' : 'text-primary'}`}>
                <i className="bi bi-credit-card-2-front" />
              </div>
              <h6 className={`fw-bold mb-1 small ${selectedMethod === 'Credit/Debit Card' ? 'text-white' : 'text-dark'}`}>
                Credit / Debit Card
              </h6>
              <small className={selectedMethod === 'Credit/Debit Card' ? 'text-white text-opacity-75' : 'text-muted'} style={{ fontSize: '0.75rem' }}>
                Visa, MasterCard, UnionPay
              </small>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="col-md-4 col-sm-6">
            <div
              className={`p-3 rounded-3 text-center cursor-pointer h-100 transition-all payment-card position-relative ${
                selectedMethod === 'Bank Transfer' ? 'active' : ''
              }`}
              onClick={() => onSelectMethod('Bank Transfer')}
            >
              {selectedMethod === 'Bank Transfer' && (
                <span className="badge bg-white text-primary rounded-pill small px-2 py-0.5 position-absolute top-0 end-0 m-2 shadow-sm">
                  <i className="bi bi-check-lg" />
                </span>
              )}
              <div className={`fs-3 mb-2 ${selectedMethod === 'Bank Transfer' ? 'text-white' : 'text-success'}`}>
                <i className="bi bi-bank" />
              </div>
              <h6 className={`fw-bold mb-1 small ${selectedMethod === 'Bank Transfer' ? 'text-white' : 'text-dark'}`}>
                Direct Bank Transfer
              </h6>
              <small className={selectedMethod === 'Bank Transfer' ? 'text-white text-opacity-75' : 'text-muted'} style={{ fontSize: '0.75rem' }}>
                Online IBAN Wire Transfer
              </small>
            </div>
          </div>

          {/* Cash on Arrival */}
          <div className="col-md-4 col-sm-6">
            <div
              className={`p-3 rounded-3 text-center cursor-pointer h-100 transition-all payment-card position-relative ${
                selectedMethod === 'Cash on Arrival' ? 'active' : ''
              }`}
              onClick={() => onSelectMethod('Cash on Arrival')}
            >
              {selectedMethod === 'Cash on Arrival' && (
                <span className="badge bg-white text-primary rounded-pill small px-2 py-0.5 position-absolute top-0 end-0 m-2 shadow-sm">
                  <i className="bi bi-check-lg" />
                </span>
              )}
              <div className={`fs-3 mb-2 ${selectedMethod === 'Cash on Arrival' ? 'text-white' : 'text-warning'}`}>
                <i className="bi bi-cash-stack" />
              </div>
              <h6 className={`fw-bold mb-1 small ${selectedMethod === 'Cash on Arrival' ? 'text-white' : 'text-dark'}`}>
                Cash on Arrival
              </h6>
              <small className={selectedMethod === 'Cash on Arrival' ? 'text-white text-opacity-75' : 'text-muted'} style={{ fontSize: '0.75rem' }}>
                Pay at front desk upon check-in
              </small>
            </div>
          </div>

          {/* Easypaisa */}
          <div className="col-md-6 col-sm-6">
            <div
              className={`p-3 rounded-3 text-center cursor-pointer h-100 transition-all payment-card position-relative ${
                selectedMethod === 'Easypaisa' ? 'active' : ''
              }`}
              onClick={() => onSelectMethod('Easypaisa')}
            >
              {selectedMethod === 'Easypaisa' && (
                <span className="badge bg-white text-primary rounded-pill small px-2 py-0.5 position-absolute top-0 end-0 m-2 shadow-sm">
                  <i className="bi bi-check-lg" />
                </span>
              )}
              <div className={`fs-3 mb-2 ${selectedMethod === 'Easypaisa' ? 'text-white' : 'text-success'}`}>
                <i className="bi bi-phone" />
              </div>
              <h6 className={`fw-bold mb-1 small ${selectedMethod === 'Easypaisa' ? 'text-white' : 'text-dark'}`}>
                Easypaisa Mobile Account
              </h6>
              <small className={selectedMethod === 'Easypaisa' ? 'text-white text-opacity-75' : 'text-muted'} style={{ fontSize: '0.75rem' }}>
                Instant digital wallet transfer
              </small>
            </div>
          </div>

          {/* JazzCash */}
          <div className="col-md-6 col-sm-6">
            <div
              className={`p-3 rounded-3 text-center cursor-pointer h-100 transition-all payment-card position-relative ${
                selectedMethod === 'JazzCash' ? 'active' : ''
              }`}
              onClick={() => onSelectMethod('JazzCash')}
            >
              {selectedMethod === 'JazzCash' && (
                <span className="badge bg-white text-primary rounded-pill small px-2 py-0.5 position-absolute top-0 end-0 m-2 shadow-sm">
                  <i className="bi bi-check-lg" />
                </span>
              )}
              <div className={`fs-3 mb-2 ${selectedMethod === 'JazzCash' ? 'text-white' : 'text-danger'}`}>
                <i className="bi bi-wallet" />
              </div>
              <h6 className={`fw-bold mb-1 small ${selectedMethod === 'JazzCash' ? 'text-white' : 'text-dark'}`}>
                JazzCash Wallet
              </h6>
              <small className={selectedMethod === 'JazzCash' ? 'text-white text-opacity-75' : 'text-muted'} style={{ fontSize: '0.75rem' }}>
                Fast mobile payments & OTC
              </small>
            </div>
          </div>
        </div>

        {/* Dynamic Payment Details Forms */}
        <div className="p-4 bg-light rounded-3 border">
          {selectedMethod === 'Credit/Debit Card' && (
            <div>
              <h6 className="fw-bold text-dark mb-3">
                <i className="bi bi-shield-lock text-primary me-2" />
                Credit or Debit Card Details (Test Simulation)
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    icon="bi-credit-card"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Name on Card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    icon="bi-person"
                    placeholder="CARDHOLDER NAME"
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Expiration Date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Security Code (CVV)"
                    type="password"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                  />
                </div>
              </div>
              <div className="alert alert-info py-2 px-3 small mt-2 mb-0">
                <i className="bi bi-info-circle me-1" />
                This is a mock payment simulation. No real money will be deducted from your account.
              </div>
            </div>
          )}

          {selectedMethod === 'Bank Transfer' && (
            <div>
              <h6 className="fw-bold text-dark mb-2">
                <i className="bi bi-building-check text-success me-2" />
                Serene Haven Official Bank Account
              </h6>
              <p className="text-secondary small mb-3">
                Please transfer the total amount to the account below and enter your transfer reference code.
              </p>
              <div className="p-3 bg-white rounded border mb-3 small">
                <div className="row g-2">
                  <div className="col-sm-6"><strong>Bank Name:</strong> Habib Bank Limited (HBL)</div>
                  <div className="col-sm-6"><strong>Account Title:</strong> Serene Haven Lodging Pvt Ltd</div>
                  <div className="col-sm-6"><strong>Account Number:</strong> 0042-791823901</div>
                  <div className="col-sm-6"><strong>IBAN:</strong> PK36HABB000042791823901</div>
                </div>
              </div>
              <Input
                label="Bank Transfer Reference / Transaction ID"
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                placeholder="e.g. HBL-FT-994821"
                icon="bi-receipt"
                helpText="Optional for instant booking approval"
              />
            </div>
          )}

          {selectedMethod === 'Cash on Arrival' && (
            <div className="text-center py-3">
              <div className="text-warning display-5 mb-2">
                <i className="bi bi-cash-coin" />
              </div>
              <h6 className="fw-bold text-dark mb-1">Pay with Cash Upon Check-In</h6>
              <p className="text-muted small mx-auto mb-0" style={{ maxWidth: '500px' }}>
                Your room reservation will be immediately confirmed. You can pay the total folio amount of <strong>{formatCurrency(totalAmount)}</strong> in cash or local debit card at the front desk when you arrive.
              </p>
            </div>
          )}

          {(selectedMethod === 'Easypaisa' || selectedMethod === 'JazzCash') && (
            <div>
              <h6 className="fw-bold text-dark mb-2">
                <i className="bi bi-phone text-success me-2" />
                {selectedMethod} Direct Wallet Payment
              </h6>
              <p className="text-secondary small mb-3">
                Send <strong>{formatCurrency(totalAmount)}</strong> to our verified merchant account <strong>0300-1234567</strong> (Title: Serene Haven) and enter your mobile number.
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    label={`Your ${selectedMethod} Mobile Number`}
                    value={mobileWalletNumber}
                    onChange={(e) => setMobileWalletNumber(e.target.value)}
                    icon="bi-phone"
                    placeholder="03001234567"
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    label="Transaction ID (TID)"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    icon="bi-hash"
                    placeholder="e.g. 9812401829"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <Button variant="outline-secondary" size="lg" icon="bi-arrow-left" onClick={onBack} disabled={isLoading}>
          Back to Review
        </Button>
        <Button
          variant="success"
          size="lg"
          icon="bi-check-circle"
          onClick={onCompleteBooking}
          isLoading={isLoading}
        >
          Confirm & Complete Reservation
        </Button>
      </div>
    </div>
  );
};
