import React from 'react';
import './styles/home.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Study Buddy</h1>
        <p>Welcome to Study Buddy, your perfect study companion.</p>
        <div className="category-buttons">
          <button className="category-btn" onClick={() => window.location.href = "/login"}>Login</button>
          <button className="category-btn" onClick={() => window.location.href = "/signup"}>Signup</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
