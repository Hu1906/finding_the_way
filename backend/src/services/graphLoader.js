const Node = require('../models/nodeModel');
const Edge = require('../models/edgeModel');

class GraphLoader {
    constructor (){
        this.graph = new Map();
        this.nodes = new Map();
    }

    async loadAll(){
        const [nodes, edges] = await Promise.all([
            Node.find({}).lean(),
            Edge.find({}).lean()
        ]);

        for (const n of nodes) { this.nodes.set(n.id, n); }
        for (const e of edges) {
            if (!this.graph.has(e.from)) {
                this.graph.set(e.from, []);
            }
            if (!this.graph.has(e.to)) {
                this.graph.set(e.to, []);
            }
            this.graph.get(e.from).push({ to: e.to, distance: e.distance });
            this.graph.get(e.to).push({ to: e.from, distance: e.distance });
        }
        console.log(`Graph loaded: ${this.nodes.size} nodes, ${edges.length} edges.`);

    }

    isLoaded() {
        return this.graph.size > 0;
    }

    async getGraph() {
        return {
            nodes: this.nodes,
            graph: this.graph
        };
    }

    async nodeTranfers(lat, lon) {
        let closestNode = null;
        let minDistance = Infinity;
        for (const [id, node] of this.nodes) {
            const distance = Math.sqrt(Math.pow(node.lat - lat, 2) + Math.pow(node.lon - lon, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = id;
            }
        }
        return closestNode;
    }

    async tranferNode(nodeId) {
        return { lat: this.nodes.get(nodeId).lat, lon: this.nodes.get(nodeId).lon };
    }
}

module.exports =  new GraphLoader();