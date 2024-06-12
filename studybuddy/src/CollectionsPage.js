import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setError(null);
  };

  if (loading) {
    return <div id="loading">Loading...</div>;
  }

  if (error) {
    return <div id="error">Error: {error}</div>;
  }

  return (
    <div id="collections-main">
      <h2 style={{ textAlign: 'center', marginTop: '5%', color: '#99aab0', fontSize: '4rem', marginBottom: '3%' }}>Your Collections</h2>
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
        <button id="create-btn" onClick={openModal} style={{ backgroundColor: 'rgba(136, 177, 184, 0.8)', border: 'none', borderRadius: '4px', padding: '3%', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', transition: 'background-color 0.3s ease, transform 0.3s' }}>
          <span id="plus-icon" style={{ transition: 'transform 0.3s' }}>+</span>
        </button>
        {collections.map(collection => (
          <div key={collection.id} style={{ position: 'relative', display: 'flex', alignItems: 'stretch' }}>
            <button onClick={() => handleOpenCollection(collection.id, collection.title)} style={{ backgroundColor: 'rgba(136, 177, 184, 0.8)', border: 'none', borderRadius: '4px', padding: '3%', color: '#fff', fontSize: '1.3rem', cursor: 'pointer', transition: 'background-color 0.3s ease, transform 0.3s', flexGrow: 1 }}>
              {collection.title || 'Untitled'}
            </button>
            <FontAwesomeIcon icon={faTrash} onClick={() => handleDeleteCollection(collection.id)} style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }} />
          </div>
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
            {error && <div id="error-message">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
