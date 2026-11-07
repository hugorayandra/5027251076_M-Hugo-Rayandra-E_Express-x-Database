const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// GET: Menampilkan seluruh data produk
router.get('/', getAllProducts);

// GET: Menampilkan detail produk berdasarkan ID
router.get('/:id', getProductById);

// POST: Membuat data produk baru
router.post('/', createProduct);

// PUT: Mengupdate data produk yang sudah ada (id pada body)
router.put('/', updateProduct);
router.put('/:id', updateProduct);

// DELETE: Menghapus data produk berdasarkan id
router.delete('/:id', deleteProduct);
router.delete('/', deleteProduct);

module.exports = router;
