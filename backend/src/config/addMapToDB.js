const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDB = require('./db.js');

async function importOSM() {
  try {
    // Kết nối MongoDB
    await connectDB();
    const db = mongoose.connection.db;

    // Xóa dữ liệu cũ
    const dropIfExists = async (name) => {
      const exists = await db.listCollections({ name }).toArray();
      if (exists.length) {
        await db.collection(name).drop();
        console.log(`Dropped existing collection: ${name}`);
      }
    };
    await dropIfExists('nodes');
    await dropIfExists('ways');
    await dropIfExists('edges');

    // Đọc và parse file OSM
    const xmlPath = path.join(__dirname, 'haibatrung.osm');
    const xmlData = fs.readFileSync(xmlPath, 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    const nodesCollection = db.collection('nodes');
    const waysCollection = db.collection('ways');
    const edgesCollection = db.collection('edges');

    // Import nodes
    let nodeMap = new Map(); // dùng để tra cứu nhanh
    if (result.osm && result.osm.node) {
      const nodeData = result.osm.node.map(node => {
        const lat = parseFloat(node.$.lat);
        const lon = parseFloat(node.$.lon);
        const id = node.$.id;
        nodeMap.set(id, { lat, lon }); // lưu tạm trong RAM
        return {
          id,
          lat,
          lon,
          loc: { type: 'Point', coordinates: [lon, lat] },
        };
      });

      if (nodeData.length) {
        await nodesCollection.insertMany(nodeData, { ordered: false });
        console.log(`Imported ${nodeData.length} nodes`);
      }
    } else {
      console.warn('⚠️ Không tìm thấy node nào trong file OSM!');
      return;
    }

    // Hàm tính khoảng cách Haversine (km)
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // bán kính Trái Đất (km)
      const toRad = deg => (deg * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Import ways và edges (tính trong RAM)
    const wayData = [];
    const edgeData = [];

    if (result.osm && result.osm.way) {
      for (const way of result.osm.way) {
        const nodeRefs = Array.isArray(way.nd) ? way.nd.map(nd => nd.$.ref) : [];

        // Tạo từng edge giữa các node liên tiếp
        for (let i = 0; i < nodeRefs.length - 1; i++) {
          const n1 = nodeMap.get(nodeRefs[i]);
          const n2 = nodeMap.get(nodeRefs[i + 1]);
          if (n1 && n2) {
            const dist = haversineDistance(n1.lat, n1.lon, n2.lat, n2.lon);
            edgeData.push({
              from: nodeRefs[i],
              to: nodeRefs[i + 1],
              distance: parseFloat(dist.toFixed(3)), // km
              wayId: way.$.id,
            });
          }
        }

        // Lưu thông tin way
        const tags = Array.isArray(way.tag)
          ? way.tag.reduce((acc, t) => {
              acc[t.$.k] = t.$.v;
              return acc;
            }, {})
          : {};

        wayData.push({
          id: way.$.id,
          nodes: nodeRefs,
          tags
        });
      }

      // Ghi vào MongoDB
      if (wayData.length) {
        await waysCollection.insertMany(wayData, { ordered: false });
        console.log(`Imported ${wayData.length} ways`);
      }

      if (edgeData.length) {
        await edgesCollection.insertMany(edgeData, { ordered: false });
        console.log(`Imported ${edgeData.length} edges`);
      }
    }

    // Tạo indexes
    await nodesCollection.createIndex({ id: 1 }, { unique: true, sparse: true });
    await nodesCollection.createIndex({ loc: "2dsphere" });
    await waysCollection.createIndex({ id: 1 }, { unique: true, sparse: true });
    await waysCollection.createIndex({ nodes: 1 });
    await edgesCollection.createIndex({ from: 1 });
    await edgesCollection.createIndex({ to: 1 });
    await edgesCollection.createIndex({ wayId: 1 });

    // Ngắt kết nối
    await mongoose.disconnect();
    console.log('✅ Import completed successfully!');
  } catch (err) {
    console.error('❌ Import failed:', err);
    try { await mongoose.disconnect(); } catch (_) {}
  }
}

importOSM();
