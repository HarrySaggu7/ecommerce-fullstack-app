
import React, { useState, useEffect, useRef } from "react";
import PayPalButton from "./PayPalButton";
import ReviewPage from "./ReviewPage";
import TestimonialsPage from "./TestimonialsPage";
import ContactUsPage from "./ContactUsPage";
import CheckoutForm from "./CheckoutForm";
import SalePage from "./SalePage";
// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
// Utility to format price in USD
const formatUSD = (price) => price != null ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '';
// Utility to get absolute image URL
const getImageUrl = (url) =>
  url && url.startsWith('/api/products/image/')
    ? `${API_BASE_URL}${url}`
    : url;

// AdminProductManager component
function AdminProductManager({ products, fetchProducts }) {
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", discount: "", stock: "", category: "", color: "", brand: "", rating: "", isNew: false, imageUrl: "" });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // Fetch categories for dropdown
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
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
      ? `${API_BASE_URL}/api/products/${editing}`
      : `${API_BASE_URL}/api/products`;
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
          isNew: !!form.isNew,
          imageUrl: form.imageUrl || ""
        }),
      });
      if (!res.ok) throw new Error("Failed to save product");
    } catch (err) {
      console.error("Error saving product:", err);
    }
    setForm({ name: "", description: "", price: "", discount: "", stock: "", category: "", color: "", brand: "", rating: "", isNew: false, imageUrl: "" });
    setEditing(null);
    fetchProducts();
    window.dispatchEvent(new Event('refreshAllProducts'));
  };

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/upload-image`, {
        method: "POST",
        body: formData,
      });
      const imageUrl = await res.text();
      if (res.ok && imageUrl) {
        setForm({ ...form, imageUrl });
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      alert("Image upload failed");
    }
    setUploadingImage(false);
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
      isNew: !!product.isNew,
      imageUrl: product.imageUrl || ""
    });
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
    } catch (err) {
      console.error("Error deleting product:", err);
    }
    fetchProducts();
    window.dispatchEvent(new Event('refreshAllProducts'));
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={e => setForm({ ...form, isNew: e.target.checked })}
          />
          New Product
        </label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {uploadingImage && <span>Uploading...</span>}
        {form.imageUrl && (
          <img src={getImageUrl(form.imageUrl)} alt="Preview" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 4, border: '1px solid #ccc' }} />
        )}
        <button type="submit">{editing ? "Update" : "Add"} Product</button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setForm({ name: "", description: "", price: "", discount: "", stock: "", category: "", color: "", brand: "", rating: "", isNew: false, imageUrl: "" }); }}>
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
              <td>
                {p.name}
                {p.isNew && (
                  <span style={{
                    background: '#28a745',
                    color: 'white',
                    fontSize: '0.75em',
                    fontWeight: 'bold',
                    borderRadius: 4,
                    padding: '2px 6px',
                    marginLeft: 6
                  }}>NEW</span>
                )}
              </td>
              <td>{p.description}</td>
              <td>{formatUSD(p.price)}</td>
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
  // Ref for product details section
  const productDetailsRef = useRef(null);
            // Loader state for product grid
            const [loading, setLoading] = useState(false);
          // UI state: showLogin true = login form, false = register form
          const [showLogin, setShowLogin] = useState(true);
        // Fetch all products once for filter options
        useEffect(() => {
          const fetchAll = async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/products`);
              const data = await res.json();
              // Populate color and brand options
              const uniqueColors = Array.from(new Set((Array.isArray(data) ? data : []).map(p => p.color).filter(Boolean)));
              setColorOptions(["All", ...uniqueColors]);
              const uniqueBrands = Array.from(new Set((Array.isArray(data) ? data : []).map(p => p.brand).filter(Boolean)));
              setBrandOptions(["All", ...uniqueBrands]);
              // Populate category options
              const uniqueCategories = Array.from(new Set((Array.isArray(data) ? data : []).map(p => p.category && p.category.name).filter(Boolean)));
              setCategoryOptions(["All", ...uniqueCategories]);
            } catch (err) {
              setColorOptions(["All"]);
              setBrandOptions(["All"]);
              setCategoryOptions(["All"]);
            }
          };
          fetchAll();
          // Listen for refreshAllProducts event to update filter options after product changes
          const handler = () => fetchAll();
          window.addEventListener('refreshAllProducts', handler);
          return () => window.removeEventListener('refreshAllProducts', handler);
        }, []);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  // Token state for authentication
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  });
  // Sorting state
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // asc or desc

  // Validation states
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [user, setUser] = useState(() => {
    // Initialize user from localStorage or sessionStorage if present
    const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutAddresses, setCheckoutAddresses] = useState(null);
  const [orders, setOrders] = useState([]);

  // Filter states
  const [filterColor, setFilterColor] = useState("All");
  const [filterBrand, setFilterBrand] = useState("All");
  const [filterRating, setFilterRating] = useState("All");
  const [brandOptions, setBrandOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");

  // Unified fetchProducts: always uses all filters and search
  const fetchProducts = async (paramsOverride = {}) => {
    setLoading(true);
    const params = {
      keyword: search,
      color: filterColor && filterColor !== "All" ? filterColor : null,
      brand: filterBrand && filterBrand !== "All" ? filterBrand : null,
      rating: filterRating && filterRating !== "All" ? parseInt(filterRating) : null,
        category: filterCategory && filterCategory !== "All" ? filterCategory : null,
      ...paramsOverride
    };
    const hasAny = Object.values(params).some(v => v && v !== "");
    let url;
    if (!hasAny) {
      url = `${API_BASE_URL}/api/products`;
    } else {
      url = `${API_BASE_URL}/api/products/filter?`;
      const query = Object.entries(params)
        .filter(([_, v]) => v !== null && v !== "")
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
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user || !token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
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
    // Now also refetch orders when user or token changes
  }, [search, filterColor, filterBrand, filterRating, filterCategory, user, token]);

  // Fetch all products once for filter options
  // Removed allProducts state from outside App

  // Removed useEffect for allProducts from outside App

  // Removed color and brand options update from outside App

  const handleRegister = async () => {
    setRegisterError("");
    // Basic validation
    if (!name || !email || !password || !gender || !mobile) {
      setRegisterError("All fields are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setRegisterError("Invalid email format.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setRegisterError("Mobile number must be 10 digits.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, gender, mobile }),
      });
      if (!response.ok) throw new Error("Registration failed");
      await response.json();
      alert("Registered successfully!");
    } catch (err) {
      console.error("Error registering:", err);
      setRegisterError("Registration failed. Please try again.");
    }
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!email || !password) {
      setLoginError("Both email and password are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLoginError("Invalid email format.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();
      // data = { user: {...}, token: "..." }
      const userObj = data.user;
      userObj.isAdmin = userObj.role && userObj.role.toUpperCase() === "ADMIN";
      setUser(userObj);
      setToken(data.token);
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("token", data.token);
      } else {
        sessionStorage.setItem("user", JSON.stringify(userObj));
        sessionStorage.setItem("token", data.token);
      }
      // Fetch orders immediately after login
      setTimeout(fetchOrders, 0);
    } catch (err) {
      console.error("Error logging in:", err);
      setLoginError("Login failed. Please try again.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setToken(null);
    setSelectedProduct(null);
    setOrderPlaced(false);
    setOrders([]);
    setCart([]);
    setShowCheckoutForm(false);
    setCheckoutAddresses(null);
    setPage("home");
    setProducts([]);
    setSearch("");
    setEmail("");
    setPassword("");
    setName("");
    setGender("");
    setMobile("");
    setShowLogin(true);
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotMessage("");
    setRememberMe(false);
    setSortBy("");
    setSortOrder("asc");
    setLoginError("");
    setRegisterError("");
    setFilterColor("All");
    setFilterBrand("All");
    setFilterRating("All");
    setCategoryOptions(["All"]);
    setBrandOptions(["All"]);
    setColorOptions(["All"]);
    setFilterCategory("All");
  };

  const handleProductClick = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product details");
      const data = await response.json();
      setSelectedProduct(data);
      // Scroll to product details after setting product
      setTimeout(() => {
        if (productDetailsRef.current) {
          productDetailsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setSelectedProduct(null);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    // Calculate discounted price if applicable
    const finalPrice = product.discount && product.discount > 0 && product.price
      ? parseFloat((product.price * (1 - product.discount / 100)).toFixed(2))
      : product.price;

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, finalPrice }]);
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
    (sum, item) => sum + (item.finalPrice !== undefined ? item.finalPrice : item.price) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleAddressSubmit = async (addresses) => {
    setCheckoutAddresses(addresses);
    setShowCheckoutForm(false);
    // Proceed to payment (show PayPalButton or place order directly)
  };

  // ---------------- LOGIN / REGISTER UI ----------------
  if (!user) {
    if (showForgotPassword) {
      return (
        <div style={authStyles.container}>
          <div style={authStyles.card}>
            <h2 style={{ marginBottom: 20 }}>Reset Password</h2>
            <input style={authStyles.input} placeholder="Enter your email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            <button style={authStyles.loginBtn} onClick={async () => {
              setForgotMessage("");
              if (!/^\S+@\S+\.\S+$/.test(forgotEmail)) {
                setForgotMessage("Enter a valid email address.");
                return;
              }
              try {
                const res = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: forgotEmail })
                });
                const msg = await res.text();
                setForgotMessage(msg);
              } catch (err) {
                setForgotMessage("Error sending reset request.");
              }
            }}>Send Reset Link</button>
            {forgotMessage && <div style={{ color: 'green', marginTop: 8 }}>{forgotMessage}</div>}
            <div style={{ marginTop: 16 }}>
              <button style={{ ...authStyles.loginBtn, background: '#6c757d' }} onClick={() => setShowForgotPassword(false)}>Back to Login</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={authStyles.container}>
        <div style={authStyles.card}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <button
              style={{
                ...authStyles.loginBtn,
                background: showLogin ? '#007bff' : '#6c757d',
                width: '50%',
                marginRight: 4,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 6,
                fontWeight: showLogin ? 700 : 400
              }}
              onClick={() => setShowLogin(true)}
              disabled={showLogin}
            >
              Login
            </button>
            <button
              style={{
                ...authStyles.registerBtn,
                background: !showLogin ? '#28a745' : '#6c757d',
                width: '50%',
                marginLeft: 4,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 6,
                fontWeight: !showLogin ? 700 : 400
              }}
              onClick={() => setShowLogin(false)}
              disabled={!showLogin}
            >
              Register
            </button>
          </div>
          {showLogin ? (
            <>
              <h2 style={{ marginBottom: "20px" }}>Welcome Back</h2>
              <input style={authStyles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              <input style={authStyles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <label style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ marginRight: 6 }} />
                Remember me
              </label>
              <button style={authStyles.loginBtn} onClick={handleLogin}>Login</button>
              <span style={{ color: '#007bff', cursor: 'pointer', marginTop: 8, display: 'inline-block' }} onClick={() => setShowForgotPassword(true)}>
                Forget your password?
              </span>
              {loginError && <div style={{ color: 'red', marginTop: 8 }}>{loginError}</div>}
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: "20px" }}>Create Account</h2>
              <input style={authStyles.input} placeholder="Name" onChange={(e) => setName(e.target.value)} />
              <select style={authStyles.input} value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input style={authStyles.input} placeholder="Mobile Number" onChange={(e) => setMobile(e.target.value)} maxLength={10} />
              <input style={authStyles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
              <input style={authStyles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <button style={authStyles.registerBtn} onClick={handleRegister}>Register</button>
              {registerError && <div style={{ color: 'red', marginTop: 8 }}>{registerError}</div>}
            </>
          )}
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
          <button onClick={() => { setOrderPlaced(false); setPage("home"); }}>Home</button>
          <button onClick={() => { setOrderPlaced(false); setPage("sale"); }}>Sale</button>
          <button onClick={() => { setOrderPlaced(false); setPage("reviews"); }}>Reviews</button>
          <button onClick={() => { setOrderPlaced(false); setPage("testimonials"); }}>Testimonials</button>
          <button onClick={() => { setOrderPlaced(false); setPage("contact"); }}>Contact Us</button>
          {user && user.isAdmin && (
            <button onClick={() => { setOrderPlaced(false); setPage("admin"); }}>Admin</button>
          )}
        </div>
        <div style={{ flex: 1 }} />
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </nav>
            {page === "admin" && user && user.isAdmin && (
              <AdminProductManager products={products} fetchProducts={fetchProducts} />
            )}
            {page === "sale" && (
              <SalePage
                onProductClick={handleProductClick}
                selectedProduct={selectedProduct}
                addToCart={addToCart}
                styles={styles}
                getImageUrl={getImageUrl}
              />
            )}
            {page === "reviews" && <ReviewPage user={user} />}
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
                  {/* Filter controls including Category */}
                  <>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <label style={{ fontWeight: 600 }}>Category</label>
                        <select
                          style={styles.search}
                          value={filterCategory}
                          onChange={e => setFilterCategory(e.target.value)}
                        >
                          {categoryOptions.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600 }}>Color</label>
                        <select
                          style={styles.search}
                          value={filterColor}
                          onChange={e => setFilterColor(e.target.value)}
                        >
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
                          {brandOptions.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>)
                          )}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontWeight: 600 }}>Rating</label>
                        <select
                          style={styles.search}
                          value={filterRating}
                          onChange={e => setFilterRating(e.target.value)}
                        >
                          <option value="All">All</option>
                          {[1,2,3,4,5].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                  <button
                    style={{ height: 40, alignSelf: "center" }}
                    onClick={() => {
                      setFilterColor("All");
                      setFilterBrand("All");
                      setFilterRating("All");
                      setFilterCategory("All");
                      setSearch("");
                    }}
                  >
                    Clear All
                  </button>
                </div>

                {/* Product Grid */}
                {/* Sorting Controls */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <label style={{ fontWeight: 600 }}>Sort By:</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.search}>
                    <option value="">None</option>
                    <option value="availability">Availability</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="color">Color</option>
                    <option value="brand">Brand</option>
                  </select>
                  <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={styles.search}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>

                <div style={styles.productGrid}>
                  {loading ? (
                    // Shimmer loader grid (3 cards)
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} style={{ ...styles.card, background: '#fff', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="shimmer shimmer-img" style={{ width: '100%', height: 140, borderRadius: 6, marginBottom: 8 }} />
                        <div className="shimmer" style={{ width: '60%', height: 20, borderRadius: 4, marginBottom: 8 }} />
                        <div className="shimmer" style={{ width: '40%', height: 16, borderRadius: 4, marginBottom: 8 }} />
                        <div className="shimmer" style={{ width: '80%', height: 16, borderRadius: 4 }} />
                      </div>
                    ))
                  ) : Array.isArray(products) && products.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 22, padding: 40 }}>
                      <span role="img" aria-label="no products" style={{ fontSize: 40 }}>🛒</span>
                      <div>No products found matching your filters.</div>
                    </div>
                  ) : (
                    [...products]
                      .sort((a, b) => {
                        if (!sortBy) return 0;
                        let valA, valB;
                        switch (sortBy) {
                          case "availability":
                            valA = a.stock > 0 ? 1 : 0;
                            valB = b.stock > 0 ? 1 : 0;
                            break;
                          case "price":
                            valA = a.price || 0;
                            valB = b.price || 0;
                            break;
                          case "rating":
                            valA = a.rating || 0;
                            valB = b.rating || 0;
                            break;
                          case "color":
                            valA = a.color ? a.color.toLowerCase() : "";
                            valB = b.color ? b.color.toLowerCase() : "";
                            break;
                          case "brand":
                            valA = a.brand ? a.brand.toLowerCase() : "";
                            valB = b.brand ? b.brand.toLowerCase() : "";
                            break;
                          default:
                            return 0;
                        }
                        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                        return 0;
                      })
                      .map((product) => {
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
                            {product.imageUrl && (
                              <img src={getImageUrl(product.imageUrl)} alt={product.name} style={{ width: '100%', maxHeight: 140, objectFit: 'contain', borderRadius: 6, marginBottom: 8, background: '#fff' }} />
                            )}
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {product.name || 'No Name'}
                              {product.isNew && (
                                <span style={{
                                  background: '#28a745',
                                  color: 'white',
                                  fontSize: '0.75em',
                                  fontWeight: 'bold',
                                  borderRadius: 4,
                                  padding: '2px 6px',
                                  marginLeft: 4
                                }}>NEW</span>
                              )}
                            </h4>
                            {product.color && (
                              <div style={{ marginBottom: 4, color: '#555', fontSize: 14 }}>
                                <strong>Color:</strong> {product.color}
                              </div>
                            )}
                            {hasDiscount && product.price ? (
                              <>
                                <span style={{ color: "#d9534f", fontWeight: "bold", marginRight: 8 }}>Sale</span>
                                <p style={{ fontWeight: "bold", color: "#d9534f", margin: 0 }}>
                                  {formatUSD(discountedPrice)} <span style={{ textDecoration: "line-through", color: "#888", fontWeight: "normal", fontSize: 14 }}>{formatUSD(product.price)}</span>
                                </p>
                              </>
                            ) : (
                              product.price && <p style={{ fontWeight: "bold" }}>{formatUSD(product.price)}</p>
                            )}
                            {typeof product.stock === 'number' && (
                              <p style={{ margin: 0, color: product.stock > 0 ? "green" : "red", fontWeight: "bold" }}>
                                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                              </p>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>

                {/* Product Details (moved below product grid) */}
                {selectedProduct && typeof selectedProduct === 'object' && selectedProduct.id && (
                  <div ref={productDetailsRef} style={styles.detailsCard}>
                    <h2 style={{ marginBottom: 12, marginTop: 0 }}>Product Details</h2>
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
                        <strong>Price:</strong> <span style={{ color: "#d9534f", fontWeight: "bold" }}>{formatUSD((selectedProduct.price * (1 - selectedProduct.discount / 100)))}</span>
                        <span style={{ textDecoration: "line-through", color: "#888", fontWeight: "normal", fontSize: 16, marginLeft: 8 }}>{formatUSD(selectedProduct.price)}</span>
                      </p>
                    ) : (
                      selectedProduct.price && <p><strong>Price:</strong> {formatUSD(selectedProduct.price)}</p>
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
              </>
            )}

      {/* Product Details (duplicate removed) */}

      {/* Cart and Order History only for Home and Sale tabs */}
      {(page === "home" || page === "sale") && (
        <>
          <div style={styles.cartBox}>
            <h3>🛒 Cart</h3>
            {cart.length === 0 ? (
              <p>No items in cart</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} style={styles.cartItem}>
                    <div>
                      <strong>{item.name}</strong> <p>{formatUSD(item.finalPrice !== undefined ? item.finalPrice : item.price)}</p>
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
                  Total: {formatUSD(totalPrice)}
                </h3>
                {!showCheckoutForm && !checkoutAddresses && (
                  <button style={{ marginTop: 16 }} onClick={handleCheckout}>Checkout</button>
                )}
              </>
            )}
            {/* Show checkout form below cart summary if in checkout */}
            {showCheckoutForm && <CheckoutForm onSubmit={handleAddressSubmit} />}
            {/* Show address/payment summary if in that step */}
            {checkoutAddresses && !showCheckoutForm && (
              <>
                <div style={{ marginBottom: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, minWidth: 260, background: '#fafbfc' }}>
                    <h4 style={{ marginTop: 0, marginBottom: 8 }}>Billing Address</h4>
                    <div><strong>Name:</strong> {checkoutAddresses.billingAddress.fullName}</div>
                    <div><strong>Street:</strong> {checkoutAddresses.billingAddress.street}</div>
                    <div><strong>City:</strong> {checkoutAddresses.billingAddress.city}</div>
                    <div><strong>State:</strong> {checkoutAddresses.billingAddress.state}</div>
                    <div><strong>Postal Code:</strong> {checkoutAddresses.billingAddress.postalCode}</div>
                    <div><strong>Country:</strong> {checkoutAddresses.billingAddress.country}</div>
                    <div><strong>Phone:</strong> {checkoutAddresses.billingAddress.phoneNumber}</div>
                  </div>
                  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, minWidth: 260, background: '#fafbfc' }}>
                    <h4 style={{ marginTop: 0, marginBottom: 8 }}>Shipping Address</h4>
                    <div><strong>Name:</strong> {checkoutAddresses.shippingAddress.fullName}</div>
                    <div><strong>Street:</strong> {checkoutAddresses.shippingAddress.street}</div>
                    <div><strong>City:</strong> {checkoutAddresses.shippingAddress.city}</div>
                    <div><strong>State:</strong> {checkoutAddresses.shippingAddress.state}</div>
                    <div><strong>Postal Code:</strong> {checkoutAddresses.shippingAddress.postalCode}</div>
                    <div><strong>Country:</strong> {checkoutAddresses.shippingAddress.country}</div>
                    <div><strong>Phone:</strong> {checkoutAddresses.shippingAddress.phoneNumber}</div>
                  </div>
                </div>
                <div style={{ margin: "20px 0" }}>
                  <PayPalButton
                    key={totalPrice}
                    total={totalPrice}
                    onSuccess={async (payment) => {
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
                        paymentId: payment && payment.id ? payment.id : "PAYMENT_FAILED",
                        billingAddress: checkoutAddresses.billingAddress,
                        shippingAddress: checkoutAddresses.shippingAddress
                      };
                      const response = await fetch(`${API_BASE_URL}/api/orders`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...(token ? { "Authorization": `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify(orderPayload),
                      });
                      if (response.ok) {
                        setOrderPlaced(true);
                        setCart([]);
                        setCheckoutAddresses(null);
                        fetchOrders();
                      } else {
                        alert("Order failed. Please try again.");
                      }
                    }}
                    onError={async (err) => {
                      // Place order even if payment fails
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
                        paymentId: "PAYMENT_FAILED",
                        billingAddress: checkoutAddresses.billingAddress,
                        shippingAddress: checkoutAddresses.shippingAddress
                      };
                      const response = await fetch(`${API_BASE_URL}/api/orders`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...(token ? { "Authorization": `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify(orderPayload),
                      });
                      if (response.ok) {
                        setOrderPlaced(true);
                        setCart([]);
                        setCheckoutAddresses(null);
                        fetchOrders();
                      } else {
                        alert("Order failed. Please try again.");
                      }
                    }}
                  />
                </div>
              </>
            )}
          </div>
          {/* Order History only for logged in users (not guest) */}
          {user && !user.guest && (
            <div style={styles.cartBox}>
              <h3>📦 Order History</h3>
              {orders.length === 0 ? (
                <p>No past orders found.</p>
              ) : (
                [...orders]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((order) => (
                    <div key={order.id} style={{ marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
                      <div><strong>Order #{order.id}</strong> | {order.status} | {new Date(order.createdAt).toLocaleString()}</div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '8px 0' }}>
                        {order.products && order.products.map((p) => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fafbfc', borderRadius: 6, padding: '4px 10px', border: '1px solid #eee', minWidth: 120 }}>
                            {p.imageUrl && (
                              <img src={getImageUrl(p.imageUrl)} alt={p.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4, background: '#fff', border: '1px solid #ddd' }} />
                            )}
                            <span>{p.name}</span>
                          </div>
                        ))}
                      </div>
                      <div>Total: {formatUSD(order.total)}</div>
                    </div>
                  ))
              )}
            </div>
          )}
        </>
      )}
      {orderPlaced && (
        <div style={styles.successBox}>
          <h2>✅ Order Placed Successfully!</h2>
          <p>Thank you for your purchase.</p>
        </div>
      )}
    </div>
  );
}

// ---------------- STYLES ----------------
// Shimmer CSS
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('shimmer-style')) {
  const style = document.createElement('style');
  style.id = 'shimmer-style';
  style.innerHTML = `
    .shimmer {
      background: #f6f7f8;
      background-image: linear-gradient(90deg, #f6f7f8 0px, #edeef1 40px, #f6f7f8 80px);
      background-size: 400px 100%;
      background-repeat: no-repeat;
      display: inline-block;
      position: relative;
      animation: shimmer 1.2s infinite linear;
    }
    .shimmer-img {
      margin-bottom: 12px;
    }
    ${shimmerKeyframes}
  `;
  document.head.appendChild(style);
}
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
  // Removed uniqueCategories and setCategoryOptions from outside App

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
