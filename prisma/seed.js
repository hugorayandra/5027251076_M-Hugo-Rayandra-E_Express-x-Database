const prisma = require('../lib/prisma');

async function main() {
  await prisma.product.deleteMany();
  await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = 'Product';`);

  const initialProducts = [
    { name: 'Buku Tulis Campus', price: 15000, stock: 40 },
    { name: 'Pulpen Pilot Hitam', price: 5000, stock: 100 },
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
