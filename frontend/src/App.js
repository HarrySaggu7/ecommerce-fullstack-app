import React, { useState, useEffect } from "react";
import PayPalButton from "./PayPalButton";
import ReviewPage from "./ReviewPage";
import NewProductsPage from "./NewProductsPage";
import TestimonialsPage from "./TestimonialsPage";
import ContactUsPage from "./ContactUsPage";

// AdminProductManager component
function AdminProductManager({ products, fetchProducts }) {
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", discount: "", stock: "", category: "", color: "", brand: "", rating: "" });

  useEffect(() => {
    // Fetch categories for dropdown
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `http://localhost:8080/api/products/${editing}`
      : "http://localhost:8080/api/products";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          discount: form.discount ? parseFloat(form.discount) : 0,
          stock: form.stock ? parseInt(form.stock) : 0,
          category: form.category ? { id: form.category } : null,
          color: form.color,
          brand: form.brand,
          rating: form.rating ? parseInt(form.rating) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save product");
    } catch (err) {
      console.error("Error saving product:", err);
    }
    setForm({ name: "", description: "", price: "", discount: "", stock: "", category: "", color: "", brand: "", rating: "" });
    setEditing(null);
    fetchProducts();
  };

  // Edit product
  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discount: product.discount || "",
      stock: product.stock || "",
      category: product.category ? product.category.id : "",
      color: product.color || "",
      brand: product.brand || "",
      rating: product.rating || "",
    });
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
    } catch (err) {
      console.error("Error deleting product:", err);
    }
    fetchProducts();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input type="number" placeholder="Discount %" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} min="0" max="100" />
        <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} min="0" />
        <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          <option value="">Category</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <input placeholder="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
        <input placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <input type="number" placeholder="Rating (1-5)" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
        <button type="submit">{editing ? "Update" : "Add"} Product</button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setForm({ name: "", description: "", price: "", discount: "", stock: "", category: "", color: "", brand: "", rating: "" }); }}>
            Cancel
          </button>
        )}
      </form>
      <table style={{ width: "100%", background: "#fff", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Discount %</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Color</th>
            <th>Brand</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>₹{p.price}</td>
              <td>{p.discount || 0}</td>
              <td>{p.stock || 0}</td>
              <td>{p.category ? p.category.name : ""}</td>
              <td>{p.color || ""}</td>
              <td>{p.brand || ""}</td>
              <td>{p.rating || ""}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ marginLeft: 8, color: "red" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {

  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orders, setOrders] = useState([]);

  // Filter states
  const [filterColor, setFilterColor] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [brandOptions, setBrandOptions] = useState([]);
  const [filterRating, setFilterRating] = useState("");
  const [colorOptions, setColorOptions] = useState([]);

  // Unified fetchProducts: always uses all filters and search
  const fetchProducts = async (paramsOverride = {}) => {
    const params = {
      keyword: search,
      color: filterColor,
      brand: filterBrand,
      rating: filterRating,
      ...paramsOverride
    };
    const hasAny = Object.values(params).some(v => v && v !== "");
    let url;
    if (!hasAny) {
      url = "http://localhost:8080/api/products";
    } else {
      url = "http://localhost:8080/api/products/filter?";
      const query = Object.entries(params)
        .filter(([_, v]) => v && v !== "")
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&");
      url += query;
    }
    try {
      const response = await fetch(url);
      console.log('Fetch URL:', url, 'Status:', response.status);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    if (!user || !user.id) return;
    try {
      const response = await fetch(`http://localhost:8080/api/orders/user/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (user && user.id) fetchOrders();
    // eslint-disable-next-line
  }, [search, filterColor, filterBrand, filterRating]);

  // Update color and brand options whenever products change
  useEffect(() => {
    const uniqueColors = Array.from(new Set(products.map(p => p.color).filter(Boolean)));
    setColorOptions(uniqueColors);
    const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    setBrandOptions(uniqueBrands);
  }, [products]);

  const handleRegister = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) throw new Error("Registration failed");
      await response.json();
      alert("Registered successfully!");
    } catch (err) {
      console.error("Error registering:", err);
      alert("Registration failed. Please try again.");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();
      setUser(data);
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedProduct(null);
    setOrderPlaced(false);
  };

  const handleProductClick = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product details");
      const data = await response.json();
      setSelectedProduct(data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setSelectedProduct(null);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (!user || !user.id) {
      alert("You must be logged in to place an order.");
      return;
    }
    const orderPayload = {
      user: { id: user.id },
      products: cart.map(({ id }) => ({ id })),
      total: totalPrice,
      status: "PLACED",
      createdAt: new Date().toISOString(),
    };
    try {
      const response = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (response.ok) {
        setOrderPlaced(true);
        setCart([]);
        fetchOrders();
      } else {
        alert("Order failed. Please try again.");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Order failed. Please try again.");
    }
  };

  // ---------------- LOGIN / REGISTER UI ----------------
  if (!user) {
    return (
      <div style={authStyles.container}>
        <div style={authStyles.card}>
          <h2 style={{ marginBottom: "20px" }}>Welcome Back</h2>
          <input style={authStyles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={authStyles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button style={authStyles.loginBtn} onClick={handleLogin}>Login</button>
          <div style={authStyles.divider}></div>
          <h3>Create Account</h3>
          <input style={authStyles.input} placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input style={authStyles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={authStyles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button style={authStyles.registerBtn} onClick={handleRegister}>Register</button>
          <div style={{ margin: "20px 0 0 0", textAlign: "center" }}>
            <span style={{ color: "#888" }}>or</span>
            <br />
            <button style={{ ...authStyles.loginBtn, background: "#6c757d", marginTop: 10 }} onClick={() => setUser({ name: "Guest", guest: true })}>Continue as Guest</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- MAIN APP UI ----------------
  return (
    <div style={styles.container}>
      <nav style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("new")}>New Products</button>
          <button onClick={() => setPage("reviews")}>Reviews</button>
          <button onClick={() => setPage("testimonials")}>Testimonials</button>
          <button onClick={() => setPage("contact")}>Contact Us</button>
        </div>
        <div style={{ flex: 1 }} />
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </nav>
      {page === "new" && <NewProductsPage />}
      {page === "reviews" && <ReviewPage />}
      {page === "testimonials" && <TestimonialsPage />}
      {page === "contact" && <ContactUsPage user={user} />}
      {page === "home" && (
        <>
          {/* Search & Filters - Professional Layout */}
          <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ fontWeight: 600 }}>Search</label>
              <input
                style={styles.search}
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Wrap filter controls in a fragment to avoid adjacent JSX error */}
            <>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <label style={{ fontWeight: 600 }}>Color</label>
                  <select
                    style={styles.search}
                    value={filterColor}
                    onChange={e => setFilterColor(e.target.value)}
                  >
                    <option value="">All</option>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600 }}>Brand</label>
                  <select
                    style={styles.search}
                    value={filterBrand}
                    onChange={e => setFilterBrand(e.target.value)}
                  >
                    <option value="">All</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600 }}>Rating</label>
                  <select
                    style={styles.search}
                    value={filterRating}
                    onChange={e => setFilterRating(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
            </>
            <button
              style={{ height: 40, alignSelf: "center" }}
              onClick={() => {
                setFilterColor("");
                setFilterBrand("");
                setFilterRating("");
                setSearch("");
              }}
            >
              Clear All
            </button>
          </div>

      {/* Product Grid */}
      <div style={styles.productGrid}>
        {Array.isArray(products) && products.map((product) => {
          if (!product || typeof product !== 'object' || !product.id) return null;
          const hasDiscount = product.discount && product.discount > 0;
          const discountedPrice = hasDiscount && product.price
            ? (product.price * (1 - product.discount / 100)).toFixed(2)
            : product.price;
          return (
            <div
              key={product.id}
              style={styles.card}
              onClick={() => handleProductClick(product.id)}
            >
              <h4>{product.name || 'No Name'}</h4>
              {product.color && (
                <div style={{ marginBottom: 4, color: '#555', fontSize: 14 }}>
                  <strong>Color:</strong> {product.color}
                </div>
              )}
              {hasDiscount && product.price ? (
                <>
                  <span style={{ color: "#d9534f", fontWeight: "bold", marginRight: 8 }}>Sale</span>
                  <p style={{ fontWeight: "bold", color: "#d9534f", margin: 0 }}>
                    ₹{discountedPrice} <span style={{ textDecoration: "line-through", color: "#888", fontWeight: "normal", fontSize: 14 }}>₹{product.price}</span>
                  </p>
                </>
              ) : (
                product.price && <p style={{ fontWeight: "bold" }}>₹{product.price}</p>
              )}
              {typeof product.stock === 'number' && (
                <p style={{ margin: 0, color: product.stock > 0 ? "green" : "red", fontWeight: "bold" }}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Product Details (moved below product grid) */}
      {selectedProduct && typeof selectedProduct === 'object' && selectedProduct.id && (
        <div style={styles.detailsCard}>
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
              <strong>Price:</strong> <span style={{ color: "#d9534f", fontWeight: "bold" }}>₹{((selectedProduct.price * (1 - selectedProduct.discount / 100))).toFixed(2)}</span>
              <span style={{ textDecoration: "line-through", color: "#888", fontWeight: "normal", fontSize: 16, marginLeft: 8 }}>₹{selectedProduct.price}</span>
            </p>
          ) : (
            selectedProduct.price && <p><strong>Price:</strong> ₹{selectedProduct.price}</p>
          )}
          {selectedProduct.description && <p><strong>Description:</strong> {selectedProduct.description}</p>}
          {typeof selectedProduct.stock === 'number' && (
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: selectedProduct.stock > 0 ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {selectedProduct.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </p>
          )}

          <button
            style={{
              ...styles.cartBtn,
              background: selectedProduct.stock > 0 ? styles.cartBtn.background : "#ccc",
              cursor: selectedProduct.stock > 0 ? "pointer" : "not-allowed",
            }}
            onClick={() => selectedProduct.stock > 0 && addToCart(selectedProduct)}
            disabled={selectedProduct.stock <= 0}
          >
            {selectedProduct.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      )}

      {/* Product Details (duplicate removed) */}

      {/* Cart Section */}
      <div style={styles.cartBox}>
        <h3>🛒 Cart</h3>

        {cart.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} style={styles.cartItem}>
                <div>
                  <strong>{item.name}</strong> <p>₹{item.price}</p>
                </div>

                <div style={styles.qtyControls}>
                  <button onClick={() => decreaseQty(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQty(item.id)}>+</button>
                </div>

                <button
                  style={styles.removeBtn}
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}

            <h3 style={{ marginTop: "15px" }}>
              Total: ₹{totalPrice}
            </h3>
            {/* PayPal Payment Button */}
            <div style={{ margin: "20px 0" }}>
              <PayPalButton
                key={totalPrice} // Only remount when total changes
                total={totalPrice}
                onSuccess={async (payment) => {
                  // Place order after successful payment
                  if (!user || !user.id) {
                    alert("You must be logged in to place an order.");
                    return;
                  }
                  const orderPayload = {
                    user: { id: user.id },
                    products: cart.map(({ id }) => ({ id })),
                    total: totalPrice,
                    status: "PAID",
                    createdAt: new Date().toISOString(),
                    paymentId: payment.id
                  };
                  const response = await fetch("http://localhost:8080/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderPayload),
                  });
                  if (response.ok) {
                    setOrderPlaced(true);
                    setCart([]);
                    fetchOrders();
                  } else {
                    alert("Order failed. Please try again.");
                  }
                }}
              />
            </div>
          </>
        )}

        {orderPlaced && (
          <div style={styles.successBox}>
            <h2>✅ Order Placed Successfully!</h2>
            <p>Thank you for your purchase.</p>
          </div>
        )}
      </div>

      {user && !user.guest && (
        <div style={styles.cartBox}>
          <h3>📦 Order History</h3>
          {orders.length === 0 ? (
            <p>No past orders found.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} style={{ marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                <div><strong>Order #{order.id}</strong> | {order.status} | {new Date(order.createdAt).toLocaleString()}</div>
                <div>
                  {order.products && order.products.map((p) => (
                    <span key={p.id} style={{ marginRight: 8 }}>{p.name}</span>
                  ))}
                </div>
                <div>Total: ₹{order.total}</div>
              </div>
            ))
          )}
        </div>
      )}
      </> 
      )}
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
container: {
padding: "30px",
fontFamily: "Arial",
background: "#f8f9fa",
minHeight: "100vh",
},

header: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: "20px",
},

search: {
padding: "12px",
width: "100%",
maxWidth: "400px",
borderRadius: "6px",
border: "1px solid #ccc",
marginBottom: "25px",
},

productGrid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
gap: "20px",
},

card: {
background: "#fff",
padding: "20px",
borderRadius: "10px",
boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
cursor: "pointer",
transition: "0.2s",
},

detailsCard: {
marginTop: "30px",
background: "#fff",
padding: "25px",
borderRadius: "10px",
boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
},

cartBtn: {
marginTop: "15px",
padding: "10px 20px",
background: "#007bff",
color: "#fff",
border: "none",
borderRadius: "5px",
cursor: "pointer",
},

cartBox: {
marginTop: "30px",
background: "#fff",
padding: "20px",
borderRadius: "10px",
boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
},

cartItem: {
display: "flex",
justifyContent: "space-between",
padding: "8px 0",
borderBottom: "1px solid #eee",
}, 

checkoutBtn: {
  marginTop: "15px",
  padding: "12px",
  width: "100%",
  background: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
},

successBox: {
  marginTop: "30px",
  padding: "20px",
  background: "#d4edda",
  borderRadius: "10px",
  textAlign: "center",
},

logoutBtn: {
padding: "6px 12px",
borderRadius: "5px",
border: "1px solid #ccc",
cursor: "pointer",
}, 

qtyControls: {
display: "flex",
alignItems: "center",
gap: "10px",
},

removeBtn: {
background: "red",
color: "#fff",
border: "none",
padding: "5px 10px",
borderRadius: "5px",
cursor: "pointer",
},

};

const authStyles = {
container: {
display: "flex",
justifyContent: "center",
alignItems: "center",
height: "100vh",
background: "#f4f6f8",
},

card: {
width: "350px",
padding: "30px",
borderRadius: "12px",
background: "#ffffff",
boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
textAlign: "center",
},

input: {
width: "100%",
padding: "12px",
margin: "10px 0",
borderRadius: "6px",
border: "1px solid #ccc",
fontSize: "14px",
},

loginBtn: {
width: "100%",
padding: "12px",
background: "#007bff",
color: "#fff",
border: "none",
borderRadius: "6px",
marginTop: "10px",
cursor: "pointer",
},

registerBtn: {
width: "100%",
padding: "12px",
background: "#28a745",
color: "#fff",
border: "none",
borderRadius: "6px",
marginTop: "10px",
cursor: "pointer",
},

divider: {
margin: "20px 0",
borderTop: "1px solid #eee",
},
};


export default App;
