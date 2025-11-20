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
 * {Map<string, Object>} nodes - Map chứa node.id → { lat, lon }
 * {Map<string, Map<string, Object>>} graph - Map<NodeId, Map<NeighborId, EdgeData>>
 * {string} startId - ID node bắt đầu
 * {string} goalId - ID node đích
 * {Object | null} Kết quả tìm kiếm
 */
function aStar(nodes, graph, startId, goalId) {
  if (!graph.has(startId) || !graph.has(goalId)) {
    console.warn(`⚠️ Node không tồn tại trong graph: ${startId} hoặc ${goalId}`);
    return null;
  }

  if (startId === goalId) return { path: [startId], steps: 0 };

  const openSet = new PriorityQueue();
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map(); // Chi phí thực tế đã đi (dùng COST - Time)

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
      let totalDistance = 0;

      //Tính tổng quãng đường khi reconstruct path
      while (cameFrom.has(temp)) {
        const prev = cameFrom.get(temp);
        const edgeData = graph.get(prev).get(temp); //Lấy edge giữa prev và temp
        totalDistance += edgeData.distance; //Tính tổng khoảng cách
        temp = prev;
        path.unshift(temp);
      }

      console.log(`✅ A* tìm thấy đường sau ${iterations} bước`);
      return {
                path: path,
                steps: path.length - 1,
                distance: totalDistance, // Trả về tổng khoảng cách
                timeCost: gScore.get(goalId), // Trả về tổng thời gian (cost)
      };
    }

    closedSet.add(current);

    const neighbors = graph.get(current) || new Map();

    // Duyệt qua từng neighbor
    for (const [neighborId, { distance }] of neighborsMap.entries()) {
      
      
      if (closedSet.has(neighborId)) continue;

      const costToNeighbor = edgeData.distance; // Chi phí để đi đến neighbor
      const tentativeG = gScore.get(current) + costToNeighbor;

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
