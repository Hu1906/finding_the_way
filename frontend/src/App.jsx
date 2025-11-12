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

  const handleFindPath = async (end) => {
    try {
      setLoading(true);
      const data = await findPath(startPoint, end);
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
        onClick={() => findPath({ lat: 21.0136, lng: 105.8451 }, { lat: 21.0142, lng: 105.8445 }).then(alert)}
        style={appStyles.buttonTest}
      >
        TEST API
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
