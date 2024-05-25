import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/home.css';
const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionNotes, setNewCollectionNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOpenCollection = (collectionName) => {
    localStorage.setItem('currentCollection', collectionName);
    window.location.href = "/openedcollection";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="study-buddy">
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
        <button className="category-btn">
          <span className="plus-icon">+</span> Review
        </button>
      
        {collections.map(collection => (
          <button className="category-btn" key={collection.id} onClick={() => handleOpenCollection(collection.title)}>
            {collection.title || 'Untitled'}
          </button>
        ))}
        </div>
      
      <h2>Create New Collection</h2>
      <input
        type="text"
        placeholder="Collection Name"
        value={newCollectionName}
        onChange={(e) => setNewCollectionName(e.target.value)}
      />
      <textarea
        placeholder="Notes"
        value={newCollectionNotes}
        onChange={(e) => setNewCollectionNotes(e.target.value)}
      />
      <button onClick={handleCreateCollection}>Create Collection</button>
    </div>
  );
};

export default Collections;
