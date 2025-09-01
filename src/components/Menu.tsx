import React from 'react';
import { MenuItem } from '../types';

interface MenuProps {
  items: MenuItem[];
  cart: { [key: number]: number };
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onGoToPayment: () => void;
  selectedTable?: number | null;
}

const Menu: React.FC<MenuProps> = ({ items, cart, onAddToCart, onRemoveFromCart, onGoToPayment, selectedTable }) => {
  // Always use all menu items for bill calculation
  const allMenuItems = React.useRef<MenuItem[]>([]);
  if (items.length > 0 && allMenuItems.current.length === 0) {
    allMenuItems.current = items.concat();
  }
  // If parent passes all items as a prop, use that instead
  const billItems = allMenuItems.current.length > items.length ? allMenuItems.current : items;
  const total = billItems.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);
  const totalRupiah = total;
  return (
    <div className="menu">
      <h2>Japanese Food and Drink</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map(item => (
          <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', border: '1px solid #eee', borderRadius: '8px', padding: '1rem' }}>
            <img src={item.image} alt={item.name} style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px', marginRight: '1rem' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{item.description}</p>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Price: Rp {(item.price).toLocaleString('id-ID')}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Item No: {item.id}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button onClick={() => onAddToCart(item)} style={{ marginBottom: '0.5rem' }}>Add to Cart</button>
              <button onClick={() => onRemoveFromCart(item)} style={{ marginBottom: '0.5rem' }}>Remove from Cart</button>
              <span style={{ fontSize: '1rem', color: '#333' }}>In Cart: {cart[item.id] || 0}</span>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ borderTop: '2px solid #eee', marginTop: '2rem', paddingTop: '1rem' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {billItems.filter(item => cart[item.id]).map(item => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '1rem' }}>
              <span>{item.name} x {cart[item.id]}</span>
              <span>Rp {(item.price * cart[item.id]).toLocaleString('id-ID')}</span>
            </li>
          ))}
        </ul>
        <h3 style={{ textAlign: 'right' }}>Total Bill: Rp {totalRupiah.toLocaleString('id-ID')}</h3>
        {totalRupiah > 0 && (
          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <button onClick={onGoToPayment} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Go to Payment
            </button>
          </div>
        )}
        {typeof selectedTable === 'number' && selectedTable > 0 && (
          <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 'bold', color: '#28a745' }}>
            Table Selected: {selectedTable}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;