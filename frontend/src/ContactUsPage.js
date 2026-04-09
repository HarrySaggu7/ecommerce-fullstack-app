// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
import React, { useState, useEffect } from 'react';


function ContactUsPage({ user }) {
  const [name, setName] = useState(user && user.name ? user.name : '');
  const [email, setEmail] = useState(user && user.email ? user.email : '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Update name/email if user changes (e.g., after login)
  useEffect(() => {
    if (user && user.name) setName(user.name);
    if (user && user.email) setEmail(user.email);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
    } catch (err) {
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div>
      <h2>Contact Us</h2>
      {submitted ? (
        <p>Thank you for contacting us! We will get back to you soon.</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
            disabled={user && user.name && !user.guest ? true : false}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
            disabled={user && user.email && !user.guest ? true : false}
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <button type="submit">Send</button>
        </form>
      )}
    </div>
  );
}

export default ContactUsPage;
