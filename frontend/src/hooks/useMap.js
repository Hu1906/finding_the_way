import { useState, useEffect, useRef, useCallback } from 'react';
// Đã import các hàm cần thiết để dùng trong displayRoute/resetMap
import { initializeMap, createStartMarker, createEndMarker, drawRoute, drawTraceAlgorithm, fitBounds } from '../services/mapService';

/**
 * Custom hook để quản lý bản đồ Leaflet
 */
export const useMap = (mapContainerRef) => {
    const [map, setMap] = useState(null);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [selectingPoint, setSelectingPoint] = useState(null);

    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);
    const routeLayerRef = useRef(null); // Ref để lưu lớp (layer) của đường đi
    const traceLayerRef = useRef(null); // Ref để lưu lớp (layer) của trace algorithm

    // === Hook 1: Chỉ khởi tạo bản đồ (chạy 1 lần) ===
    useEffect(() => {
        if (!mapContainerRef.current) return;

        try {
            const mapInstance = initializeMap(mapContainerRef.current);
            setMap(mapInstance);

            mapInstance.createPane("tracePane");
            mapInstance.createPane("routePane");

            mapInstance.getPane("tracePane").style.zIndex = 400;
            mapInstance.getPane("routePane").style.zIndex = 500;

            return () => {
                mapInstance.remove();
            };
        } catch (error) {
            console.error('Map initialization error:', error);
        }
    }, [mapContainerRef]);


    // === Hook 2: Xử lý click (Gắn/gỡ listener) ===
    useEffect(() => {
        if (!map) return;

        const handleMapClick = (e) => {
            if (selectingPoint === 'start') {
                setStartPoint([e.latlng.lat, e.latlng.lng]);
                setSelectingPoint(null);
            } else if (selectingPoint === 'end') {
                setEndPoint([e.latlng.lat, e.latlng.lng]);
                setSelectingPoint(null);
            }
        };

        map.on('click', handleMapClick);

        return () => {
            map.off('click', handleMapClick);
        };
    }, [map, selectingPoint]);


    // === Hook 3: Cập nhật và XÓA Marker (Đồng bộ với state) ===
    useEffect(() => {
        if (!map) return;

        // Xử lý Marker điểm bắt đầu
        if (startPoint) {
            if (startMarkerRef.current) {
                startMarkerRef.current.setLatLng(startPoint); // Di chuyển marker
            } else {
                startMarkerRef.current = createStartMarker(startPoint);
                startMarkerRef.current.addTo(map);
            }
        } else {
            if (startMarkerRef.current) {
                map.removeLayer(startMarkerRef.current);
                startMarkerRef.current = null;
            }
        }

        // Xử lý Marker điểm kết thúc
        if (endPoint) {
            if (endMarkerRef.current) {
                endMarkerRef.current.setLatLng(endPoint); // Di chuyển marker
            } else {
                endMarkerRef.current = createEndMarker(endPoint);
                endMarkerRef.current.addTo(map);
            }
        } else {
            if (endMarkerRef.current) {
                map.removeLayer(endMarkerRef.current);
                endMarkerRef.current = null;
            }
        }
    }, [map, startPoint, endPoint]);


    // === HÀM VẼ ROUTE ===
    const displayRoute = useCallback((routeData) => {
        if (!map || !routeData || !routeData.coordinates) return;

        // 1. Lấy bản sao của mảng tọa độ
        let finalCoordinates = [startPoint, ...routeData.coordinates, endPoint];

        // 2. Xóa route cũ và vẽ route mới
        if (routeLayerRef.current) {
            map.removeLayer(routeLayerRef.current);
        }

        // Vẽ route mới
        routeLayerRef.current = drawRoute(map, finalCoordinates); 

        // Fit bản đồ
        if (startPoint && endPoint) {
            fitBounds(map, startPoint, endPoint);
        }
    }, [map, startPoint, endPoint]); // Cần có endPoint trong dependencies

    const displayTraceAlgorithm = useCallback((traceData) => {
        if (!map || !traceData) return;
        
        if (traceLayerRef.current) {
            map.removeLayer(traceLayerRef.current);
        }

        traceLayerRef.current = drawTraceAlgorithm(map, traceData);

        if (startPoint && endPoint) {
            fitBounds(map, startPoint, endPoint);
        }
    }, [map, startPoint, endPoint]);

    // === HÀM RESET MAP (Giữ nguyên) ===
    const resetMap = useCallback(() => {
        setStartPoint(null);
        setEndPoint(null);
        setSelectingPoint(null);

        // Xóa route
        if (routeLayerRef.current) {
            map.removeLayer(routeLayerRef.current);
            routeLayerRef.current = null;
        }

        if (traceLayerRef.current) {
            map.removeLayer(traceLayerRef.current);
            traceLayerRef.current = null;
        }
    }, [map]);

    // Trả về các hàm và state cho component App
    return {
        map,
        startPoint,
        endPoint,
        setStartPoint,
        setEndPoint,
        selectingPoint,
        setSelectingPoint,
        displayRoute,
        displayTraceAlgorithm,
        resetMap
    };
};