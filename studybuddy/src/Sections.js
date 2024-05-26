import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/home.css';

const Sections = () => {
  const collectionId = localStorage.getItem('currentCollection');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [showNewSectionInput, setShowNewSectionInput] = useState(false);
  const collectionName = localStorage.getItem('collectionName');

  useEffect(() => {
    const fetchSections = async () => {
      try {
        if (!collectionId) {
          throw new Error('Collection ID not found in local storage');
        }

        const response = await axios.get(`http://localhost:5000/get_sections?collection_id=${collectionId}`);
        setSections(response.data.sections);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchSections();
  }, [collectionId]);

  const handleCreateSection = async () => {
    try {
      await axios.post('http://localhost:5000/create_section', {
        collection_id: collectionId,
        section_name: newSectionName,
      });

      const response = await axios.get(`http://localhost:5000/get_sections?collection_id=${collectionId}`);
      setSections(response.data.sections);
      setNewSectionName('');
      setShowNewSectionInput(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSectionClick = (section) => {
    localStorage.setItem('currentSection', section.id);
    localStorage.setItem('currentSectionName', section.section_name);
    window.location.href = "/chapter"; // Redirect to the chapter page
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="study-buddy">
      <h2>Sections in {collectionName}</h2>
      <div className="category-buttons">
        <div>
          {sections.map(section => (
            <button key={section.id} className="category-btn" onClick={() => handleSectionClick(section)}>
              {section.section_name}
            </button>
          ))}
        </div>
        {showNewSectionInput ? (
          <div className="new-section-input">
            <input
              type="text"
              placeholder="New Section Name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
            <button onClick={handleCreateSection}>Add Section</button>
            <button onClick={() => setShowNewSectionInput(false)}>Cancel</button>
          </div>
        ) : (
          <button className="category-btn" onClick={() => setShowNewSectionInput(true)}>
            <span className="plus-icon">+</span> New Section
          </button>
        )}
      </div>
    </div>
  );
};

export default Sections;
