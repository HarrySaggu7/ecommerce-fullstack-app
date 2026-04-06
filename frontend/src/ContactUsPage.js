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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would send the message to the backend
    setSubmitted(true);
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
