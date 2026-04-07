import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = 'admin';
  const adminPassword = 'adminpassword123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      fullName: 'Administrateur Système',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('-----------------------------------------------');
  console.log('Compte Administrateur créé avec succès !');
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
