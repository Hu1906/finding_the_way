const { haversineDistance } = require('../utils/geo');
const { performance } = require('perf_hooks');

class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(item, priority) {
        this.items.push({ item, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

function ucs(nodes, graph, startId, goalId) {
    const startTime = performance.now();
    if (!graph.has(startId) || !graph.has(goalId)) {
        console.warn(`⚠️ Node không tồn tại trong graph: ${startId} hoặc ${goalId}`);
        return null;
    }

    if (startId === goalId) return { path: [startId], steps: 0, distance: 0, elapsedTime: 0 };

    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const orderSet = []; // Chứa thứ tự các node đã được thêm vào closedSet

    gScore.set(startId, 0);
    openSet.enqueue(startId, 0);

    let iterations = 0;
    const maxIterations = 200000;

    while (!openSet.isEmpty() && iterations < maxIterations) {
        iterations++;
        const { item: current } = openSet.dequeue();
        orderSet.push(nodes.get(current));

        if (current === goalId) {
            const path = [current];
            let temp = current;
            let totalDistance = 0;

            while (cameFrom.has(temp)) {
                const prev = cameFrom.get(temp);
                const edgeMap = graph.get(prev) || new Map();
                const edgeData = edgeMap.get(temp) || {};
                if (typeof edgeData.distance === 'number') totalDistance += edgeData.distance;
                temp = prev;
                path.unshift(temp);
            }

            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`✅ UCS tìm thấy đường đi từ ${startId} đến ${goalId} sau ${iterations} bước`);
            return {
                path,
                steps: path.length - 1,
                distance: totalDistance,
                elapsedTime,
                orderSet: orderSet, // Thứ tự các node đã được xử lý
            };
        }

        closedSet.add(current);

        const neighbors = graph.get(current) || new Map();
        for (const [neighborId, edgeData] of neighbors.entries()) {
            if (closedSet.has(neighborId)) continue;

            const costToNeighbor = edgeData.cost || edgeData.distance || 1;
            const tentativeG = gScore.get(current) + costToNeighbor;

            if (!gScore.has(neighborId) || tentativeG < gScore.get(neighborId)) {
                cameFrom.set(neighborId, current);
                gScore.set(neighborId, tentativeG);
                openSet.enqueue(neighborId, tentativeG);
            }
        }
    }

    console.warn(`⚠️ UCS không tìm thấy đường đi từ ${startId} đến ${goalId} sau ${iterations} vòng lặp.`);
    return null;
}

module.exports = {
    name: 'ucs',
    findPath: ucs,
};