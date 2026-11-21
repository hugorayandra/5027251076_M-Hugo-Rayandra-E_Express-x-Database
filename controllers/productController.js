const prisma = require('../lib/prisma');

// Helper validasi field produk (name, price, stock opsional dengan default 0)
const validateProductPayload = ({ name, price, stock = 0 }) => {
  if (name === undefined || name === null || price === undefined || price === null) {
    return 'Validasi gagal: field name dan price wajib diisi';
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return 'Validasi gagal: name harus berupa teks (string) dan tidak boleh kosong';
  }

  const numericPrice = typeof price === 'string' && price.trim() !== '' ? Number(price) : price;
  if (typeof numericPrice !== 'number' || !Number.isFinite(numericPrice)) {
    return 'Validasi gagal: price harus berupa angka';
  }

  if (numericPrice <= 0) {
    return 'Validasi gagal: price harus lebih dari 0';
  }

  const numericStock = stock === undefined || stock === null || stock === '' ? 0 : (typeof stock === 'string' ? Number(stock) : stock);
  if (typeof numericStock !== 'number' || !Number.isInteger(numericStock)) {
    return 'Validasi gagal: stock harus berupa bilangan bulat (integer)';
  }

  if (numericStock < 0) {
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

  const normalizedPrice = Number(price);
  const normalizedStock = stock === undefined || stock === null || stock === '' ? 0 : Number(stock);

  try {
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: normalizedPrice,
        stock: normalizedStock,
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

// 3. PUT: Mengupdate data yang sudah ada (id dapat dikirim melalui URL parameter :id atau body)
const updateProduct = async (req, res) => {
  const body = req.body || {};
  const rawId = body.id !== undefined ? body.id : req.params.id;
  const { name, price, stock } = body;

  const parsedId = parseValidId(rawId);
  if (parsedId === null) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal: id wajib disertakan pada parameter URL atau body',
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

  const normalizedPrice = Number(price);

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

    const normalizedStock =
      stock === undefined || stock === null || stock === ''
        ? existing.stock
        : Number(stock);

    const updated = await prisma.product.update({
      where: { id: parsedId },
      data: {
        name: name.trim(),
        price: normalizedPrice,
        stock: normalizedStock,
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
