import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/collections.css'; // Import the CSS file

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionNotes, setNewCollectionNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          throw new Error('Username not found in local storage');
        }

        const response = await axios.get(`http://localhost:5000/get_my_collections?username=${username}`);
        setCollections(response.data.collections);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleCreateCollection = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) {
        throw new Error('Username not found in local storage');
      }

      await axios.post('http://localhost:5000/create_collection', {
        collection_name: newCollectionName,
        notes: newCollectionNotes,
        username: username
      });

      const response = await axios.get(`http://localhost:5000/get_my_collections?username=${username}`);
      setCollections(response.data.collections);

      setNewCollectionName('');
      setNewCollectionNotes('');
      setIsModalOpen(false); // Close modal after creation
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOpenCollection = (collectionId, collectionName) => {
    localStorage.setItem('currentCollection', collectionId);
    localStorage.setItem('collectionName', collectionName);
    window.location.href = "/sections";
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCollectionName('');
    setNewCollectionNotes('');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="collections-main">
      <h2>Your Collections</h2>
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      </div>
      <div className="category-buttons">
        <button className="category-btn" onClick={openModal}>
          <span className="plus-icon">+</span>
        </button>
        {collections.map(collection => (
          <button className="category-btn" key={collection.id} onClick={() => handleOpenCollection(collection.id, collection.title)}>
            {collection.title || 'Untitled'}
          </button>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Create New Collection</h2>
            <input
              type="text"
              placeholder="Collection Name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <button className="create-btn" onClick={handleCreateCollection}>Create Collection</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
