import React, { useEffect, useState } from 'react';

// This file is now unused. The New Products tab and page have been removed from the UI.
// function NewProductsPage() {
//   const [products, setProducts] = useState([]);
//   useEffect(() => {
//     fetch('http://localhost:8080/api/products/new')
//       .then(res => res.json())
//       .then(data => setProducts(Array.isArray(data) ? data : []));
//   }, []);
//
//   return (
//     <div>
//       <h2>New Products</h2>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
//         {products.length === 0 && <p>No new products found.</p>}
//         {products.map(product => (
//           <div key={product.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minWidth: 200 }}>
//             <h4>{product.name}</h4>
//             <p>{product.description}</p>
//             <p><strong>₹{product.price}</strong></p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// 
// export default NewProductsPage;
