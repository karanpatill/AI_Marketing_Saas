const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brandDNA.findFirst({
    where: {
      company_name: {
        contains: 'asenra',
        mode: 'insensitive'
      }
    }
  });
  console.log(brand);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
