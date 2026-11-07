const prisma = require('../lib/prisma');

// Helper validasi field produk (name, price, stock)
const validateProductPayload = ({ name, price, stock }) => {
  if (name === undefined || name === null || price === undefined || price === null || stock === undefined || stock === null) {
    return 'Validasi gagal: field name, price, dan stock wajib diisi';
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return 'Validasi gagal: name harus berupa teks (string) dan tidak boleh kosong';
  }

  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 'Validasi gagal: price harus berupa angka';
  }

  if (price < 0) {
    return 'Validasi gagal: price tidak boleh bernilai negatif';
  }

  if (typeof stock !== 'number' || !Number.isInteger(stock)) {
    return 'Validasi gagal: stock harus berupa bilangan bulat (integer)';
  }

  if (stock < 0) {
    return 'Validasi gagal: stock tidak boleh bernilai negatif';
  }

  return null;
};

// Helper validasi ID produk
const parseValidId = (rawId) => {
  if (rawId === undefined || rawId === null || rawId === '' || typeof rawId === 'boolean') {
    return null;
  }
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return NaN;
  }
  return parsed;
};

// 1. GET: Menampilkan seluruh data produk
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil menampilkan seluruh data produk',
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// GET berdasarkan ID (melanjutkan fitur tugas sebelumnya)
const getProductById = async (req, res) => {
  const parsedId = parseValidId(req.params.id);

  if (parsedId === null || Number.isNaN(parsedId)) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: parameter id harus berupa bilangan bulat positif',
    });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Data produk dengan ID ${parsedId} tidak ditemukan`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil menampilkan detail produk',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// 2. POST: Membuat data produk baru
const createProduct = async (req, res) => {
  const { name, price, stock } = req.body || {};

  const validationError = validateProductPayload({ name, price, stock });
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price,
        stock,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Data produk berhasil dibuat',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// 3. PUT: Mengupdate data yang sudah ada (body sama dengan POST namun ada tambahan id)
const updateProduct = async (req, res) => {
  const body = req.body || {};
  const rawId = body.id !== undefined ? body.id : req.params.id;
  const { name, price, stock } = body;

  const parsedId = parseValidId(rawId);
  if (parsedId === null) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: id wajib disertakan pada body',
    });
  }

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: id harus berupa bilangan bulat positif',
    });
  }

  const validationError = validateProductPayload({ name, price, stock });
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Data produk dengan ID ${parsedId} tidak ditemukan`,
      });
    }

    const updated = await prisma.product.update({
      where: { id: parsedId },
      data: {
        name: name.trim(),
        price,
        stock,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Data produk berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// 4. DELETE: Menghapus data yang sudah ada (berdasarkan id)
const deleteProduct = async (req, res) => {
  const rawId = req.params.id !== undefined ? req.params.id : (req.body && req.body.id);
  const parsedId = parseValidId(rawId);

  if (parsedId === null) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: id wajib disertakan',
    });
  }

  if (Number.isNaN(parsedId)) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: id harus berupa bilangan bulat positif',
    });
  }

  try {
    const existing = await prisma.product.findUnique({
      where: { id: parsedId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Data produk dengan ID ${parsedId} tidak ditemukan`,
      });
    }

    const deleted = await prisma.product.delete({
      where: { id: parsedId },
    });

    return res.status(200).json({
      success: true,
      message: `Data produk dengan ID ${parsedId} berhasil dihapus`,
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
