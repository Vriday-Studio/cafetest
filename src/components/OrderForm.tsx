import React, { useState } from 'react';
import { MenuItem } from '../types';

interface OrderFormProps {
  menuItems: MenuItem[];
  selectedItems: { [key: number]: number };
  onOrderSubmit: (order: { [key: number]: number }) => void;
  onPrevious: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ menuItems, selectedItems, onOrderSubmit, onPrevious }) => {
  const [localSelectedItems, setLocalSelectedItems] = useState<{ [key: number]: number }>(selectedItems);

  const handleQuantityChange = (itemId: number, quantity: number) => {
    setLocalSelectedItems((prev) => ({
      ...prev,
      [itemId]: quantity,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onOrderSubmit(localSelectedItems);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Order Form</h2>
      {menuItems.map((item) => (
        <div key={item.id}>
          <label>
            {item.name} - Rp{(item.price).toLocaleString('id-ID')}
            <input
              type="number"
              min="0"
              value={localSelectedItems[item.id] || 0}
              onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
            />
          </label>
        </div>
      ))}
      <button type="submit">Submit Order</button>
      <button type="button" onClick={onPrevious}>Back</button>
    </form>
  );
};

export default OrderForm;