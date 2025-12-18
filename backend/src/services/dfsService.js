const { performance } = require('perf_hooks');

class Stack {
    constructor() {
        this.items = [];
    }
    push(item) {
        this.items.push(item);
    }
    pop() {
        return this.items.pop();
    }
    isEmpty() {
        return this.items.length === 0;
    }
}
function dfs(nodes, graph, startId, goalId) {
    const startTime = performance.now();
    if (!graph.has(startId) || !graph.has(goalId)) {
        console.warn(`⚠️ Node không tồn tại trong graph: ${startId} hoặc ${goalId}`);
        return null;
    }

    if (startId === goalId) return { path: [startId], steps: 0, distance: 0, elapsedTime: 0 };

    const openSet = new Stack();
    const visited = new Set();
    const cameFrom = new Map();

    openSet.push(startId);
    visited.add(startId);

    let iterations = 0;
    const maxIterations = 200000;

    while (!openSet.isEmpty() && iterations < maxIterations) {
        iterations++;
        const current = openSet.pop();

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
            console.log(`✅ DFS tìm thấy đường đi từ ${startId} đến ${goalId} sau ${iterations} bước`);
            return { path, steps: path.length - 1, distance: totalDistance, elapsedTime };
        }

        const neighbors = graph.get(current) || new Map();
        for (const [neighborId] of neighbors.entries()) {
            if (visited.has(neighborId)) continue;
            visited.add(neighborId);
            cameFrom.set(neighborId, current);
            openSet.push(neighborId);
        }
    }

    console.warn(`⚠️ Không tìm thấy đường đi từ ${startId} đến ${goalId} sau ${iterations} vòng lặp.`);
    return null;
}


module.exports = {
    name: 'dfs',
    findPath: dfs,
};