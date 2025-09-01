import React, { useState } from 'react';
import Menu from './components/Menu';
import TableSelect from './components/TableSelect';
import OrderForm from './components/OrderForm';
import Payment from './components/Payment';
import { MenuItem } from './types';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const handleSend = () => {
    sendStringToN8n(text);
  };
  // Example menu items
  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Kani Sushi',
      price: 55000,
      description: 'Crab stick sushi with Japanese rice and seaweed.',
      image: '/images/KANI-SUSHI-1.jpg',
      category: 'opening',
    },
    {
      id: 2,
      name: 'Yokohama Spicy Ramen',
      price: 33000,
      description: 'Spicy ramen noodles with pork, egg, and vegetables.',
      image: '/images/YOKOHAMA-SPICY-RAMEN.jpg',
      category: 'main',
    },
    {
      id: 3,
      name: 'Spicy Beef Donburi',
      price: 37000,
      description: 'Rice bowl topped with spicy beef and onions.',
      image: '/images/SPICY-BEEF-DONBURI.jpg',
      category: 'main',
    },
    {
      id: 4,
      name: 'Summer Mojito',
      price: 15000,
      description: 'Refreshing mojito with mint and lime.',
      image: '/images/SUMMER-MOJITO.jpg',
      category: 'drink',
    },
    {
      id: 5,
      name: 'Japanese Tea',
      price: 7000,
      description: 'Traditional Japanese green tea.',
      image: '/images/TEA.jpg',
      category: 'drink',
    },
    {
      id: 6,
      name: 'Tehbotol Sosro',
      price: 6000,
      description: 'Popular sweet bottled tea from Indonesia.',
      image: '/images/TEHBOTOL-SOSRO-KOTAK-3.jpg',
      category: 'drink',
    },
    {
      id: 7,
      name: 'Takoyaki',
      price: 16000,
      description: 'Popular Japanese street food made of battered octopus balls.',
      image: '/images/TAKOYAKI.jpg',
      category: 'opening',
    },
    {
      id: 8,
      name: 'Gyoza Steamed Dumplings',
      price: 6000,
      description: 'Delicious steamed dumplings filled with minced meat and vegetables.',
      image: '/images/GYOZA-STEAMED.jpg',
      category: 'opening',
    },{
      id: 9,
      name: 'Tempura Karage Bento',
      price: 36000,
      description: 'Bento with Karage tempura.',
      image: '/images/TEMPURA-KARAGE-BENTO.jpg',
      category: 'main',
    },
    {
      id: 10,
      name: 'Beef Teriyaki Bento',
      price: 39000,
      description: 'Bento with Beef Teriyaki.',
      image: '/images/BEEF-TERIYAKI-BENTO.jpg',
      category: 'main',
    },
  ];

  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [category, setCategory] = useState<'main' | 'opening' | 'drink' | 'all'>('all');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

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
        <h1>Vriday Resto</h1>
      </header>
      {currentStep === 1 && (
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
        </>
      )}
      {currentStep === 4 && (
        <TableSelect onTableSelect={(table) => { setSelectedTable(table); setCurrentStep(1); }} />
      )}
      {currentStep === 2 && (
        <OrderForm menuItems={menuItems} selectedItems={cart} onOrderSubmit={handleOrderSubmit} onPrevious={handlePreviousStep} />
      )}
      {currentStep === 3 && (
        <Payment menuItems={menuItems} selectedItems={cart} onPrevious={() => setCurrentStep(1)} />
      )}
    </div>
  );
};

export default App;