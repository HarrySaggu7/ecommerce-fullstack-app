import React, { useState } from "react";

const initialAddress = {
  fullName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phoneNumber: ""
};

export default function CheckoutForm({ onSubmit }) {
  const [billingAddress, setBillingAddress] = useState(initialAddress);
  const [shippingAddress, setShippingAddress] = useState(initialAddress);
  const [useSame, setUseSame] = useState(true);

  const handleChange = (e, type) => {
    const { name, value } = e.target;
    if (type === "billing") {
      setBillingAddress({ ...billingAddress, [name]: value });
      if (useSame) setShippingAddress({ ...billingAddress, [name]: value });
    } else {
      setShippingAddress({ ...shippingAddress, [name]: value });
    }
  };

  const handleCheckbox = () => {
    setUseSame(!useSame);
    if (!useSame) setShippingAddress(billingAddress);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ billingAddress, shippingAddress: useSame ? billingAddress : shippingAddress });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Billing Address</h2>
      {Object.keys(initialAddress).map((field) => (
        <div key={field}>
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          <input
            type="text"
            name={field}
            value={billingAddress[field]}
            onChange={(e) => handleChange(e, "billing")}
            required
          />
        </div>
      ))}
      <div>
        <label>
          <input type="checkbox" checked={useSame} onChange={handleCheckbox} />
          Shipping address is same as billing
        </label>
      </div>
      {!useSame && (
        <>
          <h2>Shipping Address</h2>
          {Object.keys(initialAddress).map((field) => (
            <div key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                type="text"
                name={field}
                value={shippingAddress[field]}
                onChange={(e) => handleChange(e, "shipping")}
                required
              />
            </div>
          ))}
        </>
      )}
      <button type="submit">Continue to Payment</button>
    </form>
  );
}
