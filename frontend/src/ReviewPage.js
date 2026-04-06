import React, { useState } from 'react';

function ReviewPage() {
  const [reviews, setReviews] = useState([
    { name: 'Alice', comment: 'Great products and fast delivery!' },
    { name: 'Bob', comment: 'Customer service was very helpful.' }
  ]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && comment) {
      setReviews([...reviews, { name, comment }]);
      setName('');
      setComment('');
    }
  };

  return (
    <div>
      <h2>Customer Reviews</h2>
      <ul>
        {reviews.map((r, idx) => (
          <li key={idx}><strong>{r.name}:</strong> {r.comment}</li>
        ))}
      </ul>
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
}

export default ReviewPage;
