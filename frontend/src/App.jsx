import React, { useState } from 'react';
import { findPath } from './api/pathService';
import MapView from './components/MapView';
import { appStyles } from './styles/appStyles';

function App() {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const center = [20.9995, 105.8463];

  const handleMapClick = (latlng) => {
    console.log('Map clicked at:', latlng);
    if (!startPoint) {
      setStartPoint(latlng);
      setEndPoint(null);
      setPath([]);
      setError('');
    } else if (!endPoint) {
      setEndPoint(latlng);
      handleFindPath(latlng);
    } else {
      setStartPoint(latlng);
      setEndPoint(null);
      setPath([]);
      setError('');
    }
  };

  const handleFindPath = async () => {
    console.log('Finding path from', startPoint, 'to', endPoint);
    try {
      setLoading(true);
      const data = await findPath(startPoint, endPoint);
      setPath(data.path || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setPath([]);
    setError('');
  };

  return (
    <div style={appStyles.container}>
      <header style={appStyles.header}>
        <h1>🗺️ Tìm Đường Với Thuật Toán A*</h1>
        <p>Quận Hai Bà Trưng, Hà Nội</p>
      </header>

      <button
        onClick={handleFindPath}
        style={appStyles.buttonTest}
      >
        Tìm đường
      </button>

      <div style={appStyles.mapContainer}>
        <MapView
          center={center}
          startPoint={startPoint}
          endPoint={endPoint}
          path={path}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
}

export default App;
