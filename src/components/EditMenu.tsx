import React, { useState } from 'react';
import { database } from '../firebase/config';
import { ref, update } from 'firebase/database';

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

interface EditMenuProps {
  item: MenuItem;
  onBack: () => void;
  onUpdate: () => void;
}

const EditMenu: React.FC<EditMenuProps> = ({ item, onBack, onUpdate }) => {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [image, setImage] = useState(item.image);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState(item.category);
  const [available, setAvailable] = useState(item.available);
  const [stock, setStock] = useState(item.stock.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const menuRef = ref(database, `menu/${item.id}`);
      await update(menuRef, {
        name,
        price: Number(price),
        image,
        description,
        category,
        available,
        stock: Number(stock),
        date: new Date().toISOString()
      });

      alert('Menu berhasil diperbarui!');
      onUpdate();
      onBack();
    } catch (err) {
      setError(`Failed to update menu: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>✏️ Edit Menu</h1>
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

      {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem" }}>Nama Menu *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          />
        </div>

        <div>
          <label htmlFor="price" style={{ display: "block", marginBottom: "0.5rem" }}>Harga (Rp) *</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          />
        </div>

        <div>
          <label htmlFor="image" style={{ display: "block", marginBottom: "0.5rem" }}>URL Gambar *</label>
          <input
            type="text"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          />
        </div>

        <div>
          <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem" }}>Deskripsi</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              minHeight: "100px"
            }}
          />
        </div>

        <div>
          <label htmlFor="category" style={{ display: "block", marginBottom: "0.5rem" }}>Kategori *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          >
            <option value="makanan">Makanan</option>
            <option value="minuman">Minuman</option>
            <option value="dessert">Dessert</option>
          </select>
        </div>

        <div>
          <label htmlFor="stock" style={{ display: "block", marginBottom: "0.5rem" }}>Stok *</label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            Tersedia
          </label>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              flex: 1
            }}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMenu;