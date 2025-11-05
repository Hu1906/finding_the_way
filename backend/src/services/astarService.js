// src/services/astarService.js
const { haversineDistance } = require('../utils/geo');

/**
 * PriorityQueue đơn giản cho A*
 */
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

/**
 * Thuật toán A* tìm đường ngắn nhất giữa 2 node
 * @param {Map<string, Object>} nodes - Map chứa node.id → { lat, lon }
 * @param {Map<string, Array<{ to: string, distance: number }>>} graph - danh sách kề
 * @param {string} startId - ID node bắt đầu
 * @param {string} goalId - ID node đích
 * @returns {Array<string> | null} Danh sách nodeId tạo thành đường đi
 */
function aStar(nodes, graph, startId, goalId) {
  if (!graph.has(startId) || !graph.has(goalId)) {
    console.warn(`⚠️ Node không tồn tại trong graph: ${startId} hoặc ${goalId}`);
    return null;
  }

  if (startId === goalId) return [startId];

  const openSet = new PriorityQueue();
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();

  gScore.set(startId, 0);

  const goalNode = nodes.get(goalId);
  const startNode = nodes.get(startId);

  // Heuristic ban đầu
  const initialH = haversineDistance(startNode.lat, startNode.lon, goalNode.lat, goalNode.lon);
  openSet.enqueue(startId, initialH);

  let iterations = 0;
  const maxIterations = 200000;

  while (!openSet.isEmpty() && iterations < maxIterations) {
    iterations++;
    const { item: current } = openSet.dequeue();

    if (current === goalId) {
      // ✅ reconstruct path
      const path = [current];
      let temp = current;
      while (cameFrom.has(temp)) {
        temp = cameFrom.get(temp);
        path.unshift(temp);
      }
      console.log(`✅ A* tìm thấy đường sau ${iterations} bước`);
      return {
      path: path,
      steps: path.length - 1,
    };
    }

    closedSet.add(current);

    const neighbors = graph.get(current) || [];
    for (const { to, distance } of neighbors) {
      const neighborId = to;
      if (closedSet.has(neighborId)) continue;

      const tentativeG = gScore.get(current) + distance;

      if (!gScore.has(neighborId) || tentativeG < gScore.get(neighborId)) {
        cameFrom.set(neighborId, current);
        gScore.set(neighborId, tentativeG);

        const neighborNode = nodes.get(neighborId);
        if (!neighborNode) continue;

        const h = haversineDistance(neighborNode.lat, neighborNode.lon, goalNode.lat, goalNode.lon);
        const f = tentativeG + h;

        openSet.enqueue(neighborId, f);
      }
    }
  }

  console.warn(`❌ A* không tìm thấy đường sau ${iterations} bước`);
  return null;
}

module.exports = {
  name: 'astar',
  findPath: aStar,
};
