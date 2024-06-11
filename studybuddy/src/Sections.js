import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/sections.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


const Sections = () => {
  const collectionId = localStorage.getItem('currentCollection');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
  const deleteCollection = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this collection?');
    if (!confirmDelete) return;

    try{
      await axios.delete('http://localhost:5000/delete_collection', {
        data: { collection_id: collectionId }
      });
      window.location.href = "/mygallery";
    } catch(error){
      setError(error.message);
    }
    
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
    <div id="collections-main" >
      <div className="header" >
        <div className = "flex">
        <h2 style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%', marginRight: '10px' }}>Sections in {collectionName}</h2>
        <FontAwesomeIcon icon={faTrash} onClick={() => deleteCollection()} style={{ color: 'red', cursor: 'pointer' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>

            <input
            
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              style={{ padding: '0.5rem', width: '400px', color: 'gray', border: '1px solid gray', borderColor: 'gray', borderRadius: '5px', margin: '0 auto' }}
              />
              
          </div>
          <div id="category-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1%', flexWrap: 'wrap', marginTop: '5%' }}>
          <button id="create-btn" onClick={openModal} style={{ backgroundColor: 'rgba(136, 177, 184, 0.8)', border: 'none', borderRadius: '4px', padding: '3%', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', transition: 'background-color 0.3s ease, transform 0.3s', ':hover': { backgroundColor: '#63828b' } }}>
          <span id="plus-icon" style={{ transition: 'transform 0.3s' }}>+</span>
      </button>
       
        {sections.map(section => (
          <button key={section.id} className="category-btn" onClick={() => handleSectionClick(section)}>
            {section.section_name}
          </button>
        ))}
        <button className="category-btn" onClick={openModal}>
          <span className="plus-icon">+</span> New Section
        </button>

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
    </div>
  );
};

export default Sections;


