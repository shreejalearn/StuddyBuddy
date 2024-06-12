import React from 'react';
import { useParams } from 'react-router-dom';

const VideoPlayer = () => {
  // Extracting the videoPath from URL params
  const { videoPath } = useParams();

  return (
    <div className="video-list">
      <div className="video-item">
        <video controls>
          <source src={`http://localhost:5000/videos/${videoPath}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;
