import React, { useState, useEffect, useRef } from 'react';
import { MenuItem } from '../types';
import Receipt from './Receipt';
import '../styles/Payment.css';

interface PaymentProps {
  menuItems: MenuItem[];
  selectedItems: { [key: number]: number };
  selectedTable: string;
  onPrevious: () => void;
}

const Payment: React.FC<PaymentProps> = ({ menuItems, selectedItems, selectedTable, onPrevious }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qris'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [qrisStatus, setQrisStatus] = useState<'waiting' | 'scanning' | 'completed'>('waiting');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const total = menuItems.reduce((sum, item) => sum + (selectedItems[item.id] || 0) * item.price, 0);
  const totalRupiah = total;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (paymentMethod === 'qris' && qrisStatus === 'waiting') {
      // Simulate QRIS scanning after 3 seconds
      timer = setTimeout(() => {
        setQrisStatus('scanning');
        // Simulate payment completion after 2 more seconds
        setTimeout(() => {
          setQrisStatus('completed');
          setPaymentCompleted(true);
        }, 2000);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [paymentMethod, qrisStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      if (!cardNumber || !expiryDate || !cvv) {
        setError('Please fill in all fields');
        return;
      }
      // Process card payment logic here
      console.log('Card payment processed:', { cardNumber, expiryDate, cvv, total });
      setPaymentCompleted(true);
    }
    // Reset form
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setError('');
  };

  return (
    <div className="payment-container">
      <h2>Payment</h2>
      <p>Total: Rp{totalRupiah.toLocaleString('id-ID')}</p>
      
      <div className="payment-method-selector">
        <button 
          type="button"
          className={`method-button ${paymentMethod === 'card' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('card')}
        >
          Credit Card
        </button>
        <button 
          type="button"
          className={`method-button method-button-qris ${paymentMethod === 'qris' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('qris')}
        >
          QRIS
        </button>
      </div>

      {paymentMethod === 'card' ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
            <input
              type="text"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="button-group">
            <button type="submit">Pay Now</button>
          </div>
        </form>
      ) : (
        <div className="qris-container">
          <div className="qr-code-placeholder">
            {/* This would be replaced with an actual QR code in production */}
            <div className="fake-qr-code">
              QRIS Code
            </div>
          </div>
          <div className="qris-status">
            {qrisStatus === 'waiting' && (
              <p>Please scan the QR code with your payment app...</p>
            )}
            {qrisStatus === 'scanning' && (
              <p>Processing payment...</p>
            )}
            {qrisStatus === 'completed' && (
              <p>Payment completed successfully!</p>
            )}
          </div>
        </div>
      )}

      {paymentCompleted ? (
        <div className="payment-success">
          <h3>Payment Successful!</h3>
          <p>Thank you for your order.</p>
          <div className="receipt-container">
            <Receipt 
              menuItems={menuItems}
              selectedItems={selectedItems}
              selectedTable={selectedTable}
              date={new Date().toLocaleString()}
            />
          </div>
          <button 
            type="button" 
            onClick={() => window.print()}
            style={{ marginBottom: '10px' }}
          >
            Print Receipt
          </button>
          <button type="button" onClick={onPrevious}>Return to Menu</button>
        </div>
      ) : (
        <button type="button" onClick={onPrevious} className="back-button">
          Back to Menu
        </button>
      )}
    </div>
  );
};

export default Payment;