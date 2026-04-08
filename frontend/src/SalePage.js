import React, { useEffect, useState } from "react";

const getImageUrl = (url) =>
  url && url.startsWith('/api/products/image/')
    ? `http://localhost:8080${url}`
    : url;

export default function SalePage() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      setLoading(true);
      try {
        // Fetch all categories
        const catRes = await fetch("http://localhost:8080/api/categories");
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);
        // Fetch all products on sale (discount > 0)
        const prodRes = await fetch("http://localhost:8080/api/products");
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
              <div key={product.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 16, width: 220, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {product.imageUrl && (
                  <img src={getImageUrl(product.imageUrl)} alt={product.name} style={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 6, marginBottom: 8, background: '#f8f8f8' }} />
                )}
                <h4 style={{ margin: '8px 0 4px 0' }}>{product.name}</h4>
                <div style={{ color: '#d9534f', fontWeight: 'bold', fontSize: 18 }}>
                  ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                  <span style={{ textDecoration: 'line-through', color: '#888', fontWeight: 'normal', fontSize: 14, marginLeft: 8 }}>₹{product.price}</span>
                </div>
                <div style={{ color: '#007bff', fontWeight: 500, fontSize: 14, margin: '4px 0' }}>-{product.discount}% OFF</div>
                <div style={{ color: '#555', fontSize: 13 }}>{product.description}</div>
                {/* Add to Cart, Quick View, Compare, Wishlist buttons can be added here */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
