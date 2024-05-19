import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    setRecognizedText('');
    setErrorMessage('');
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      setErrorMessage('Please select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('http://localhost:5000/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRecognizedText(response.data.text);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred while processing the image.');
    }
  };

  return (
    <div>
      <h2>Upload an Image to Read the Text</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUploadImage}>Upload Image</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {recognizedText && <p>Recognized Text: {recognizedText}</p>}
    </div>
  );
};

export default App;
