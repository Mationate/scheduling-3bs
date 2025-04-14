const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Eliminando todos los bookings...')

  await prisma.booking.deleteMany({})

  console.log('Todos los bookings han sido eliminados')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 