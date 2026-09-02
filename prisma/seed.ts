import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface TopicSeed {
  title: string;
  category: string;
  difficulty: string;
  description?: string;
}

async function main() {
  const topicsPath = path.resolve(__dirname, '../data/topics.json');
  console.log(`Reading topics from: ${topicsPath}`);

  if (!fs.existsSync(topicsPath)) {
    throw new Error(`Topics file not found at ${topicsPath}`);
  }

  const rawData = fs.readFileSync(topicsPath, 'utf-8');
  const topics: TopicSeed[] = JSON.parse(rawData);

  console.log(`Found ${topics.length} topics to seed.`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of topics) {
    const existing = await prisma.topic.findFirst({
      where: {
        title: item.title,
        category: item.category,
      },
    });

    if (existing) {
      await prisma.topic.update({
        where: { id: existing.id },
        data: {
          difficulty: item.difficulty,
          description: item.description ?? null,
        },
      });
      updatedCount++;
    } else {
      await prisma.topic.create({
        data: {
          title: item.title,
          category: item.category,
          difficulty: item.difficulty,
          description: item.description ?? null,
        },
      });
      createdCount++;
    }
  }

  console.log(`Seeding finished successfully!`);
  console.log(`Created: ${createdCount}, Updated: ${updatedCount}, Total: ${topics.length}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
