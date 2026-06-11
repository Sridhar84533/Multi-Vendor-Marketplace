import React from 'react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ marginTop: '3rem', backgroundColor: '#232F3E', color: '#FFF' }}>
      <div
        onClick={scrollToTop}
        style={{
          backgroundColor: '#37475A',
          textAlign: 'center',
          padding: '1rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Back to top
      </div>
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '3rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          fontSize: '0.9rem',
        }}
      >
        <div>
          <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Get to Know Us</h4>
          <ul style={{ listStyle: 'none', lineHeight: '1.8', opacity: 0.8 }}>
            <li>About Us</li>
            <li>Careers</li>
            <li>Press Releases</li>
            <li>Marketplace Research</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Connect with Us</h4>
          <ul style={{ listStyle: 'none', lineHeight: '1.8', opacity: 0.8 }}>
            <li>Facebook</li>
            <li>Twitter</li>
            <li>Instagram</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Make Money with Us</h4>
          <ul style={{ listStyle: 'none', lineHeight: '1.8', opacity: 0.8 }}>
            <li>Sell on Multi-Vendor Marketplace</li>
            <li>Sell under Marketplace Accelerator</li>
            <li>Protect and Build Your Brand</li>
            <li>Global Selling</li>
            <li>Become an Affiliate</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontWeight: 700 }}>Let Us Help You</h4>
          <ul style={{ listStyle: 'none', lineHeight: '1.8', opacity: 0.8 }}>
            <li>COVID-19 & Marketplace</li>
            <li>Your Account</li>
            <li>Returns Centre</li>
            <li>100% Purchase Protection</li>
            <li>Marketplace App Download</li>
            <li>Help</li>
          </ul>
        </div>
      </div>
      <div
        style={{
          borderTop: '1px solid #3a4553',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          opacity: 0.7,
        }}
      >
        © 1996-2026, Sridhar. Multi-Vendor Marketplace. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
