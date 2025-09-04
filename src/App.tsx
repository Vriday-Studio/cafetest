import React, { useState } from 'react';
import Menu from './components/Menu';
import TableSelect from './components/TableSelect';
import OrderForm from './components/OrderForm';
import Payment from './components/Payment';
import Inventory from './components/Inventory';
import { MenuItem } from './types';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const handleSend = () => {
    sendStringToN8n(text);
  };
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  React.useEffect(() => {
    fetch('http://localhost:4000/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMenuItems(data);
      });
  }, []);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [category, setCategory] = useState<'main' | 'opening' | 'drink' | 'all'>('all');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [page, setPage] = useState<'main' | 'inventory'>('main');

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[item.id] > 1) {
        newCart[item.id] -= 1;
      } else {
        delete newCart[item.id];
      }
      return newCart;
    });
  };
const sendStringToN8n = async (value: string): Promise<void> => {
  try {
    const webhookUrl = 'https://n8n.srv954455.hstgr.cloud/webhook-test/webhook-test';  // Replace with your actual webhook URL
    const response = await fetch(webhookUrl, {
      method: 'POST', // or 'GET' if your webhook expects GET
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: value }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    console.log('Response from n8n:', result);
  } catch (error) {
    console.error('Error sending data to n8n:', error);
  }
};
  const handleOrderSubmit = (order: { [key: number]: number }) => {
    setCart(order);
    setCurrentStep(3);
  };

  const handlePreviousStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  const filteredItems = category === 'all' ? menuItems : menuItems.filter(item => item.category === category);

  return (
    <div className="app">
      <header>
        <center><h1>Vriday Resto</h1></center>
      </header>
      {page === 'main' && (
        <>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <button onClick={() => setCategory('all')} style={{ marginRight: '0.5rem' }}>All</button>
            <button onClick={() => setCategory('main')} style={{ marginRight: '0.5rem' }}>Main Dish</button>
            <button onClick={() => setCategory('opening')} style={{ marginRight: '0.5rem' }}>Opening Dish</button>
            <button onClick={() => setCategory('drink')}>Drink</button>
          </div>
          <Menu
            items={filteredItems}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onGoToPayment={() => {
              handleSend();
              setCurrentStep(3);
            }}
            selectedTable={selectedTable}
          />
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={() => setCurrentStep(4)} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Choose Table to Eat at Place
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button onClick={() => setPage('inventory')} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Go to Inventory
            </button>
          </div>
        </>
      )}
      {page === 'inventory' && (
        <Inventory menuItems={menuItems} setMenuItems={setMenuItems} onBack={() => setPage('main')} />
      )}
      {currentStep === 4 && (
        <TableSelect onTableSelect={(table) => { setSelectedTable(table); setCurrentStep(1); }} />
      )}
      {currentStep === 2 && (
        <OrderForm menuItems={menuItems} selectedItems={cart} onOrderSubmit={handleOrderSubmit} onPrevious={handlePreviousStep} />
      )}
      {currentStep === 3 && (
        <Payment menuItems={menuItems} selectedItems={cart} selectedTable={selectedTable ? selectedTable.toString() : ''} onPrevious={() => setCurrentStep(1)} />
      )}
    </div>
  );
};

export default App;