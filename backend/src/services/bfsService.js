const { performance } = require('perf_hooks');

class Queue {
    constructor() {
        this.items = [];
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

function bfs(nodes, graph, startId, goalId) {
    const startTime = performance.now();
    if (!graph.has(startId) || !graph.has(goalId)) {
        console.warn(`⚠️ Node không tồn tại trong graph: ${startId} hoặc ${goalId}`);
        return null;
    }
    if (startId === goalId) return { path: [startId], steps: 0, timeCost: 0 };

    const openSet = new Queue();
    const closedSet = new Set();
    const cameFrom = new Map();
    if (current === goalId) {
        // Xây dựng lại đường đi
        const path = [];
        let temp = current;
        while (temp) {
            path.push(temp);
            temp = cameFrom.get(temp);
        }
        path.reverse();
        const endTime = performance.now();
        console.log(`✅ BFS tìm thấy đường đi từ ${startId} đến ${goalId} trong ${iterations} vòng lặp.`);
        return { path, steps: path.length - 1, timeCost: endTime - startTime };
    }
    closedSet.add(current);

    const neighbors = graph.get(current);
    for (const [neighborId, edgeData] of neighbors.entries()) {
        if (closedSet.has(neighborId)) continue;
        if (!openSet.items.includes(neighborId)) {
            cameFrom.set(neighborId, current);
            openSet.enqueue(neighborId);
        }
    }

    console.warn(`⚠️ Không tìm thấy đường đi từ ${startId} đến ${goalId} sau ${iterations} vòng lặp.`);
    return null;
}


module.exports = {
    name: 'bfs',
    findPath: bfs,
};