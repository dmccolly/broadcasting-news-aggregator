import React from 'react';
import NewsWidget from './components/NewsWidget';
import './App.css';

function App() {
  return (
    <div className="app">
      <NewsWidget 
        maxArticles={15}
        showImages={true}
        showUpdateInfo={true}
      />
    </div>
  );
}

export default App;

