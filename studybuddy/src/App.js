import React from 'react';
import CreateCollection from './CreateCollection';
import CollectionGallery from './CollectionGallery';
import ScanNotes from './ScanNotes';

const App = () => {
  return (
    <div>
      <h1>Collection Manager</h1>
      <ScanNotes />
      <CreateCollection />
      <CollectionGallery />
    </div>
  );
};

export default App;
