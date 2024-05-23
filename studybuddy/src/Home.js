import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/home.css'; // Ensure to create this CSS file

const StudyBuddy = () => {
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_collections');
        setCollections(response.data.collections);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="study-buddy">
      <h2>Study Buddy</h2>
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
        <button className="category-btn">Reading</button>
        <button className="category-btn">Chemistry</button>
        <button className="category-btn">English</button>
        <button className="category-btn">Math</button>
      </div>
    </div>
  );
};

export default StudyBuddy;
