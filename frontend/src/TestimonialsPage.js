import React from 'react';

const testimonials = [
  { name: 'Priya', text: 'Amazing service and fast delivery!' },
  { name: 'Rahul', text: 'Great selection of products.' },
  { name: 'Amit', text: 'Customer support was very helpful.' },
];

function TestimonialsPage() {
  return (
    <div>
      <h2>Testimonials</h2>
      <ul>
        {testimonials.map((t, idx) => (
          <li key={idx} style={{ marginBottom: 16 }}>
            <strong>{t.name}:</strong> {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TestimonialsPage;
