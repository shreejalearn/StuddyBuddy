import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionNotes, setNewCollectionNotes] = useState('');

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Your Collections</h2>
      <ul>
        {collections.map(collection => (
          <li key={collection.id}>
            <strong>{collection.title || 'Untitled'}</strong>
          </li>
        ))}
      </ul>
      
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
