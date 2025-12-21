const { haversineDistance } = require('../utils/geo');
const { performance } = require('perf_hooks');

/**
 * PriorityQueue đơn giản cho A*
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    // ========== Helper ==========
    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    left(i) {
        return 2 * i + 1;
    }

    right(i) {
        return 2 * i + 2;
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // ========== Enqueue ==========
    enqueue(item, priority) {
        const node = { item, priority };
        this.heap.push(node);
        this.heapifyUp(this.heap.length - 1);
    }

    heapifyUp(index) {
        let current = index;

        while (
            current > 0 &&
            this.heap[current].priority < this.heap[this.parent(current)].priority
        ) {
            this.swap(current, this.parent(current));
            current = this.parent(current);
        }
    }

    // ========== Dequeue ==========
    dequeue() {
        if (this.isEmpty()) return null;

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);

        return root;
    }

    heapifyDown(index) {
        let smallest = index;
        const left = this.left(index);
        const right = this.right(index);

        if (
            left < this.heap.length &&
            this.heap[left].priority < this.heap[smallest].priority
        ) {
            smallest = left;
        }

        if (
            right < this.heap.length &&
            this.heap[right].priority < this.heap[smallest].priority
        ) {
            smallest = right;
        }

        if (smallest !== index) {
            this.swap(index, smallest);
            this.heapifyDown(smallest);
        }
    }

    // ========== Utils ==========
    isEmpty() {
        return this.heap.length === 0;
    }

    peek() {
        return this.heap[0] || null;
    }
}


/**
 * Thuật toán A* tìm đường ngắn nhất giữa 2 node
 * @param {Map<string, Object>} nodes - Map chứa node.id → { lat, lon }
 * @param {Map<string, Map<string, Object>>} graph - Map<NodeId, Map<NeighborId, EdgeData>>
 * @param {string} startId - ID node bắt đầu
 * @param {string} goalId - ID node đích
 * @returns {Object | null} Kết quả tìm kiếm
 */
function aStar(nodes, graph, startId, goalId) {
    const startTime = performance.now();
    if (!graph.has(startId) || !graph.has(goalId)) {
        console.warn(`⚠️ Node không tồn tại trong graph: ${startId} hoặc ${goalId}`);
        return null;
    }

    if (startId === goalId) {
        console.log(`✅ A* bắt đầu và kết thúc tại cùng 1 node: ${startId}`);
        return { path: [startId], steps: 0 };
    }

    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map(); // Chi phí thực tế đã đi (distance)
    const orderSet = []; // Chứa thứ tự các node đã được thêm vào closedSet

    gScore.set(startId, 0);

    const goalNode = nodes.get(goalId);
    const startNode = nodes.get(startId);

    // Heuristic ban đầu
    const initialH = haversineDistance(startNode.lat, startNode.lon, goalNode.lat, goalNode.lon);
    openSet.enqueue(startId, initialH);

    let iterations = 0;
    const maxIterations = 150000;

    while (!openSet.isEmpty() && iterations < maxIterations) {
        iterations++;
        const { item: current } = openSet.dequeue();
        orderSet.push(nodes.get(current));

        if (current === goalId) {
            // ✅ reconstruct path
            const path = [current];
            let temp = current;
            let totalDistance = 0;
            
            
            // Tính tổng quãng đường khi reconstruct path
            while (cameFrom.has(temp)) {
                const prev = cameFrom.get(temp);
                const edgeData = graph.get(prev).get(temp); // Lấy edge giữa prev và temp
                totalDistance += edgeData.distance; // Tổng khoảng cách (km)
                temp = prev;
                path.unshift(temp);
            }
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            
            console.log(`✅ A* tìm thấy đường sau ${iterations} bước`);
            return {
                path: path,
                steps: path.length - 1,
                distance: totalDistance, // Trả về tổng khoảng cách
                elapsedTime: elapsedTime, // Thời gian thực thi thuật toán (ms)
                orderSet: orderSet, // Thứ tự các node đã được xử lý
            };
        }

        closedSet.add(current);

        const neighborsMap = graph.get(current) || new Map();
        
        //Lặp qua Map các cạnh đi ra
        for (const [neighborId, edgeData] of neighborsMap.entries()) { 
            if (closedSet.has(neighborId)) continue;

            //Dùng khoảng cách (distance) làm chi phí
            const costToNeighbor = edgeData.distance; 

            const tentativeG = gScore.get(current) + costToNeighbor;

            if (!gScore.has(neighborId) || tentativeG < gScore.get(neighborId)) {
                cameFrom.set(neighborId, current);
                gScore.set(neighborId, tentativeG);

                const neighborNode = nodes.get(neighborId);
                if (!neighborNode) continue;

                // Heuristic (h) vẫn dùng khoảng cách (haversineDistance)
                const h = haversineDistance(neighborNode.lat, neighborNode.lon, goalNode.lat, goalNode.lon);
                const f = tentativeG + h; // f = g(distance) + h(distance)

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