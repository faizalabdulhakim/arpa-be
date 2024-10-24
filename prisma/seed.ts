import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltOrRounds = 10;
  const password = 'password';
  const hash = await bcrypt.hash(password, saltOrRounds);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'admin',
      password: hash,
      role: 'ADMIN',
    },
  });

  const robin = await prisma.user.upsert({
    where: { email: 'robin@gmail.com' },
    update: {},
    create: {
      email: 'robin@gmail.com',
      name: 'Robin Sharma',
      password: hash,
      role: 'USER',
    },
  });

  console.log({ admin, robin });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
