import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './components/menuButton';
import Logo from './assets/logo (2).png';
import axios from 'axios';
import './styles/homepage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [recentSections, setRecentSections] = useState([]);
  const [recommendedSections, setRecommendedSections] = useState([]);
  const username = localStorage.getItem('userName');
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      localStorage.setItem('searchTerm', searchTerm);
      navigate(`/publicsections`);
    }
  }

  useEffect(() => {
    const fetchRecentSections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_my_sections_recent', {
          params: { username: username } 
        });
        setRecentSections(response.data.collections);
      } catch (error) {
        console.error('Error fetching recent sections:', error);
      }
    };

    fetchRecentSections();
  }, []);

  useEffect(() => {
    const fetchRecommendedSections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/recommend_public_sections', {
          params: { username: username } 
        });
        setRecommendedSections(response.data.recommended_sections);
      } catch (error) {
        console.error('Error fetching recommended sections:', error);
      }
    };

    fetchRecommendedSections();
  }, []);

  const handleSectionClick = (sectionId, collId, title, colName) => {
    localStorage.setItem('chapterId', sectionId);
    localStorage.setItem('collectionId', collId);
    localStorage.setItem('collectionName', colName);
    localStorage.setItem('currentSectionName', title);

    navigate(`/chapter`);
  };

  return (
    <div>
      <nav>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Logo" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
          <input 
            type="text" 
            placeholder="Search public sets..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/mygallery')}>Your Collections</button>
        </div>
      </nav>
      <div className="main">
        <h1>Study Buddy</h1>
        <p>Recently Viewed</p>
        <div className="cards-container">
          {recentSections.map(section => (
            <div className="card" key={section.id} onClick={() => handleSectionClick(section.id, section.collection_id, section.title, section.collName)}>
              <div className="card-title">{section.title || 'Untitled'}</div>
            </div>
          ))}
        </div>
        <p>Sections For You</p>
        <div className="cards-container">
          {recommendedSections.map(section => (
            <div className="card" key={section.id} onClick={() => handleSectionClick(section.id, section.collection_id, section.title, section.collName)}>
              <div className="card-title">{section.title || 'Untitled'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;