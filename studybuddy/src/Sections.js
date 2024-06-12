import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Sections = () => {
  const collectionId = localStorage.getItem('currentCollection');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);
  const collectionName = localStorage.getItem('collectionName');
  const [selectedSections, setSelectedSections] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSectionClick = (section) => {
    localStorage.setItem('currentSection', section.id);
    localStorage.setItem('currentSectionName', section.section_name);
    window.location.href = "/chapter";
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewSectionName('');
    setError(null);
  };

  const handleDeleteSection = async (sectionId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this section?');
    if (!confirmDelete) return;

    try {
      await axios.delete('http://localhost:5000/delete_section', {
        data: { collection_id: collectionId, section_id: sectionId }
      });

      const response = await axios.get(`http://localhost:5000/get_sections?collection_id=${collectionId}`);
      setSections(response.data.sections);
      setError(null);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleDragStart = (sectionId) => {
    setDraggedSectionId(sectionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOverTrash(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOverTrash(false);
  };
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedSections([]); 
  }
  const openReviewModal = () => {
    setIsReviewModalOpen(true);
  }
  

  const handleDrop = () => {
    if (draggedSectionId) {
      handleDeleteSection(draggedSectionId);
      setDraggedSectionId(null);
      setIsDraggingOverTrash(false);
    }
  };

  const handleCheckboxChange = (sectionId) => {
    setSelectedSections(prevSelectedSections => {
      if (prevSelectedSections.includes(sectionId)) {
        return prevSelectedSections.filter(id => id !== sectionId);
      } else {
        return [...prevSelectedSections, sectionId];
      }
    });
  };

  const handleSubmitReview = async () => {
    try {
      await axios.post('http://localhost:5000/create_review', {
        collection_id: collectionId,
        section_ids: selectedSections,
        name: newReviewName,
        username: localStorage.getItem('userName')
      });
      closeReviewModal();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="loading-spinner" style={{
      border: '8px solid white',
      borderTop: '8px solid #6DC5D1',
      borderRadius: '50%',
      width: '50px',
      height: '50px',
      animation: 'spin 1s linear infinite',
      margin: '20px auto'
    }} />;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>Error: {error}</div>;
  }

  return (
    <div id="sections-main" style={{ padding: '20px' }}>
      <div className="header">
        <div className="flex">
          <h2 style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%', marginRight: '10px' }}>
            Sections in {collectionName}
          </h2>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          style={{ padding: '0.5rem', width: '400px', color: 'gray', border: '1px solid gray', borderRadius: '5px', margin: '0 auto' }}
        />
      </div>
      <div id="category-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1%', flexWrap: 'wrap', marginTop: '5%' }}>
        <button id="create-btn" onClick={openModal} style={{ 
            backgroundColor: 'rgba(136, 177, 184, 0.8)',
            border: 'none',
            borderRadius: '4px',
            padding: '3%',
            color: '#fff',
            fontSize: '1.3rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.3s',
            opacity: 0.7,
        }}>
          <span id="plus-icon" style={{ transition: 'transform 0.3s' }}>New Section</span>
        </button>
        <button id="create-btn" onClick={openReviewModal} style={{ 
            backgroundColor: 'rgba(136, 177, 184, 0.8)',
            border: 'none',
            borderRadius: '4px',
            padding: '3%',
            color: '#fff',
            fontSize: '1.3rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.3s',
            opacity: 0.7,
        }}>
          <span id="plus-icon" style={{ transition: 'transform 0.3s' }}>New Review</span>
        </button>
        {sections.map(section => (
          <div key={section.id} style={{ position: 'relative', display: 'flex', alignItems: 'stretch', marginBottom: '10px' }}>
            <button
              draggable
              onDragStart={() => handleDragStart(section.id)}
              onClick={() => handleSectionClick(section)}
              style={{ 
                backgroundColor: 'rgba(136, 177, 184, 0.8)', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '10px 20px', 
                color: '#fff', 
                fontSize: '1.3rem', 
                cursor: 'pointer', 
                transition: 'background-color 0.3s ease, transform 0.3s', 
                height: '120%',
                marginRight: '10px' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {section.section_name || 'Untitled'}
            </button>
          </div>
        ))}
      </div>

      <div
        id="trash-icon"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          color: isDraggingOverTrash ? '#A34343' : '#FF6969',
          fontSize: '4rem',
          zIndex: '1000',
          transition: 'color 0.3s'
        }}
      >
        <FontAwesomeIcon icon={faTrash} />
      </div>

      {isReviewModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <h2>Create Review</h2>
      <div>
       <input
              type="text"
              placeholder="Review Name"
              value={newReviewName}
              onChange={(e) => setNewReviewName(e.target.value)}
              style={{
                padding: '0.5rem',
                width: '100%',
                boxSizing: 'border-box',
                marginBottom: '1rem',
                borderRadius: '5px',
                border: '1px solid #ccc',
                outline: 'none'
              }}
            />
        {sections.map(section => (
          <div key={section.id}>
            <input
              type="checkbox"
              id={`section-${section.id}`}
              checked={selectedSections.includes(section.id)}
              onChange={() => handleCheckboxChange(section.id)}
            />
            <label htmlFor={`section-${section.id}`}>{section.section_name}</label>
          </div>
        ))}
      </div>
      <button onClick={handleSubmitReview}>Submit</button>
      <button onClick={closeReviewModal}>Cancel</button>
    </div>
  </div>
)}
      {isModalOpen && (
        <div className="modal" style={{
          padding: '0.5rem',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '1rem',
          borderRadius: '5px', // Rounded corners for input
          border: '1px solid #ccc', // Light border color for better appearance
          outline: 'none', // Remove outline on focus
  }}>
          <div className="modal-content" style={{
            backgroundColor: '#fefefe',
            margin: '15% auto',
            padding: '20px',
            border: '1px solid #888',
            width: '80%',
            maxWidth: '500px',
            borderRadius: '8px'
          }}>
            <span className="close" onClick={closeModal} style={{
              color: '#aaa',
              float: 'right',
              fontSize: '28px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>&times;</span>
            <h2 style={{ textAlign: 'left', marginBottom: '1rem', color: '#a2acb0' }}>Create New Section</h2>
            <input
              type="text"
              placeholder="Section Name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              style={{
                padding: '0.5rem',
                width: '100%',
                boxSizing: 'border-box',
                marginBottom: '1rem',
                borderRadius: '5px',
                border: '1px solid #ccc',
                outline: 'none'
              }}
            />
            <button className="create-btn" onClick={handleCreateSection} style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#88B1B8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}>Create Section</button>
            {error && <div id="error-message" style={{
              color: 'red',
              marginBottom: '1rem',
              textAlign: 'center',
              fontWeight: 'bold',
            }}>{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sections;
