const express = require('express');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS agar dapat diuji langsung melalui Hoppscotch / Bruno / Postman Web
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Root endpoint (melanjutkan struktur Tugas Pemweb 1)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Daftar Produk dengan Prisma ORM Berhasil Berjalan',
    endpoints: {
      getAll: 'GET /products',
      getById: 'GET /products/:id',
      create: 'POST /products',
      update: 'PUT /products',
      delete: 'DELETE /products/:id',
    },
  });
});

// Routes utama produk
app.use('/products', productRoutes);

// Handler error format JSON tidak valid
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: format JSON pada request body tidak valid',
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: err.message,
  });
});

// Handler 404 endpoint tidak ditemukan
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server aktif di http://localhost:${PORT}`);
  });
}

module.exports = app;
