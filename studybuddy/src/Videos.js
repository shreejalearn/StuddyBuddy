import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VideoPage = () => {
  const collectionId = localStorage.getItem('currentCollection');
  const sectionId = localStorage.getItem('currentSection');
  const [videoPaths, setVideoPaths] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVideoPaths = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_video_paths', {
          params: {
            collection_id: collectionId,
            section_id: sectionId,
          },
        });
        setVideoPaths(response.data.videoPaths);
      } catch (error) {
        console.error('Error fetching video paths:', error);
      }
    };

    fetchVideoPaths();
  }, [collectionId, sectionId]);

  const handleGenerateVideo = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/generate_video_from_notes', {
        collection_id: collectionId,
        section_id: sectionId,
      });
      if (response.data.video_path) {
        setVideoPaths(prevPaths => [...prevPaths, { path: response.data.video_path }]);
      }
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-page">
      <h2>Video Page</h2>
      <div className="video-list">
        {videoPaths.map((video, index) => (
          <div key={index} className="video-item">
            <a href={video.path} target="_blank" rel="noopener noreferrer">Video {index + 1}</a>
          </div>
        ))}
      </div>
      <button onClick={handleGenerateVideo} disabled={loading}>
        {loading ? 'Generating...' : 'Generate New Video'}
      </button>
    </div>
  );
};

export default VideoPage;
