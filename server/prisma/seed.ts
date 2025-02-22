import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.relationType.createMany({
    data: [
      {
        type: 'RENT'
      },
      {
        type: 'SELL'
      }
    ],
    skipDuplicates: true
  });

  await prisma.propertyType.createMany({
    data: [
      {
        type: 'APARTMENT'
      },
      {
        type: 'HOUSE'
      }
    ],
    skipDuplicates: true
  });

  await prisma.propertyFurniture.createMany({
    data: [
      {
        type: 'EQUIPPED_KITCHEN_AND_FURNISHED_HOUSE'
      },
      {
        type: 'EQUIPPED_KITCHEN_AND_UNFURNISHED_HOUSE'
      },
      {
        type: 'UNEQUIPPED_KITCHEN_AND_UNFURNISHED_HOUSE'
      }
    ],
    skipDuplicates: true
  });

  await prisma.contactPreference.createMany({
    data: [
      {
        type: 'ALL'
      },
      {
        type: 'JUST_CHAT'
      },
      {
        type: 'JUST_PHONE'
      }
    ],
    skipDuplicates: true
  });

  await prisma.propertyCondition.createMany({
    data: [
      {
        type: 'GOOD'
      },
      {
        type: 'NEEDS_RESTRUCTURING'
      }
    ],
    skipDuplicates: true
  });

  await prisma.propertyFurniture.createMany({
    data: [
      {
        type: 'EQUIPPED_KITCHEN_AND_FURNISHED_HOUSE'
      },
      {
        type: 'EQUIPPED_KITCHEN_AND_UNFURNISHED_HOUSE'
      },
      {
        type: 'UNEQUIPPED_KITCHEN_AND_UNFURNISHED_HOUSE'
      }
    ],
    skipDuplicates: true
  });

  await prisma.userRole.createMany({
    data: [
      {
        role: 'ADMIN'
      },
      {
        role: 'MODERATOR'
      },
      {
        role: 'USER'
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
