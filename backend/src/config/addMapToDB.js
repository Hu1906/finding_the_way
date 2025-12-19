const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const geo = require('../utils/geo.js');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('./db.js');

// Map tốc độ trung bình (km/h) cho từng loại đường
const HIGHWAY_SPEED_MAP = {
    'motorway': 80, 'trunk': 70, 'primary': 60, 'secondary': 50, 
    'tertiary': 40, 'unclassified': 30, 'residential': 30, 
    'service': 20, 'road': 30, 'living_street': 10,
    'primary_link': 60, 'secondary_link': 50, 'tertiary_link': 40
};
const getSpeed = (highwayType) => {
    return HIGHWAY_SPEED_MAP[highwayType] || 20; 
};

async function importOSM() {
    try {
        console.log('🚀 Starting OSM Import (FILTERED & COSTED)...');
        await connectDB();
        const db = mongoose.connection.db;

        // Xóa dữ liệu cũ
        const dropIfExists = async (name) => {
            const exists = await db.listCollections({ name }).toArray();
            if (exists.length) {
                await db.collection(name).drop();
                console.log(`✓ Dropped existing collection: ${name}`);
            }
        };
        await dropIfExists('nodes');
        await dropIfExists('ways');
        await dropIfExists('edges');
        console.log('');

        // Đọc file OSM và kiểm tra
        const xmlPath = path.join(__dirname, 'Hà Nội.osm');
        if (!fs.existsSync(xmlPath)) {
            console.error(`❌ File not found: ${xmlPath}`);
            process.exit(1);
        }

        const xmlData = fs.readFileSync(xmlPath, 'utf8');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const nodesCollection = db.collection('nodes');
        const waysCollection = db.collection('ways');
        const edgesCollection = db.collection('edges');

        const ALLOWED_HIGHWAY_TYPES = new Set(['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified', 'residential', 'living_street', 'service', 'road', 'primary_link', 'secondary_link', 'tertiary_link']);

        // BƯỚC 1: Thu thập TẤT CẢ nodes từ OSM
        console.log('📍 Step 1: Collecting all nodes...');
        let allNodesMap = new Map();
        if (result.osm && result.osm.node) {
            for (const node of result.osm.node) {
                const lat = parseFloat(node.$.lat);
                const lon = parseFloat(node.$.lon);
                allNodesMap.set(node.$.id, { lat, lon });
            }
            console.log(`✓ Found ${allNodesMap.size} total nodes in OSM file`);
        } else {
            console.error('❌ Không tìm thấy node nào trong file OSM!');
            return;
        }

        // BƯỚC 2: Filter ways, tạo edges 2 chiều, và tìm nodes được sử dụng
        console.log('\n🛣️  Step 2: Filtering ways and creating edges...');
        
        const usedNodesSet = new Set();
        const wayData = [];
        const edgeData = [];
        let totalWays = 0;
        let acceptedWays = 0;
        let skippedWays = 0;

        if (result.osm && result.osm.way) {
            for (const way of result.osm.way) {
                totalWays++;
                const nodeRefs = Array.isArray(way.nd) ? way.nd.map(nd => nd.$.ref) : [];
                
                const tags = Array.isArray(way.tag) ? way.tag.reduce((acc, t) => { acc[t.$.k] = t.$.v; return acc; }, {}) : {};
                const highwayType = tags.highway;
                
                // FILTER: Chỉ lấy đường được phép & bỏ qua đường không có quyền truy cập
                if (!highwayType || !ALLOWED_HIGHWAY_TYPES.has(highwayType) || tags.access === 'no' || tags.access === 'private') {
                    skippedWays++;
                    continue;
                }

                const isOneWay = tags.oneway === 'yes';

                if (nodeRefs.length < 2) { skippedWays++; continue; }
                acceptedWays++;

                // Đánh dấu nodes được sử dụng
                for (const nodeId of nodeRefs) { usedNodesSet.add(nodeId); }

                // Tạo edges
                for (let i = 0; i < nodeRefs.length - 1; i++) {
                    const n1 = allNodesMap.get(nodeRefs[i]);
                    const n2 = allNodesMap.get(nodeRefs[i + 1]);
                    const fromId = nodeRefs[i];
                    const toId = nodeRefs[i + 1];

                    if (n1 && n2) {
                        const dist = geo.haversineDistance(n1.lat, n1.lon, n2.lat, n2.lon);
                        const distance_km = parseFloat(dist.toFixed(3));
                        
                        if (dist < 0.001) continue;

                        // ✅ TÍNH TOÁN CHI PHÍ THỜI GIAN (COST)
                        const speed_kmh = getSpeed(highwayType); 
                        const time_cost = distance_km / speed_kmh; 
                        
                        // a) Cạnh thuận (A -> B)
                        const forwardEdge = {
                            from: fromId, to: toId, distance: distance_km, cost: time_cost, wayId: way.$.id, type: highwayType
                        };
                        edgeData.push(forwardEdge);

                        // b) CẠNH NGƯỢC (B -> A) nếu không phải đường một chiều
                        if (!isOneWay) { 
                            const backwardEdge = {
                                from: toId, to: fromId, distance: distance_km, cost: time_cost, wayId: way.$.id, type: highwayType
                            };
                            edgeData.push(backwardEdge);
                        }
                    }
                }
                wayData.push({ id: way.$.id, nodes: nodeRefs, tags });
            }

            console.log(`✓ Accepted ways: ${acceptedWays} / ${totalWays}`);
        }

        // BƯỚC 3: Chỉ import nodes được sử dụng
        console.log(`\n📍 Step 3: Importing ${usedNodesSet.size} used nodes...`);
        const nodeData = [];
        for (const nodeId of usedNodesSet) {
            const node = allNodesMap.get(nodeId);
            if (node) { nodeData.push({ id: nodeId, lat: node.lat, lon: node.lon, loc: { type: 'Point', coordinates: [node.lon, node.lat] } }); }
        }
        if (nodeData.length) {
            await nodesCollection.insertMany(nodeData, { ordered: false });
            console.log(`✓ Imported ${nodeData.length} nodes`);
        }

        // BƯỚC 4: Import ways và edges
        console.log('\n🛣️  Step 4: Importing ways and edges...');
        if (wayData.length) { await waysCollection.insertMany(wayData, { ordered: false }); console.log(`✓ Imported ${wayData.length} ways`); }
        if (edgeData.length) { await edgesCollection.insertMany(edgeData, { ordered: false }); console.log(`✓ Imported ${edgeData.length} edges`); }

        // BƯỚC 5: Tạo indexes
        console.log('\n🔧 Step 5: Creating indexes...');
        await nodesCollection.createIndex({ id: 1 }, { unique: true, sparse: true });
        await nodesCollection.createIndex({ loc: "2dsphere" });
        await waysCollection.createIndex({ id: 1 }, { unique: true, sparse: true });
        await waysCollection.createIndex({ nodes: 1 });
        await edgesCollection.createIndex({ from: 1 });
        await edgesCollection.createIndex({ to: 1 });
        await edgesCollection.createIndex({ wayId: 1 });
        console.log('✓ Indexes created');

        // Thống kê
        console.log('\n📊 Import Summary:');
        console.log(`  Nodes (used): ${nodeData.length}`);
        console.log(`  Edges: ${edgeData.length}`);

        await mongoose.disconnect();
        console.log('\n✅ Import completed successfully!');
    } catch (err) {
        console.error('❌ Import failed:', err);
        try { await mongoose.disconnect(); } catch (_) {}
        process.exit(1);
    }
}

importOSM();