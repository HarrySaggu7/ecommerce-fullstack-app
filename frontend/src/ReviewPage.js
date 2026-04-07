import React, { useState, useEffect } from 'react';

function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8080/api/reviews');
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Could not load reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && comment) {
      try {
        const res = await fetch('http://localhost:8080/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, comment })
        });
        if (!res.ok) throw new Error('Failed to submit review');
        const newReview = await res.json();
        setReviews([...reviews, newReview]);
        setName('');
        setComment('');
      } catch (err) {
        setError('Could not submit review.');
      }
    }
  };

  return (
    <div>
      <h2>Customer Reviews</h2>
      {loading ? <p>Loading reviews...</p> : error ? <p style={{color:'red'}}>{error}</p> : (
        <ul>
          {reviews.map((r, idx) => (
            <li key={r.id || idx}><strong>{r.name}:</strong> {r.comment}</li>
          ))}
        </ul>
      )}
      <h3>Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Your Review"
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
// (fixed: removed duplicate closing brace and export)
}

export default ReviewPage;
