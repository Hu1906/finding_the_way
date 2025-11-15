const algorithmManager = require('../services/algorithmManager');
const graphLoader = require('../services/graphLoader');

/**
 * POST /api/route
 * Body: { startlat, startlon, goallat, goallon, algorithm }
 */
exports.findRoute = async (req, res) => {
  try {
    const { startlat, startlon, goallat, goallon, algorithm } = req.body;
    console.log('findRoute called with:', req.body);
    // 1️⃣ Kiểm tra đầu vào
    if (!startlat || !startlon || !goallat || !goallon) {
      return res.status(400).json({ error: 'Thiếu startlat, startlon, goallat hoặc goallon' });
    }

    // 2️⃣ Đảm bảo graph đã load vào RAM
    if (!graphLoader.isLoaded()) {
      await graphLoader.loadAll();
    }

    const startId = await graphLoader.nodeTranfers(startlat, startlon);
    const goalId = await graphLoader.nodeTranfers(goallat, goallon);

    // 3️⃣ Kiểm tra tồn tại node trong graph
    const { nodes, graph } = await graphLoader.getGraph();
    if (!graph.has(startId) || !graph.has(goalId)) {
      return res.status(404).json({ error: 'Không tìm thấy node tương ứng trong graph' });
    }

    // 4️⃣ Lấy thuật toán (mặc định A*)
    const algo = algorithm || 'astar';
    const routeFinder = algorithmManager.get(algo);
    if (!routeFinder) {
      return res.status(400).json({ error: `Thuật toán '${algo}' không tồn tại` });
    }

    // 5️⃣ Chạy thuật toán tìm đường
    const result = await algorithmManager.run(algo, { nodes, graph, startId, goalId });

    // 6️⃣ Trả kết quả về client
    if (!result || !result.path) {
      return res.status(404).json({ error: 'Không tìm thấy đường đi khả thi' });
    }
    const detailedPath = [];
    for (const nodeId of result.path) {
      const coord = await graphLoader.tranferNode(nodeId);
      detailedPath.push({ lat: coord.lat, lon: coord.lon });
    }
    return res.status(200).json({
      algorithm: algo,
      path: detailedPath,
      steps: result.steps,
    });
  } catch (err) {
    console.error('findRoute error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
};


/**
 * @desc API liệt kê các thuật toán đang hỗ trợ
 * @route GET /api/algorithms
 */
exports.listAlgorithms = (req, res) => {
  try {
    const list = algorithmManager.list();
    res.json({ availableAlgorithms: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc API reload lại dữ liệu graph (nếu dữ liệu MongoDB có thay đổi)
 * @route POST /api/reload
 */
exports.reloadGraph = async (req, res) => {
  try {
    await graphLoader.loadAll();
    res.json({ message: 'Graph reloaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
