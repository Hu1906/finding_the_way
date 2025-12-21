import React, { useEffect, useRef, useState } from 'react';
import Map from './components/Map';
import Controls from './components/Controls';
import RouteInfo from './components/RouteInfo';
import AlgorithmSelector from './components/AlgorithmSelector';
import { useMap } from './hooks/useMap';
import { findRoute } from './services/routeService';
import './App.css';

function App() {
  const mapContainerRef = useRef(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('astar');
  const [traceVisible, setTraceVisible] = useState(true);
  const [currentTraceStep, setCurrentTraceStep] = useState(0);
  const [sliceSize, setSliceSize] = useState(200);
  const MAX_SLICE_SIZE = 4000; 
  const [checkRouteDisplay, setCheckRouteDisplay] = useState(false);

  const {
    startPoint,
    endPoint,
    setStartPoint,
    setEndPoint,
    selectingPoint,
    setSelectingPoint,
    displayRoute,
    displayTraceAlgorithm,
    resetMap
  } = useMap(mapContainerRef);

  useEffect(() => {
    if (!traceVisible || !route || !route?.trace) return;
    if (currentTraceStep > route.trace.length) {
      if (!checkRouteDisplay) {
        displayRoute(route);
        setCheckRouteDisplay(true);
      }
      return;
    }

    // vẽ một lát trace theo `sliceSize` hiện tại
    displayTraceAlgorithm(route.trace.slice(0, currentTraceStep + sliceSize));

    const timer = setTimeout(() => {
      setCurrentTraceStep(prev => prev + sliceSize);
      setSliceSize(prev => Math.min(prev * 2, MAX_SLICE_SIZE)); // tăng gấp đôi nhưng clamp vào MAX
    }, 50); // tùy chỉnh tốc độ vẽ

    return () => clearTimeout(timer);
  }, [route, currentTraceStep, traceVisible, checkRouteDisplay, displayRoute, displayTraceAlgorithm, sliceSize]);

  const handleFindRoute = async () => {
    if (!startPoint || !endPoint || loading) return;

    setLoading(true);
    setError(null);
    setRoute(null);

    try {
      const routeData = await findRoute(
        startPoint,
        endPoint,
        selectedAlgorithm
      );

      if (routeData.startPoint) {
        // Cập nhật state startPoint bằng tọa độ của node đã snap
        setStartPoint([routeData.startPoint.lat, routeData.startPoint.lon]);
      }

      if (routeData.endPoint) {
        // Cập nhật state endPoint bằng tọa độ của node đã snap
        setEndPoint([routeData.endPoint.lat, routeData.endPoint.lon]);
      }

      setRoute(routeData);
      setCurrentTraceStep(0);
      setSliceSize(200);
      setCheckRouteDisplay(false);

      if (!traceVisible) {
        displayRoute(routeData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRoute(null);
    setError(null);
    resetMap();
    setSliceSize(200);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tìm Đường Đi - Hà Nội</h1>

        <AlgorithmSelector
          selectedAlgorithm={selectedAlgorithm}
          onChange={setSelectedAlgorithm}
          disabled={loading}
        />

        <Controls
          startPoint={startPoint}
          endPoint={endPoint}
          selectingPoint={selectingPoint}
          loading={loading}
          onSelectStart={() => setSelectingPoint('start')}
          onSelectEnd={() => setSelectingPoint('end')}
          onFindRoute={handleFindRoute}
          onReset={handleReset}
          traceVisibility={traceVisible}
          onChangeTraceVisibility={() => setTraceVisible(!traceVisible)}
        />

        <RouteInfo
          route={route}
          error={error}
          selectingPoint={selectingPoint}
        />
      </header>

      <main className="app-main">
        <Map ref={mapContainerRef} />
      </main>
    </div>
  );
}

export default App;