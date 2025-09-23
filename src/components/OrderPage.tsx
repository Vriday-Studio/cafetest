import React, { useState, useEffect } from 'react';
import { database } from '../firebase/config';
import { ref, push, get, query, orderByChild, equalTo, set } from 'firebase/database';
import { useAssistant } from '../context/AssistantContext';

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

interface TableButton {
  number: string;
  available: boolean;
}

interface TableStatus {
  available: "available" | "not available";
}

const OrderPage: React.FC<OrderPageProps> = ({ menu, onBack }) => {
  const { setInstructionAssistant, sendAssistantMessage } = useAssistant();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNo, setTableNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<TableButton[]>([]);
  const [maxTables, setMaxTables] = useState(10);
  const [diningOption, setDiningOption] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [response, setResponse] = useState<string>(''); // Add this line

  const fetchTableAvailability = async (tableNumber: string): Promise<boolean> => {
    const mejaRef = ref(database, `meja/${tableNumber}`);
    const snapshot = await get(mejaRef);
    if (!snapshot.exists()) return true;
    return snapshot.val().available === "available";
  };

  useEffect(() => {
    const initializeTables = async () => {
      const tableButtons: TableButton[] = [];
      for (let i = 1; i <= maxTables; i++) {
        const tableNumber = i.toString().padStart(2, '0');
        const isAvailable = await fetchTableAvailability(tableNumber);
        tableButtons.push({
          number: tableNumber,
          available: isAvailable
        });
      }
      setTables(tableButtons);
    };

    initializeTables();
  }, [maxTables]);

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

  // Update the checkTableAvailability function
  const checkTableAvailability = async (tableNumber: string) => {
    try {
      // Check meja status first
      const mejaRef = ref(database, `meja/${tableNumber}`);
      const mejaSnapshot = await get(mejaRef);
      
      // If meja doesn't exist in database, create it with default status
      if (!mejaSnapshot.exists()) {
        await set(mejaRef, {
          available: "available"
        });
        return true;
      }

      // Check orders
      const ordersRef = ref(database, 'orders');
      const tableQuery = query(
        ordersRef,
        orderByChild('tableNo'),
        equalTo(tableNumber)
      );
      
      const orderSnapshot = await get(tableQuery);
      if (!orderSnapshot.exists()) {
        return true; // No orders for this table
      }

      // Check orders for this table
      const orders = orderSnapshot.val();
      const ordersList = Object.values(orders) as any[];
      
      // Sort orders by timestamp to get the latest order
      ordersList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Get most recent order
      const latestOrder = ordersList[0];
      const isAvailable = latestOrder.status === 'leave';

      // Update meja status in database
      await set(mejaRef, {
        available: isAvailable ? "available" : "not available"
      });

      return isAvailable;
    } catch (error) {
      console.error('Error checking table availability:', error);
      throw error;
    }
  };

  // Add function to update table status when order is submitted
  const updateTableStatus = async (tableNumber: string, isAvailable: boolean) => {
    try {
      const mejaRef = ref(database, `meja/${tableNumber}`);
      await set(mejaRef, {
        available: isAvailable ? "available" : "not available"
      });
    } catch (error) {
      console.error('Error updating table status:', error);
      throw error;
    }
  };

  const handleSubmitOrder = async () => {
    if (diningOption === 'dine-in' && !tableNo) {
      alert('Silakan masukkan nomor meja untuk Dine-in');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang masih kosong');
      return;
    }

    setLoading(true);
    try {
      if (diningOption === 'dine-in') {
        const isTableAvailable = await checkTableAvailability(tableNo);
        if (!isTableAvailable) {
          alert('Meja ini sedang digunakan. Silakan pilih meja lain.');
          setLoading(false);
          return;
        }

        // Update table status to not available
        await updateTableStatus(tableNo, false);

        // Refresh table availability after updating status
        const tableButtons = await Promise.all(
          tables.map(async (table) => ({
            ...table,
            available: table.number === tableNo ? false : await fetchTableAvailability(table.number)
          }))
        );
        setTables(tableButtons);
      }

      const orderRef = ref(database, 'orders');
      await push(orderRef, {
        tableNo: diningOption === 'dine-in' ? tableNo : 'takeaway',
        items: cart.map(item => ({
          food_id: item.id,
          food_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: calculateTotal(),
        status: 'queuing',
        timestamp: new Date().toISOString(),
        diningOption
      });

      // Reset selections after successful order
      setCart([]);
      setTableNo('');
      alert('Pesanan berhasil dibuat!');
    } catch (error) {
      alert('Gagal membuat pesanan: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = () => {
    setMaxTables(prev => prev + 1);
  };

  const handleRemoveTable = () => {
    if (maxTables > 1) {
      setMaxTables(prev => prev - 1);
    }
  };

  const handleTableClick = (tableNum: string) => {
    setTableNo(tableNum);
  };

  // Modify the handleAddToCart function
  const handleAddToCart = async (item: MenuItem) => {
    addToCart(item);
    setInstructionAssistant(`saya pesan ${item.name} bagaimana pendapatmu?`);
    const assistantResponse = await sendAssistantMessage();
    setResponse(assistantResponse);
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
                  onClick={() => handleAddToCart(item)}
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
          
          {/* Dining Option Selection */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr", 
              gap: "0.5rem", 
              marginBottom: "1rem" 
            }}>
              <button
                onClick={() => setDiningOption('dine-in')}
                style={{
                  padding: "0.75rem",
                  backgroundColor: diningOption === 'dine-in' ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  opacity: diningOption === 'dine-in' ? 1 : 0.7
                }}
              >
                🪑 Dine In
              </button>
              <button
                onClick={() => setDiningOption('takeaway')}
                style={{
                  padding: "0.75rem",
                  backgroundColor: diningOption === 'takeaway' ? "#007bff" : "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  opacity: diningOption === 'takeaway' ? 1 : 0.7
                }}
              >
                📦 Take Away
              </button>
            </div>
          </div>

          {/* Table Selection - Only show for dine-in */}
          {diningOption === 'dine-in' && (
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="tableNo">Nomor Meja: </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "0.5rem" }}>
                {tables.map((table) => (
                  <button
                    key={table.number}
                    onClick={() => table.available ? handleTableClick(table.number) : null}
                    disabled={!table.available}
                    style={{
                      padding: "0.5rem",
                      backgroundColor: !table.available 
                        ? "#dc3545" // Red for unavailable
                        : tableNo === table.number 
                          ? "#28a745" // Green for selected
                          : "#007bff", // Blue for available
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: table.available ? "pointer" : "not-allowed",
                      opacity: table.available ? 1 : 0.7,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative"
                    }}
                  >
                    {table.number}
                    {!table.available && (
                      <span style={{ 
                        position: "absolute",
                        right: "4px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.7em"
                      }}>
                        ⛔
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                <button
                  onClick={handleRemoveTable}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "48%"
                  }}
                >
                  - Meja
                </button>
                <button
                  onClick={handleAddTable}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    width: "48%"
                  }}
                >
                  + Meja
                </button>
              </div>
            </div>
          )}

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

/*
{
  "rules": {
    "orders": {
      ".indexOn": ["tableNo", "status"],
      ".read": true,
      ".write": true
    },
    "menu": {
      ".read": true,
      ".write": true
    },
    "meja": {
      ".indexOn": ["available"],
      ".read": true,
      ".write": true,
      "$tableId": {
        ".validate": "newData.hasChild('available') && 
                     newData.child('available').isString() && 
                     (newData.child('available').val() === 'available' || 
                      newData.child('available').val() === 'not available')"
      }
    }
  }
}
*/