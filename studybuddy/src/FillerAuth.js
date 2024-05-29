import React from 'react';
import './styles/home.css';

const LandingPage = () => {
  return (
    <div className="study-buddy">
      <h1>Study Buddy</h1>
      <p>Welcome to Study Buddy, blah blah blah filler description.</p>
      
      <div className="category-buttons">
        <button className="category-btn" onClick={() => window.location.href = "/login"}>Login</button>
        <button className="category-btn" onClick={() => window.location.href = "/signup"}>Signup</button>
      </div>
    </div>
  );
};

export default LandingPage;
