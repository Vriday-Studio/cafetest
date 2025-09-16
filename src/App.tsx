import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { database } from './firebase/config';
import { ref, get, child } from 'firebase/database';
import Inventory from './components/Inventory';
import AddMenu from './components/AddMenu';
import OrderPage from './components/OrderPage';
import CashierPage from './components/CashierPage';
import EditMenu from './components/EditMenu';

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

const App: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inventoryText, setInventoryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'menu' | 'inventory' | 'add-menu' | 'order' | 'cashier' | 'edit-menu'>('menu');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const fetchInventory = async () => {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'menu'));

      if (!snapshot.exists()) {
        setMenu([]);
        return;
      }

      const data = snapshot.val();
      const menuItems = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: value.id || key,
        name: value.name || '',
        price: Number(value.price) || 0,
        image: value.image || '',
        description: value.description || '',
        category: value.category || '',
        available: value.available === true,
        stock: Number(value.stock) || 0,
        date: value.date || ''
      }));

      console.log("Firebase menu data:", menuItems);
      setMenu(menuItems);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError(`Failed to load inventory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const Assistant = () => (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px',
      zIndex: 1000,
      pointerEvents: 'none' // Make the container not block clicks
    }}>
      {/* Speech Bubble with image */}
      <div style={{
        position: 'relative',
        marginBottom: '40px'
      }}>
        <img 
          src="/images/baloon.png"
          alt="Speech Balloon"
          style={{
            width: '250px',
            height: 'auto',
            opacity: 0.5, // Make balloon 50% transparent
          }}
        />
        <p style={{ 
          position: 'absolute',
          top: '40%',
          left: '40%',
          transform: 'translate(-50%, -50%)',
          margin: '10px',
          color: '#000',
          fontSize: '16px',
          textAlign: 'center',
          width: 'calc(100% - 80px)', // Account for margins
          padding: '5px 10px',
          fontWeight: 'bold' // Make text more visible against transparent background
        }}>
          Selamat Datang  di Restoran kami!
        </p>
      </div>

      {/* Assistant Image */}
      <img 
        src="/images/maid.png"
        alt="Assistant"
        style={{
          width: '180px',
          height: 'auto',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
          pointerEvents: 'auto' // Allow assistant image to be clickable if needed
        }}
      />
    </div>
  );

  const renderContent = () => {
    if (loading) return (
      <>
        <p>Loading menu...</p>
        <Assistant />
      </>
    );
    
    if (error) return (
      <>
        <p style={{ color: "red" }}>{error}</p>
        <Assistant />
      </>
    );

    switch(currentPage) {
      case 'inventory':
        return (
          <>
            <Inventory onBack={() => setCurrentPage('menu')} />
            <Assistant />
          </>
        );
      case 'add-menu':
        return (
          <>
            <AddMenu onBack={() => setCurrentPage('menu')} />
            <Assistant />
          </>
        );
      case 'order':
        return (
          <>
            <OrderPage menu={menu} onBack={() => setCurrentPage('menu')} />
            <Assistant />
          </>
        );
      case 'cashier':
        return (
          <>
            <CashierPage onBack={() => setCurrentPage('menu')} />
            <Assistant />
          </>
        );
      case 'edit-menu':
        return (
          <>
            {selectedItem && (
              <EditMenu 
                item={selectedItem} 
                onBack={() => setCurrentPage('menu')} 
                onUpdate={fetchInventory} 
              />
            )}
            <Assistant />
          </>
        );
      default:
        return (
          <>
            <div style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>📋Vriday Resto</h1>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => setCurrentPage('cashier')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#6f42c1",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    💰 Kasir
                  </button>
                  <button
                    onClick={() => setCurrentPage('order')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    🍽️ Pesan Menu
                  </button>
                  <button
                    onClick={() => setCurrentPage('add-menu')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    ➕ Add New Menu
                  </button>
                  
                </div>
              </div>
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {menu.map((item) => (
                  <div key={item.id} style={{ 
                    border: "1px solid #ddd", 
                    padding: "1rem", 
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        marginBottom: "0.5rem"
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.jpg'; // Fallback image
                        e.currentTarget.onerror = null; // Prevent infinite loop
                      }}
                    />
                    <h3 style={{ margin: "0.5rem 0" }}>{item.name}</h3>
                    <p style={{ color: "#666" }}>{item.description}</p>
                    <p style={{ fontWeight: "bold" }}>Harga: Rp {item.price.toLocaleString()}</p>
                    <p>Stok: {item.stock}</p>
                    <p style={{ 
                      color: item.available ? "green" : "red",
                      fontWeight: "bold" 
                    }}>
                      Status: {item.available ? "Tersedia" : "Tidak Tersedia"}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setCurrentPage('edit-menu');
                      }}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#ffc107",
                        color: "black",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginTop: "0.5rem"
                      }}
                    >
                      ✏️ Edit Menu
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Assistant />
          </>
        );
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
};

export default App;
