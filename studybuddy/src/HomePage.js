import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './components/menuButton';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <nav style={{ backgroundColor: 'lightblue', padding: '1rem' }}>
        <img src="assets/logo (2).png" alt="Logo" style={{ height: '50px', marginRight: '1rem' }} />
        <input type="text" placeholder="Search..." style={{ padding: '0.5rem', marginRight: '1rem' }} />
        <button onClick={() => navigate('/mygallery')} style={{ padding: '0.5rem 1rem', marginRight: '1rem' } }>Your Collections</button>
      </nav>
      <div>
        {}
      </div>
      <div className="landing-content">
        <h1>Study Buddy</h1>
        <p>lorem ipsum.</p>
        <div className="category-buttons">
        </div>
      </div>
    </div>
  );
};

export default HomePage;
