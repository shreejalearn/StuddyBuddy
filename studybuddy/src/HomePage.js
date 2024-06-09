import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './assets/logo (2).png';
import axios from 'axios';
import './styles/homepage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [recentSections, setRecentSections] = useState([]);
  const [recommendedSections, setRecommendedSections] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const username = localStorage.getItem('userName');
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      localStorage.setItem('searchTerm', searchTerm);
      navigate(`/publicsections`);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recentResponse = await axios.get('http://localhost:5000/get_my_sections_recent', {
          params: { username: username } 
        });
  
        if (recentResponse.data.collections && recentResponse.data.collections.length > 0) {
          const recentSectionsTitles = recentResponse.data.collections.map(collection => collection.title);
          const recentSectionsString = recentSectionsTitles.join(', ');
          console.log(recentSectionsString);
  
          const recommendationsResponse = await axios.get('http://localhost:5000/recommendations', {
            params: { 
              username: username,
              recentSections: recentSectionsString,
            } 
          });
  
          setRecentSections(recentResponse.data.collections);
          setRecommendedSections(recommendationsResponse.data.recommendations);
          setLoading(false); // Set loading to false when data is fetched
        } else {
          console.error('No recent sections found');
          setLoading(false); // Set loading to false even if no recent sections found
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false on error
      }
    };
  
    fetchData();
  }, [username]);
  
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
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center', borderRadius: '7px' }}>
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
        {loading ? ( // Render loading spinner if loading is true
          <div className="loading-spinner"></div>
        ) : (
          <>
            <p>Recently Viewed</p>
            <div className="cards-container">
              {recentSections.map(section => (
                <div className="card" key={section.id} onClick={() => handleSectionClick(section.id, section.collection_id, section.title, section.collName)}>
                  <div className="card-title">{section.title || 'Untitled'}</div>
                </div>
              ))}
            </div>

            <p>Learning Paths For You</p>
            <div className="recommendations-text">
              <p>{recommendedSections}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;