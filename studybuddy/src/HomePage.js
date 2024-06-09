import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './assets/logo (2).png';
import axios from 'axios';
import './styles/homepage.css';
const CreateSectionModal = ({ recommendation, onClose }) => {
  const [sectionName, setSectionName] = useState('');

  const handleCreateSection = async () => {
    try {
      console.log(sectionName);
      console.log(recommendation.topicName);
      console.log(recommendation.sources);

      const response = await axios.post('http://localhost:5000/create_section_from_recommendation', {
        collection_name: sectionName,
        username: localStorage.getItem('userName'),
        section_data: {
          topicName: recommendation.topicName,
          sources: recommendation.sources
        }
      });
      console.log(response.data);
      onClose(); // Close the modal after successful creation
    } catch (error) {
      console.error('Error creating section:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Create New Section</h2>
        <input
          type="text"
          placeholder="Enter section name"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
        />
        <button onClick={handleCreateSection}>Create Section</button>
      </div>
    </div>
  );
};

const RecommendationCard = ({ recommendation }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreateSectionClick = () => {
    setShowModal(true);
  };

  return (
    <div className="recommendation-card">
      <div className="card-title" onClick={handleExpandClick}>
        {recommendation.topicName}
      </div>
      {isExpanded && (
        <div className="card-content">
          <p>{recommendation.topicDescription}</p>
          <div className="sources">
            {recommendation.sources.map((source, index) => (
              <div key={index}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
              </div>
            ))}
          </div>
          <button className="create-section-button" onClick={handleCreateSectionClick}>Create Section</button>
        </div>
      )}
      {showModal && <CreateSectionModal recommendation={recommendation} onClose={() => setShowModal(false)} />}

    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [recentSections, setRecentSections] = useState([]);
  const [recommendedSections, setRecommendedSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('userName');
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      localStorage.setItem('searchTerm', searchTerm);
      navigate(`/publicsections`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recentResponse = await axios.get('http://localhost:5000/get_my_sections_recent', {
          params: { username: username }
        });

        if (recentResponse.data.collections && recentResponse.data.collections.length > 0) {
          const recentSectionsTitles = recentResponse.data.collections.map(collection => collection.title);
          const recentSectionsString = recentSectionsTitles.join(', ');

          const recommendationsResponse = await axios.get('http://localhost:5000/recommendations', {
            params: {
              username: username,
              recentSections: recentSectionsString,
            }
          });
          console.log(recommendationsResponse);

          setRecentSections(recentResponse.data.collections);
          setRecommendedSections(recommendationsResponse.data.recommendations);
          setLoading(false);
        } else {
          console.error('No recent sections found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
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
        {loading ? (
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
            <div className="recommendations-container">
              {recommendedSections.map((rec, index) => (
                <RecommendationCard key={index} recommendation={rec} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
