import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/sections.css';

const Sections = () => {
  const collectionId = localStorage.getItem('currentCollection');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false); // Close modal after creation
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSectionClick = (section) => {
    localStorage.setItem('currentSection', section.id);
    localStorage.setItem('currentSectionName', section.section_name);
    window.location.href = "/chapter"; // Redirect to the chapter page
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewSectionName('');
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
        {sections.map(section => (
          <button key={section.id} className="category-btn" onClick={() => handleSectionClick(section)}>
            {section.section_name}
          </button>
        ))}
        <button className="category-btn" onClick={openModal}>
          <span className="plus-icon">+</span> New Section
        </button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Create New Section</h2>
            <input
              type="text"
              placeholder="Section Name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
            <button className="create-btn" onClick={handleCreateSection}>Create Section</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sections;


