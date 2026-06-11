import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>404</h1>
      <h2>Looking for something?</h2>
      <p style={{ marginTop: '0.5rem', color: '#555' }}>We're sorry. The Web address you entered is not a functioning page on our site.</p>
      <Link to="/" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
        <button className="btn btn-primary" style={{ padding: '0.6rem 2rem' }}>Go to Home Page</button>
      </Link>
    </div>
  );
};

export default NotFound;
