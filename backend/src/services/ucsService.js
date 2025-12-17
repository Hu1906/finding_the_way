const { haversineDistance } = require('../utils/geo'); 
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
    enqueue(item, priority) {
        this.items.push({item, priority});
        // Sắp xếp theo priority (chi phí tích lũy gScore)
        this.items.sort((a, b) => a.priority - b.priority);
    }

}