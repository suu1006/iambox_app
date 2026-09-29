import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';

async function checkConnection(): Promise<void> {
  const app = await NestFactory.createApplicationContext(PrismaModule);
  try {
    const prisma = app.get(PrismaService);
    const result = await prisma.$queryRaw<Array<{ database: string }>>`
      SELECT current_database() AS database
    `;
    console.log(result);
  } finally {
    await app.close();
  }
}

checkConnection().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
