import React from 'react';
import { MenuItem } from '../types';
import '../styles/Receipt.css';

interface ReceiptProps {
  menuItems: MenuItem[];
  selectedItems: { [key: number]: number };
  selectedTable: string;
  date: string;
}

const Receipt: React.FC<ReceiptProps> = ({ menuItems, selectedItems, selectedTable, date }) => {
  const total = menuItems.reduce((sum, item) => sum + (selectedItems[item.id] || 0) * item.price, 0);
  const totalRupiah = total;

  return (
    <div className="receipt" style={{ padding: '20px', maxWidth: '300px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 5px 0' }}>VRIDAY RESTO</h2>
        <p style={{ margin: '0', fontSize: '14px' }}>Table: {selectedTable}</p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>Date: {date}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ borderBottom: '1px dashed #000', marginBottom: '10px' }}></div>
        {menuItems.map(item => {
          const quantity = selectedItems[item.id] || 0;
          if (quantity > 0) {
            const itemTotal = quantity * item.price;
            return (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <div>
                  <p style={{ margin: '0', fontSize: '14px' }}>{item.name} x{quantity}</p>
                </div>
                <div>
                  <p style={{ margin: '0', fontSize: '14px' }}>Rp{itemTotal.toLocaleString('id-ID')}</p>
                </div>
              </div>
            );
          }
          return null;
        })}
        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <p style={{ margin: '0' }}>Total:</p>
          <p style={{ margin: '0' }}>Rp{totalRupiah.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic' }}>Thank you for buying!</p>
      </div>
    </div>
  );
};

export default Receipt;
