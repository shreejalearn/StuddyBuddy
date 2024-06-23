import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import "./styles/loading.css";
import Navbar from './Navbar';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';


const Collections = () => {
  const { auth } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedCollectionId, setDraggedCollectionId] = useState(null);
  const [isDraggingOverTrash, setIsDraggingOverTrash] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const username = localStorage.getItem('userName');
        if (!username) {
          throw new Error('Username not found in local storage');
        }
        const response = await axios.get(`http://localhost:5000/get_my_collections?username=${username}`);
        setCollections(response.data.collections);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(error.message);
        setLoading(false);
        setIsModalOpen(true); // Open modal to show the error
      }
    };

    fetchCollections();
  }, []);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      setError('Collection name cannot be empty.');
      return;
    }

    if (collections.some(collection => collection.title === newCollectionName)) {
      setError('A collection with this name already exists.');
      return;
    }

    try {
      const username = localStorage.getItem('userName');
      if (!username) {
        throw new Error('Username not found in local storage');
      }

      await axios.post('http://localhost:5000/create_collection', {
        collection_name: newCollectionName,
        username: username
      });

      const response = await axios.get(`http://localhost:5000/get_my_collections?username=${username}`);
      setCollections(response.data.collections);

      setNewCollectionName('');
      setIsModalOpen(false);
      setError(null);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this collection?');
    if (!confirmDelete) return;

    try {
      const username = localStorage.getItem('userName');

      await axios.delete('http://localhost:5000/delete_collection', {
        data: { collection_id: collectionId }
      });

      const response = await axios.get(`http://localhost:5000/get_my_collections?username=${username}`);
      setCollections(response.data.collections);
      setError(null);
    } catch (error) {
      console.error(error);
      setError(error.message);
      setIsModalOpen(true); // Open modal to show the error
    }
  };

  const handleOpenCollection = (collectionId, collectionName) => {
    localStorage.setItem('currentCollection', collectionId);
    localStorage.setItem('collectionName', collectionName);
    console.log('Navigating to /sections with auth state:', auth);
    navigate('/sections');
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCollectionName('');
    setError(null);
  };

  const handleDragStart = (collectionId) => {
    setDraggedCollectionId(collectionId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOverTrash(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOverTrash(false);
  };

  const handleDrop = () => {
    if (draggedCollectionId) {
      handleDeleteCollection(draggedCollectionId);
      setDraggedCollectionId(null);
      setIsDraggingOverTrash(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div id="collections-main">
      <Navbar/>
      <h2 style={{ textAlign: 'center', marginTop: '2%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%' }}>Your Collections</h2>
      
      <div id="category-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1%', flexWrap: 'wrap', marginTop: '3.5%' }}>
        <button
          id="create-btn"
          onClick={openModal}
          style={{
            backgroundColor: 'rgba(136, 177, 184, 0.8)',
            border: 'none',
            borderRadius: '4px',
            padding: '3%',
            color: '#fff',
            fontSize: '1.3rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.3s',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span id="plus-icon" style={{ transition: 'transform 0.3s' }}>New Collection</span>
        </button>
        </div>      
        <div id="category-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '1%', flexWrap: 'wrap', marginTop: '3.5%' }}>

        {collections.map(collection => (
          <div key={collection.id} style={{ position: 'relative', display: 'flex', alignItems: 'stretch', marginBottom: '10px' }}>
            <button
              draggable
              onDragStart={() => handleDragStart(collection.id)}
              onClick={() => handleOpenCollection(collection.id, collection.title)}
              style={{
                backgroundColor: 'rgba(136, 177, 184, 0.8)',
                border: 'none',
                height: '120%',
                borderRadius: '4px',
                padding: '3%',
                color: '#fff',
                fontSize: '1.3rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease, transform 0.3s',
                width: '200px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {collection.title || 'Untitled'}
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

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2 style={{ textAlign: 'left', marginBottom: '1rem', color: '#a2acb0' }}>Create New Collection</h2>
            <input
              type="text"
              placeholder="Collection Name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              style={{
                padding: '0.5rem',
                width: '100%',
                boxSizing: 'border-box',
                marginBottom: '1rem',
                borderRadius: '5px', // Rounded corners for input
                border: '1px solid #ccc', // Light border color for better appearance
                outline: 'none', // Remove outline on focus
              }}
            />
            {error && <div id="error-message" style={{
              color: 'red',
              marginBottom: '1rem',
              textAlign: 'center',
            }}>{error}</div>}
            <button className="create-btn" onClick={handleCreateCollection} style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#88B1B8',
              color: 'white', // Changed button text color to gray
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}>Create Collection</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
