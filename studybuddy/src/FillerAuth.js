import React from 'react';
import './styles/home.css';
import Button from './components/menuButton';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1>Study Buddy</h1>
        <p>Welcome to Study Buddy, your perfect study companion.</p>
        <div className="category-buttons">
          <Button text="Login" destination="/login" color="#92C7CF" textcolor="#fafafa"/>
          <Button text="Sign Up" destination="/signup" color="#92C7CF" textcolor="#fafafa"/>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
