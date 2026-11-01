import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const plan = await prisma.plans.create({
    data: {
      name: 'Pro',
      features: { "maxFileSize": 50000000 }
    }
  });

  const org = await prisma.organizations.create({
    data: {
      name: 'Default Org'
    }
  });

  const user = await prisma.users.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User'
    }
  });

  await prisma.organization_members.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      role: 'ADMIN'
    }
  });

  console.log('Seed successful');
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
