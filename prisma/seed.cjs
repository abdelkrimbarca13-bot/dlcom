const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminUsername = 'admin';
  const adminPassword = 'azeqsdwxc';
  console.log(`Hashing password: "${adminPassword}" for user: ${adminUsername}`);
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      username: adminUsername,
      fullName: 'Administrateur Système',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  const ARTICLE_TYPES = [
    'RECOR',
    'ACI',
    'HR',
    'ACC PAV AE',
    'RACC PAV SOU',
    'RACC FAC',
    'RACC B2B SAV',
    'REFRAK',
    'DEGRADATION REF',
    'DEPLACEMENT PRISE',
  ];

  for (const name of ARTICLE_TYPES) {
    await prisma.articleType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Types d\'articles par défaut créés avec succès !');

  console.log('-----------------------------------------------');
  console.log('Compte Administrateur (PROJET VIERGE) créé !');
  console.log(`Nom d'utilisateur : ${adminUsername}`);
  console.log(`Mot de passe : ${adminPassword}`);
  console.log('-----------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
