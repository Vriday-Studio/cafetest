import React, { useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, onValue, update, set } from 'firebase/database';

interface OrderItem {
  food_id: string;
  food_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  tableNo: string;
  items: OrderItem[];
  total_price: number;
  status: 'queuing' | 'cooking' | 'completed' | 'paid' | 'leave';
  timestamp: string;
}

interface CashierPageProps {
  onBack: () => void;
}

const CashierPage: React.FC<CashierPageProps> = ({ onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setOrders([]);
          return;
        }

        const data = snapshot.val();
        const ordersList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));

        // Sort orders by timestamp, newest first
        ordersList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setOrders(ordersList);
      } catch (err) {
        setError(`Failed to load orders: ${err}`);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      // Cleanup subscription
      unsubscribe();
    };
  }, []);

  const updateTableAvailability = async (tableNo: string, isAvailable: boolean) => {
    try {
      const mejaRef = ref(database, `meja/${tableNo}`);
      await set(mejaRef, {
        available: isAvailable ? "available" : "not available"
      });
    } catch (err) {
      console.error('Error updating table availability:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status'], tableNo: string) => {
    try {
      const orderRef = ref(database, `orders/${orderId}`);
      await update(orderRef, { status: newStatus });

      // If status is 'leave', update table availability
      if (newStatus === 'leave') {
        await updateTableAvailability(tableNo, true);
      }
    } catch (err) {
      alert(`Failed to update order status: ${err}`);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'queuing': return '#dc3545';
      case 'cooking': return '#ffc107';
      case 'completed': return '#28a745';
      case 'paid': return '#007bff';
      case 'leave': return '#6c757d';
      default: return '#6c757d';
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>💰 Kasir Dashboard</h1>
        <button
          onClick={onBack}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ← Kembali
        </button>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3>Meja #{order.tableNo}</h3>
                <p style={{ color: "#666" }}>
                  {new Date(order.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
              <div style={{ 
                backgroundColor: getStatusColor(order.status),
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.875rem"
              }}>
                {order.status.toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              {order.items.map((item, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>{item.food_name} x{item.quantity}</span>
                  <span>Rp {item.price.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid #eee", paddingTop: "0.5rem", fontWeight: "bold" }}>
                Total: Rp {order.total_price.toLocaleString()}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {order.status === 'queuing' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'cooking')}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ffc107",
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  🔥 Mulai Masak
                </button>
              )}
              {order.status === 'cooking' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'completed')}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  ✅ Selesai Masak
                </button>
              )}
              {order.status === 'completed' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'paid')}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  💳 Tandai Sudah Bayar
                </button>
              )}
              {order.status === 'paid' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'leave', order.tableNo)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  🚶 Tandai Telah Pergi
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashierPage;