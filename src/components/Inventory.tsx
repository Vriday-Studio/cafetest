import React, { useState } from 'react';
import { MenuItem } from '../types';

interface InventoryProps {
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  onBack: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ menuItems, setMenuItems, onBack }) => {
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState<'main' | 'opening' | 'drink'>('main');
  const [editAvailable, setEditAvailable] = useState(true);

  const startEdit = (item: MenuItem) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditImage(item.image || '');
    setEditDescription(item.description);
    setEditCategory(item.category);
    setEditAvailable(item.available);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditPrice('');
    setEditImage('');
    setEditDescription('');
    setEditCategory('main');
    setEditAvailable(true);
  };

  const saveEdit = async () => {
    if (!editName || !editPrice || isNaN(Number(editPrice)) || !editDescription || !editCategory) {
      setError('Please enter all fields correctly');
      return;
    }
    const updatedMenu = menuItems.map(item =>
      item.id === editId
        ? {
            ...item,
            name: editName,
            price: Number(editPrice),
            image: editImage,
            description: editDescription,
            category: editCategory,
            available: editAvailable,
          }
        : item
    );
    setMenuItems(updatedMenu);
    try {
      await fetch('http://localhost:4000/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMenu),
      });
    } catch (e) {}
    cancelEdit();
    setError('');
  };
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'main' | 'opening' | 'drink'>('main');
  const [error, setError] = useState('');

  const handleAddMenu = async () => {
    if (!newName || !newPrice || isNaN(Number(newPrice)) || !newDescription || !newCategory) {
      setError('Please enter all fields correctly');
      return;
    }
    const newItem: MenuItem = {
      id: Date.now(),
      name: newName,
      price: Number(newPrice),
      image: newImage,
      description: newDescription,
      category: newCategory,
      available: true,
    };
    const updatedMenu = [...menuItems, newItem];
    setMenuItems(updatedMenu);
    // Save to JSON file
    try {
      await fetch('http://localhost:4000/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMenu),
      });
    } catch (e) {
      // ignore error for now
    }
    setNewName('');
    setNewPrice('');
    setNewImage('');
    setNewDescription('');
    setNewCategory('main');
    setError('');
  };

  const toggleAvailability = (id: number) => {
    setMenuItems(menuItems.map(item =>
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>Inventory Management</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Menu name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="number"
          placeholder="Price"
          value={newPrice}
          onChange={e => setNewPrice(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Image source URL"
          value={newImage}
          onChange={e => setNewImage(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          type="text"
          placeholder="Description"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <select value={newCategory} onChange={e => setNewCategory(e.target.value as 'main' | 'opening' | 'drink')} style={{ marginRight: 10 }}>
          <option value="main">Main</option>
          <option value="opening">Opening</option>
          <option value="drink">Drink</option>
        </select>
        <br></br>
               <br></br>
        <button onClick={handleAddMenu}>Add Menu</button>
               <br></br>
        {error && <span style={{ color: 'red', marginLeft: 10 }}>{error}</span>}
        <div style={{ marginTop: 16 }}>
          <button onClick={onBack} style={{ background: '#dc3545', color: '#fff', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back to Main Menu</button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc' }}>Name</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Price</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Image</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Description</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Category</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Available</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map(item => (
            editId === item.id ? (
              <tr key={item.id} style={{ background: '#fff3cd' }}>
                <td><input value={editName} onChange={e => setEditName(e.target.value)} /></td>
                <td><input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} /></td>
                <td><input value={editImage} onChange={e => setEditImage(e.target.value)} /></td>
                <td><input value={editDescription} onChange={e => setEditDescription(e.target.value)} /></td>
                <td>
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value as 'main' | 'opening' | 'drink')}>
                    <option value="main">Main</option>
                    <option value="opening">Opening</option>
                    <option value="drink">Drink</option>
                  </select>
                </td>
                <td>
                  <select value={editAvailable ? 'yes' : 'no'} onChange={e => setEditAvailable(e.target.value === 'yes')}>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td>
                  <button onClick={saveEdit} style={{ marginRight: 5 }}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>Rp{item.price.toLocaleString('id-ID')}</td>
                <td>{item.image ? <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover' }} /> : '-'}</td>
                <td>{item.description}</td>
                <td>{item.category}</td>
                <td>{item.available ? 'Yes' : 'No'}</td>
                <td>
                 
                  <button onClick={() => startEdit(item)}>Edit</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
