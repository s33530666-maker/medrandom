import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const attemptsRouter = Router();

// Helper to format Date to YYYY-MM-DD
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// POST /api/attempts - Log a completed or recorded attempt
attemptsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { topicId, researchSecs, explainSecs, notes, completed = true } = req.body;

    if (!topicId || typeof topicId !== 'number') {
      res.status(400).json({ error: 'Valid topicId (number) is required' });
      return;
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const attempt = await prisma.attempt.create({
      data: {
        topicId,
        researchSecs: typeof researchSecs === 'number' ? researchSecs : null,
        explainSecs: typeof explainSecs === 'number' ? explainSecs : null,
        notes: typeof notes === 'string' ? notes.trim() : null,
        completed: Boolean(completed),
      },
      include: {
        topic: true,
      },
    });

    res.status(201).json(attempt);
  } catch (error) {
    console.error('Error recording attempt:', error);
    res.status(500).json({ error: 'Failed to record study attempt' });
  }
});

// GET /api/attempts - List all past attempts with topic details
attemptsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const attempts = await prisma.attempt.findMany({
      orderBy: {
        startedAt: 'desc',
      },
      include: {
        topic: true,
      },
    });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts history' });
  }
});

// GET /api/attempts/streak - Calculate daily streak and study stats
attemptsRouter.get('/streak', async (_req: Request, res: Response) => {
  try {
    const attempts = await prisma.attempt.findMany({
      where: {
        completed: true,
      },
      orderBy: {
        startedAt: 'asc',
      },
    });

    if (attempts.length === 0) {
      res.json({
        currentStreak: 0,
        longestStreak: 0,
        topicsCompletedToday: 0,
        totalCompleted: 0,
        totalResearchMinutes: 0,
        activityDates: [],
      });
      return;
    }

    // Set of distinct active days (YYYY-MM-DD)
    const activeDateSet = new Set<string>();
    let totalResearchSecs = 0;

    for (const attempt of attempts) {
      const dateKey = toDateKey(new Date(attempt.startedAt));
      activeDateSet.add(dateKey);
      if (attempt.researchSecs) {
        totalResearchSecs += attempt.researchSecs;
      }
      if (attempt.explainSecs) {
        totalResearchSecs += attempt.explainSecs;
      }
    }

    const sortedDates = Array.from(activeDateSet).sort();
    const today = new Date();
    const todayKey = toDateKey(today);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);

    // Topics completed today
    const topicsCompletedToday = attempts.filter((a) => {
      return toDateKey(new Date(a.startedAt)) === todayKey;
    }).length;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    // If no activity today, check if yesterday had activity to keep streak alive
    if (!activeDateSet.has(todayKey)) {
      if (activeDateSet.has(yesterdayKey)) {
        checkDate = yesterday;
      } else {
        // Streak is 0 if neither today nor yesterday has activity
        currentStreak = 0;
      }
    }

    if (activeDateSet.has(toDateKey(checkDate))) {
      currentStreak = 1;
      const testDate = new Date(checkDate);

      while (true) {
        testDate.setDate(testDate.getDate() - 1);
        const testKey = toDateKey(testDate);
        if (activeDateSet.has(testKey)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak across all historical dates
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const currentDate = new Date(year, month - 1, day);

      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffMs = currentDate.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDate = currentDate;
    }

    res.json({
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      topicsCompletedToday,
      totalCompleted: attempts.length,
      totalResearchMinutes: Math.round(totalResearchSecs / 60),
      activityDates: sortedDates,
    });
  } catch (error) {
    console.error('Error calculating streak:', error);
    res.status(500).json({ error: 'Failed to calculate streak' });
  }
});
