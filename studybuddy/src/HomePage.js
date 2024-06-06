import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './components/menuButton';
import Logo from './assets/logo (2).png';
import axios from 'axios';


const HomePage = () => {
  const navigate = useNavigate();
  const [recentSections, setRecentSections] = useState([]);
  const username = localStorage.getItem('userName');

  useEffect(() => {
    const fetchRecentSections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_my_sections_recent', {
          params: { username: username} 
        });
        setRecentSections(response.data.collections);
      } catch (error) {
        console.error('Error fetching recent sections:', error);
      }
    };

    fetchRecentSections();
  }, []);
  const handleSectionClick = (sectionId) => {
    // Redirect to the section page using React Router
    navigate(`/section/${sectionId}`);
  };

  return (
    <div>
      <nav style={{ backgroundColor: 'lightblue', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Logo" style={{ height: '100px', marginRight: '1rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
          <input type="text" placeholder="Search..." style={{ padding: '0.5rem', width: '400px', color: 'gray', border: '1px solid gray', borderColor: 'gray' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/mygallery')} style={{ padding: '0.5rem 1rem' }}>Your Collections</button>
        </div>
      </nav>
      <div>
      </div>
      <div className="landing-content">
        <h1>Study Buddy</h1>
        <p>Recently Viewed</p>
        {recentSections.map(section => (
          <button className="category-btn" key={section.id} onClick={() => handleSectionClick(section.id)}>
            {section.title  || 'Untitled'}
          </button>
        ))}
        <p>Public Sections</p>
        <div className="category-buttons">
        </div>
      </div>
    </div>
  );
};

export default HomePage;