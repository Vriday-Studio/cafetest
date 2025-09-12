import React, { useState } from 'react';
import { database } from '../firebase/config';
import { ref, push, get, query, orderByChild, equalTo } from 'firebase/database';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  available: boolean;
  stock: number;
  date: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderPageProps {
  menu: MenuItem[];
  onBack: () => void;
}

const OrderPage: React.FC<OrderPageProps> = ({ menu, onBack }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNo, setTableNo] = useState('');
  const [loading, setLoading] = useState(false);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter(item => item.id !== itemId);
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const checkTableAvailability = async (tableNumber: string) => {
    try {
      const ordersRef = ref(database, 'orders');
      // This query now requires the .indexOn rule
      const tableQuery = query(
        ordersRef,
        orderByChild('tableNo'),
        equalTo(tableNumber)
      );
      
      const snapshot = await get(tableQuery);
      if (!snapshot.exists()) {
        return true; // Table is available
      }

      // Check if there are any active orders for this table
      const orders = snapshot.val();
      const activeOrder = Object.values(orders).some((order: any) => 
        order.status !== 'leave'
      );

      return !activeOrder; // Return true if no active orders
    } catch (error) {
      console.error('Error checking table availability:', error);
      throw error;
    }
  };

  const handleSubmitOrder = async () => {
    if (!tableNo) {
      alert('Silakan masukkan nomor meja');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang masih kosong');
      return;
    }

    setLoading(true);
    try {
      // Check table availability
      const isTableAvailable = await checkTableAvailability(tableNo);
      if (!isTableAvailable) {
        alert('Meja ini sedang digunakan. Silakan pilih meja lain.');
        setLoading(false);
        return;
      }

      const orderRef = ref(database, 'orders');
      await push(orderRef, {
        tableNo,
        items: cart.map(item => ({
          food_id: item.id,
          food_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: calculateTotal(),
        status: 'queuing',
        timestamp: new Date().toISOString()
      });

      setCart([]);
      setTableNo('');
      alert('Pesanan berhasil dibuat!');
    } catch (error) {
      alert('Gagal membuat pesanan: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>🍽️ Pesan Menu</h1>
        <button onClick={onBack} style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>← Kembali</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Menu List */}
        <div>
          <h2>Daftar Menu</h2>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {menu.map((item) => (
              <div key={item.id} style={{
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column"
              }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "0.5rem"
                  }}
                />
                <h3>{item.name}</h3>
                <p>Rp {item.price.toLocaleString()}</p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={!item.available || item.stock <= 0}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: item.available && item.stock > 0 ? "#28a745" : "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: item.available && item.stock > 0 ? "pointer" : "not-allowed",
                    marginTop: "auto"
                  }}
                >
                  + Tambah ke Keranjang
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div style={{
          position: "sticky",
          top: "1rem",
          backgroundColor: "#f8f9fa",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <h2>🛒 Keranjang</h2>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="tableNo">Nomor Meja: </label>
            <input
              type="text"
              id="tableNo"
              value={tableNo}
              onChange={(e) => setTableNo(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ddd",
                width: "100%"
              }}
            />
          </div>
          
          {cart.map((item) => (
            <div key={item.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.5rem 0",
              borderBottom: "1px solid #ddd"
            }}>
              <div>
                <p style={{ fontWeight: "bold" }}>{item.name}</p>
                <p>Rp {item.price.toLocaleString()} x {item.quantity}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  style={{
                    padding: "0.25rem 0.5rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "1rem", borderTop: "2px solid #ddd", paddingTop: "1rem" }}>
            <h3>Total: Rp {calculateTotal().toLocaleString()}</h3>
            <button
              onClick={handleSubmitOrder}
              disabled={loading || cart.length === 0}
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading || cart.length === 0 ? "not-allowed" : "pointer",
                opacity: loading || cart.length === 0 ? 0.7 : 1,
                marginTop: "1rem"
              }}
            >
              {loading ? "Memproses..." : "Submit Pesanan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;