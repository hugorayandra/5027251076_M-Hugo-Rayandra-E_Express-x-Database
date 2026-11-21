const prisma = require('../lib/prisma');

async function main() {
  await prisma.product.deleteMany();
  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = 'Product';`);

  const initialProducts = [
    { name: 'Pulpen', price: 5000, stock: 100 },
    { name: 'Buku Tulis', price: 12000, stock: 45 },
    { name: 'Spidol', price: 8000, stock: 60 },
    { name: 'Penggaris', price: 6000, stock: 50 },
    { name: 'Penghapus', price: 3000, stock: 80 },
  ];

  for (const item of initialProducts) {
    await prisma.product.create({ data: item });
  }

  console.log('Seed data produk awal berhasil dijalankan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
