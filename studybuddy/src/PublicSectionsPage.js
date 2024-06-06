import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './components/menuButton';
import Logo from './assets/logo (2).png';
import axios from 'axios';


const HomePage = () => {
  const navigate = useNavigate();
  const [recentSections, setRecentSections] = useState([]);
  const username = localStorage.getItem('userName');
  const st = localStorage.getItem('searchTerm');
  const [publicSections, setPublicSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      localStorage.setItem('searchTerm', searchTerm);
      navigate(`/publicsections`);
    }
  }
  useEffect(() => {
    const fetchPublicSections = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/search_public_sections?search_term=${st}&name=${username}`);
        setPublicSections(response.data.sections);
      } catch (error) {
        console.error('Error fetching public sections:', error);
      }
    };

    fetchPublicSections();
  }, [searchTerm]);
  const handleSectionClick = (sectionId) => {
    // VIEW CLONING LOGIC
  };

  return (
    <div>
      <nav style={{ backgroundColor: 'lightblue', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={Logo} alt="Logo" style={{ height: '100px', marginRight: '1rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
        <input 
            type="text" 
            placeholder="Search public sets..." 
            style={{ padding: '0.5rem', width: '400px', color: 'gray', border: '1px solid gray', borderColor: 'gray' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress} 
          />        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/mygallery')} style={{ padding: '0.5rem 1rem' }}>Your Collections</button>
        </div>
      </nav>
      <div>
      </div>
      <div className="landing-content">
        <p>Search Results</p>
        {publicSections.map(section => (
          <button className="category-btn" key={section.id} onClick={() => handleSectionClick(section.id)}>
            {section.title  || 'Untitled'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomePage;