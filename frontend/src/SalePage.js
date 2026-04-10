
import React, { useEffect, useState } from "react";

// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const formatUSD = (price) => price != null ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '';
const getImageUrl = (url) =>
  url && url.startsWith('/api/products/image/')
    ? `${API_BASE_URL}${url}`
    : url;

export default function SalePage({ onProductClick, selectedProduct, addToCart, styles, getImageUrl }) {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      setLoading(true);
      try {
        // Fetch all categories
        const catRes = await fetch(`${API_BASE_URL}/api/categories`);
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
        // Fetch all products on sale (discount > 0)
        const prodRes = await fetch(`${API_BASE_URL}/api/products`);
        const prodData = await prodRes.json();
        const saleProducts = Array.isArray(prodData)
          ? prodData.filter((p) => p.discount && p.discount > 0)
          : [];
        // Group by category
        const grouped = {};
        saleProducts.forEach((p) => {
          const catId = p.category ? p.category.id : "Other";
          if (!grouped[catId]) grouped[catId] = [];
          grouped[catId].push(p);
        });
        setProductsByCategory(grouped);
      } catch (err) {
        setCategories([]);
        setProductsByCategory({});
      }
      setLoading(false);
    };
    fetchSaleProducts();
  }, []);

  if (loading) return <div>Loading sale items...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>🔥 Sale - Discounted Products by Category</h2>
      {categories.filter(cat => (productsByCategory[cat.id] || []).length > 0).map((cat) => (
        <div key={cat.id} style={{ marginBottom: 32 }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 4 }}>{cat.name}</h3>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {productsByCategory[cat.id].map((product) => (
              <div
                key={product.id}
                style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 16, width: 220, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}
                onClick={() => onProductClick && onProductClick(product.id)}
              >
                {product.imageUrl && (
                  <img src={getImageUrl(product.imageUrl)} alt={product.name} style={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 6, marginBottom: 8, background: '#fff' }} />
                )}
                <h4 style={{ margin: '8px 0 4px 0' }}>{product.name}</h4>
                <div style={{ color: '#d9534f', fontWeight: 'bold', fontSize: 18 }}>
                  {formatUSD(product.price * (1 - product.discount / 100))}
                  <span style={{ textDecoration: 'line-through', color: '#888', fontWeight: 'normal', fontSize: 14, marginLeft: 8 }}>{formatUSD(product.price)}</span>
                </div>
                <div style={{ color: '#007bff', fontWeight: 500, fontSize: 14, margin: '4px 0' }}>-{product.discount}% OFF</div>
                <div style={{ color: '#555', fontSize: 13 }}>{product.description}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Product Details (same as App.js) */}
      {selectedProduct && typeof selectedProduct === 'object' && selectedProduct.id && (
        <div style={styles.detailsCard}>
          {selectedProduct.imageUrl && (
            <img src={getImageUrl(selectedProduct.imageUrl)} alt={selectedProduct.name} style={{ width: 220, maxHeight: 220, objectFit: 'contain', borderRadius: 8, marginBottom: 16, background: '#fff' }} />
          )}
          <h2>{selectedProduct.name || 'No Name'}</h2>
          {selectedProduct.discount && selectedProduct.discount > 0 && (
            <span style={{ color: "#d9534f", fontWeight: "bold", marginRight: 8 }}>Sale</span>
          )}
          {selectedProduct.color && (
            <div style={{ marginBottom: 4, color: '#555', fontSize: 15 }}>
              <strong>Color:</strong> {selectedProduct.color}
            </div>
          )}
          {selectedProduct.discount && selectedProduct.discount > 0 && selectedProduct.price ? (
            <p>
              <strong>Price:</strong> <span style={{ color: "#d9534f", fontWeight: "bold" }}>{formatUSD(selectedProduct.price * (1 - selectedProduct.discount / 100))}</span>
              <span style={{ textDecoration: "line-through", color: "#888", fontWeight: "normal", fontSize: 16, marginLeft: 8 }}>{formatUSD(selectedProduct.price)}</span>
            </p>
          ) : (
            selectedProduct.price && <p><strong>Price:</strong> {formatUSD(selectedProduct.price)}</p>
          )}
          {selectedProduct.description && <p><strong>Description:</strong> {selectedProduct.description}</p>}
          {typeof selectedProduct.stock === 'number' && (
            <p>
              <strong>Status:</strong>{' '}
              <span
                style={{
                  color: selectedProduct.stock > 0 ? 'green' : 'red',
                  fontWeight: 'bold',
                }}
              >
                {selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </p>
          )}
          <button
            style={{
              ...styles.cartBtn,
              background: selectedProduct.stock > 0 ? styles.cartBtn.background : '#ccc',
              cursor: selectedProduct.stock > 0 ? 'pointer' : 'not-allowed',
            }}
            onClick={() => selectedProduct.stock > 0 && addToCart(selectedProduct)}
            disabled={selectedProduct.stock <= 0}
          >
            {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      )}
    </div>
  );
}
