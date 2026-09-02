import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const topicsRouter = Router();

// GET /api/topics/random
// Query parameters:
// - category: string (optional, e.g. "Anatomy" or "all")
// - difficulty: string (optional, "easy" | "medium" | "hard" | "all")
// - excludeIds: string (optional, comma-separated IDs already seen in this session)
topicsRouter.get('/random', async (req: Request, res: Response) => {
  try {
    const { category, difficulty, excludeIds } = req.query;

    const whereClause: Record<string, any> = {};

    if (category && category !== 'all') {
      whereClause.category = String(category);
    }

    if (difficulty && difficulty !== 'all') {
      whereClause.difficulty = String(difficulty);
    }

    // Parse exclude IDs
    let excludedList: number[] = [];
    if (excludeIds && typeof excludeIds === 'string') {
      excludedList = excludeIds
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    }

    // Total matching filter
    const totalInFilter = await prisma.topic.count({
      where: whereClause,
    });

    if (totalInFilter === 0) {
      res.status(404).json({ error: 'No topics found matching the selected filters.' });
      return;
    }

    // First attempt to find topics excluding recently seen IDs
    let candidateTopics = await prisma.topic.findMany({
      where: {
        ...whereClause,
        id: {
          notIn: excludedList,
        },
      },
    });

    let cycleReset = false;

    // If all topics in the filter have been exhausted in this cycle, reset and select from all matching
    if (candidateTopics.length === 0) {
      cycleReset = true;
      candidateTopics = await prisma.topic.findMany({
        where: whereClause,
      });
    }

    const randomIndex = Math.floor(Math.random() * candidateTopics.length);
    const selectedTopic = candidateTopics[randomIndex];

    res.json({
      topic: selectedTopic,
      remainingInPool: candidateTopics.length - 1,
      totalInFilter,
      cycleReset,
    });
  } catch (error) {
    console.error('Error fetching random topic:', error);
    res.status(500).json({ error: 'Failed to fetch random topic' });
  }
});

// GET /api/topics
// Query params: category, difficulty, search
topicsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { category, difficulty, search } = req.query;

    const whereClause: Record<string, any> = {};

    if (category && category !== 'all') {
      whereClause.category = String(category);
    }

    if (difficulty && difficulty !== 'all') {
      whereClause.difficulty = String(difficulty);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const term = search.trim();
      whereClause.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
      ];
    }

    const topics = await prisma.topic.findMany({
      where: whereClause,
      orderBy: [{ category: 'asc' }, { id: 'asc' }],
    });

    const categoryCounts = await prisma.topic.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    res.json({
      topics,
      total: topics.length,
      categoryCounts: Object.fromEntries(
        categoryCounts.map((c) => [c.category, c._count.id])
      ),
    });
  } catch (error) {
    console.error('Error listing topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// POST /api/topics
topicsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, category, difficulty, description } = req.body;

    if (!title || !category || !difficulty) {
      res.status(400).json({
        error: 'Title, category, and difficulty are required fields.',
      });
      return;
    }

    const validCategories = [
      'Anatomy',
      'Physiology',
      'Pathology',
      'Pharmacology',
      'Microbiology',
      'Clinical Cases',
      'Clinical Nutrition',
      'Public Health',
      'Research & EBM',
    ];

    const validDifficulties = ['easy', 'medium', 'hard'];

    if (!validCategories.includes(category)) {
      res.status(400).json({
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
      return;
    }

    if (!validDifficulties.includes(difficulty)) {
      res.status(400).json({
        error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`,
      });
      return;
    }

    const newTopic = await prisma.topic.create({
      data: {
        title: title.trim(),
        category,
        difficulty,
        description: description?.trim() || null,
      },
    });

    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});
