# 🗺️ Pathfinding Visualization - Hà Nội

Một ứng dụng web trực quan hóa các thuật toán tìm đường trên bản đồ thực tế của Hà Nội. Được xây dựng với MERN stack và sử dụng dữ liệu từ OpenStreetMap.

**Môn học:** IT3160 - Trí tuệ nhân tạo  
**Trường:** Đại học Bách Khoa Hà Nội (HUST)

![Preview](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.0-green.svg)

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Các thuật toán](#-các-thuật-toán)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Thuật toán chi tiết](#-thuật-toán-chi-tiết)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Giới thiệu

Dự án này cung cấp một giao diện trực quan để so sánh hiệu suất của các thuật toán tìm đường khác nhau trên bản đồ thực tế. Người dùng có thể:

- Chọn hai điểm bất kỳ trên bản đồ Hai Bà Trưng, Hà Nội
- So sánh 6 thuật toán tìm đường khác nhau
- Xem trực quan quá trình tìm kiếm của thuật toán
- Đánh giá hiệu suất dựa trên khoảng cách, thời gian thực thi và số bước

---

## ✨ Tính năng

### 🗺️ Bản đồ tương tác
- Sử dụng Leaflet.js và OpenStreetMap
- Chọn điểm bắt đầu và kết thúc bằng cách click trên bản đồ
- Hiển thị marker tùy chỉnh cho điểm A và B

### 🔍 Thuật toán đa dạng
- **6 thuật toán tìm đường:** A*, Dijkstra, Greedy Best-First Search, UCS, BFS, DFS
- So sánh hiệu suất theo thời gian thực
- Hiển thị các node đã thăm trong quá trình tìm kiếm

### 📊 Thông tin chi tiết
- Khoảng cách tối ưu (km)
- Thời gian di chuyển ước tính
- Thời gian thực thi thuật toán (ms)
- Số bước (nodes) đã xử lý

### ⚡ Hiệu suất cao
- Graph được load vào RAM để truy cập nhanh
- Rate limiting để bảo vệ server
- Tối ưu hóa thuật toán với Priority Queue

---

## 🧮 Các thuật toán

| Thuật toán | Mô tả | Độ phức tạp | Tối ưu? |
|------------|-------|-------------|---------|
| **A*** | Sử dụng heuristic (khoảng cách Haversine) để tìm đường ngắn nhất | O((V+E)log V) | ✅ Có |
| **Dijkstra** | Tìm đường ngắn nhất dựa trên chi phí thực tế | O((V+E)log V) | ✅ Có |
| **Greedy Best-First** | Ưu tiên node gần đích nhất (chỉ dùng heuristic) | O((V+E)log V) | ❌ Không |
| **UCS** | Tìm đường với chi phí thấp nhất | O((V+E)log V) | ✅ Có |
| **BFS** | Tìm kiếm theo chiều rộng | O(V+E) | ❌ Không |
| **DFS** | Tìm kiếm theo chiều sâu | O(V+E) | ❌ Không |

> **Lưu ý:** Các thuật toán sử dụng chi phí dựa trên khoảng cách di chuyển.

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **xml2js** - Parse OSM data

### Frontend
- **React** - UI library
- **Leaflet.js** - Interactive maps
- **Ant Design** - UI components
- **Axios** - HTTP client
- **Lucide React** - Icons

### Dữ liệu
- **OpenStreetMap** - Map data source
- Khu vực: Thành phố Hà Nội

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 14.0.0
- **MongoDB** >= 4.0
- **npm** hoặc **yarn**

### Các bước cài đặt

#### 1. Clone repository

```bash
git clone <repository-url>
cd my-mern-app
```

#### 2. Cài đặt dependencies cho Backend

```bash
cd backend
npm install
```

#### 3. Cài đặt dependencies cho Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Cấu hình

### 1. Tạo file `.env` trong thư mục `backend`

```env
DATABASE_URL=[***YOUR URL STRING***]
PORT=5000
NODE_ENV=development
```

### 2. Import dữ liệu bản đồ vào MongoDB

Nếu database của bạn chưa có dữ liệu:

```bash
cd backend/src/config
node addMapToDB.js
```

**Quá trình import sẽ:**
- Đọc file `Hà Nội.osm`
- Lọc các loại đường được phép
- Tạo graph hai chiều với chi phí dựa trên tốc độ
- Tạo indexes để tối ưu hóa truy vấn
- Thời gian: ~2-5 phút tùy kích thước dữ liệu

---

## 🚀 Sử dụng

### Chạy môi trường Development

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

#### Terminal 2: Frontend Application

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`
---

## 📁 Cấu trúc dự án

```
my-mern-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── addMapToDB.js      # Import OSM data
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── Hà Nội.osm         # OSM data file
│   │   ├── controllers/
│   │   │   └── routeController.js # Route logic
│   │   ├── models/
│   │   │   ├── nodeModel.js       # Node schema
│   │   │   ├── wayModel.js        # Way schema
│   │   │   └── edgeModel.js       # Edge schema
│   │   ├── routes/
│   │   │   └── routeRoutes.js     # API endpoints
│   │   ├── services/
│   │   │   ├── algorithmManager.js    # Algorithm registry
│   │   │   ├── astarService.js        # A* implementation
│   │   │   ├── dijkstraService.js     # Dijkstra implementation
│   │   │   ├── greedyBestFirstSearchService.js
│   │   │   ├── ucsService.js          # UCS implementation
│   │   │   ├── bfsService.js          # BFS implementation
│   │   │   ├── dfsService.js          # DFS implementation
│   │   │   └── graphLoader.js         # Load graph to RAM
│   │   ├── middleware/
│   │   │   └── rateLimiter.js     # Rate limiting
│   │   ├── utils/
│   │   │   └── geo.js             # Geographic calculations
│   │   └── server.js              # Express app entry
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/               # Map component
│   │   │   ├── Controls/          # Control buttons
│   │   │   ├── RouteInfo/         # Route information display
│   │   │   └── AlgorithmSelector/ # Algorithm selection
│   │   ├── hooks/
│   │   │   └── useMap.js          # Map logic hook
│   │   ├── services/
│   │   │   ├── mapService.js      # Leaflet operations
│   │   │   └── routeService.js    # API calls
│   │   ├── utils/
│   │   │   ├── constants.js       # Constants
│   │   │   └── helpers.js         # Helper functions
│   │   ├── App.js                 # Main component
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
├── package.json                    # Root package
└── README.md
```

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Endpoints

#### 1. Tìm đường

**POST** `/route`

**Request Body:**

```json
{
  "start": {
    "lat": 21.0122,
    "lng": 105.8522
  },
  "end": {
    "lat": 21.0200,
    "lng": 105.8600
  },
  "algorithm": "astar"
}
```

**Response:**

```json
{
  "success": true,
  "algorithm": "astar",
  "path": [[21.0122, 105.8522], ...],
  "distance": 1500.5,
  "duration": 180,
  "elapsedTime": 12.345,
  "steps": 45,
  "orderSet": [...],
  "startPoint": {"lat": 21.0122, "lon": 105.8522},
  "endPoint": {"lat": 21.0200, "lon": 105.8600}
}
```

#### 2. Lấy danh sách thuật toán

**GET** `/algorithms`

**Response:**

```json
{
  "availableAlgorithms": [
    "astar",
    "dijkstra",
    "greedyBestFirstSearch",
    "ucs",
    "bfs",
    "dfs"
  ]
}
```

#### 3. Reload graph

**POST** `/reload`

**Response:**

```json
{
  "message": "Graph reloaded successfully"
}
```

#### 4. Thống kê graph

**GET** `/graph-stats`

**Response:**

```json
{
  "totalNodes": 15000,
  "connectedNodes": 14850,
  "isolatedNodes": 150,
  "totalEdges": 35000,
  "graphLoaded": true
}
```

---

## 🔬 Thuật toán chi tiết

### A* Algorithm

**Đặc điểm:**
- Sử dụng heuristic h(n) = khoảng cách Haversine đến đích
- Chi phí g(n) = tổng khoảng cách đã đi
- f(n) = g(n) + h(n)

**Implementation:**

```javascript
// Priority Queue với f(n) = g(n) + h(n)
const f = tentativeG + haversineDistance(neighbor, goal);
openSet.enqueue(neighborId, f);
```

### Dijkstra Algorithm

**Đặc điểm:**
- Không sử dụng heuristic
- Chi phí dựa trên khoảng cách đã đi
- Đảm bảo đường đi ngắn nhất


### Greedy Best-First Search

**Đặc điểm:**
- Chỉ sử dụng heuristic h(n)
- Nhanh nhưng không đảm bảo tối ưu
- Priority = h(n)

---

## 🎮 Hướng dẫn sử dụng

### Bước 1: Chọn điểm bắt đầu (A)

1. Click nút **"Chọn điểm A"**
2. Click vào một vị trí trên bản đồ
3. Marker màu xanh lá sẽ xuất hiện

### Bước 2: Chọn điểm kết thúc (B)

1. Click nút **"Chọn điểm B"**
2. Click vào vị trí khác trên bản đồ
3. Marker màu đỏ sẽ xuất hiện

### Bước 3: Chọn thuật toán

Chọn một trong 6 thuật toán có sẵn

### Bước 4: Tìm đường

1. Click nút **"Tìm đường"**
2. Xem quá trình tìm kiếm (nếu bật "Hiển thị các điểm đã thăm")
3. Đường đi tối ưu sẽ được hiển thị màu xanh dương

### Bước 5: Xem kết quả

Kiểm tra thông tin:
- Khoảng cách (km)
- Thời gian di chuyển ước tính
- Thời gian thực thi thuật toán

---

## 🐛 Debug & Troubleshooting

### MongoDB Connection Error

```bash
Error: MongoDB connection failed
```

**Giải pháp:**
- Kiểm tra MongoDB đang chạy: `sudo systemctl status mongod`
- Khởi động MongoDB: `sudo systemctl start mongod`
- Kiểm tra DATABASE_URL trong `.env`

### Graph không load được

```bash
Error: Graph not loaded
```

**Giải pháp:**
- Chạy lại import: `node backend/src/config/addMapToDB.js`
- Restart backend server

### Frontend không kết nối được backend

**Giải pháp:**
- Kiểm tra proxy trong `frontend/package.json`:
  ```json
  "proxy": "http://localhost:5000"
  ```
- Restart cả frontend và backend

---

## 🧪 Testing

### Kiểm tra chất lượng Graph

```bash
cd backend
node src/scripts/checkGraph.js
```

Output sẽ hiển thị:
- Tổng số nodes và edges
- Số nodes connected/isolated
- Phân bố degree
- Connected components
- Sample nodes để test

---

## 📊 Performance Optimization

### Backend
- ✅ Graph được load vào RAM khi khởi động
- ✅ Sử dụng Map thay vì Object để truy cập O(1)
- ✅ Priority Queue với Binary Heap
- ✅ Rate limiting (40 requests/phút)

### Frontend
- ✅ React hooks để tối ưu re-render
- ✅ Lazy loading cho map layers
- ✅ Debouncing cho user interactions

---

## 🤝 Contributing

Contributions are welcome! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📝 License

Dự án này được phát triển cho mục đích học tập tại IT3160 - HUST.

---

## 👥 Contributors

- **Nguyễn Hồng Dương** - 20235059
- Email: tthhvtlls1wl@gmail.com

- **Phạm Thu Hà** - 20235070
- Email: 

- **Nguyễn Kim Huy** - 20235106
- Email: nkhuy05@gmail.com

- **Nguyễn Ngọc Khánh** - 20230041
- Email: kvk5.19072005@gmail.com
---

## 📚 Tài liệu tham khảo

- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [A* Algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm)
- [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)

---

## 🎓 Acknowledgments

- Môn học IT3160 - Trí tuệ nhân tạo
- Trường Đại học Bách Khoa Hà Nội (HUST)
- OpenStreetMap contributors
- Leaflet.js community

---

**Ngày cập nhật:** December 2024  
**Phiên bản:** 1.0.0