
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './assets/logo (2).png';
import axios from 'axios';
import './styles/homepage.css';
import Navbar from './Navbar';

const CreateSectionModal = ({ recommendation, onClose }) => {
  const [sectionName, setSectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const [isNewSection, setIsNewSection] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_collections', {
          params: { username: localStorage.getItem('userName') }
        });
        setCollections(response.data.collections);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    fetchCollections();
  }, []);

  const handleCreateSection = async () => {
    try {
      const data = {
        username: localStorage.getItem('userName'),
        section_data: {
          topicName: recommendation.topicName,
          sources: recommendation.sources
        }
      };

      if (isNewSection) {
        data.collection_name = sectionName;
      } else {
        data.collection_id = selectedCollection;
      }

      const response = await axios.post('http://localhost:5000/create_section_from_recommendation', data);
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
        <h2 style={{ textAlign: 'center', color: 'gray' }}>Create New Collection</h2>
        <div>
          <input
            type="radio"
            id="newSection"
            name="sectionType"
            checked={isNewSection}
            onChange={() => setIsNewSection(true)}
            style={{ padding: '10px' }}
          />
          <label htmlFor="newSection">Create New Collection</label>
        </div>
        <div>
          <input
            type="radio"
            id="existingSection"
            name="sectionType"
            checked={!isNewSection}
            onChange={() => setIsNewSection(false)}
          />
          <label htmlFor="existingSection">Use Existing Collection</label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            disabled={isNewSection}
          >
            <option value="">Select Collection</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>{collection.data.title}</option>
            ))}
          </select>
        </div>
        {isNewSection && (
          <input
            type="text"
            placeholder="Enter section name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            style={{ padding: '10px', color: 'gray', marginTop: '10px' }}
          />
        )}
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

const Spinner = () => {
  return (
    <div className="loading-spinner">
      {/* Add your spinner UI here */}
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

          if (recommendationsResponse.data.recommendations && recommendationsResponse.data.recommendations.length > 0) {
            const recommendationss = await axios.get('http://localhost:5000/process_recommendations', {
              params: {
                recs: recommendationsResponse.data.recommendations
              }
            });

            setRecommendedSections(recommendationss.data.recommendations);
          }

          setRecentSections(recentResponse.data.collections);
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
      <Navbar/>
      <div className="main">
        <h1>Study Buddy</h1>
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <p>Recently Viewed</p>
            <div className="cards-container">
              {recentSections.slice(0, 4).map(section => (  // Show only the top 4 recently viewed sections
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