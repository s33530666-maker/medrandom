import { Topic, Attempt, StreakStats, DrawResponse, CategoryType, DifficultyType } from '../types';
import defaultTopicsData from '../data/topics.json';

const BASE_URL = '/api';

// Fallback Local Storage keys
const STORAGE_TOPICS_KEY = 'medrandom_custom_topics';
const STORAGE_ATTEMPTS_KEY = 'medrandom_attempts_history';

// Helper to get all combined topics (default + user-created)
function getLocalTopics(): Topic[] {
  let initialTopics: Topic[] = (defaultTopicsData as any[]).map((t, idx) => ({
    id: idx + 1,
    title: t.title,
    category: t.category as CategoryType,
    difficulty: t.difficulty as DifficultyType,
    description: t.description || null,
    createdAt: new Date().toISOString(),
  }));

  try {
    const saved = localStorage.getItem(STORAGE_TOPICS_KEY);
    if (saved) {
      const customTopics: Topic[] = JSON.parse(saved);
      initialTopics = [...initialTopics, ...customTopics];
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }

  return initialTopics;
}

function getLocalAttempts(): Attempt[] {
  try {
    const saved = localStorage.getItem(STORAGE_ATTEMPTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }
  return [];
}

export async function fetchRandomTopic(
  category: string,
  difficulty: string,
  excludeIds: number[] = []
): Promise<DrawResponse> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
    if (excludeIds.length > 0) params.append('excludeIds', excludeIds.join(','));

    const res = await fetch(`${BASE_URL}/topics/random?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // API not reachable, use client fallback
  }

  // Client Fallback Logic
  const allTopics = getLocalTopics();
  let pool = allTopics.filter((t) => {
    if (category && category !== 'all' && t.category !== category) return false;
    if (difficulty && difficulty !== 'all' && t.difficulty !== difficulty) return false;
    return true;
  });

  const totalInFilter = pool.length;
  let available = pool.filter((t) => !excludeIds.includes(t.id));
  let cycleReset = false;

  if (available.length === 0) {
    available = pool;
    cycleReset = true;
  }

  if (available.length === 0) {
    throw new Error('No topics found matching your filter criteria.');
  }

  const selected = available[Math.floor(Math.random() * available.length)];
  return {
    topic: selected,
    remainingInPool: available.length - 1,
    totalInFilter,
    cycleReset,
  };
}

export async function fetchTopics(
  category?: string,
  difficulty?: string,
  search?: string
): Promise<{ topics: Topic[]; total: number; categoryCounts: Record<string, number> }> {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
    if (search && search.trim()) params.append('search', search.trim());

    const res = await fetch(`${BASE_URL}/topics?${params.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }

  const allTopics = getLocalTopics();
  const categoryCounts: Record<string, number> = {};
  allTopics.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const filtered = allTopics.filter((t) => {
    if (category && category !== 'all' && t.category !== category) return false;
    if (difficulty && difficulty !== 'all' && t.difficulty !== difficulty) return false;
    if (search && search.trim()) {
      const q = search.toLowerCase();
      const inTitle = t.title.toLowerCase().includes(q);
      const inDesc = t.description?.toLowerCase().includes(q);
      if (!inTitle && !inDesc) return false;
    }
    return true;
  });

  return {
    topics: filtered,
    total: filtered.length,
    categoryCounts,
  };
}

export async function createTopic(topic: {
  title: string;
  category: CategoryType;
  difficulty: DifficultyType;
  description?: string;
}): Promise<Topic> {
  try {
    const res = await fetch(`${BASE_URL}/topics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }

  const allTopics = getLocalTopics();
  const newTopic: Topic = {
    id: allTopics.length + 1000 + Math.floor(Math.random() * 1000),
    title: topic.title,
    category: topic.category,
    difficulty: topic.difficulty,
    description: topic.description || null,
    createdAt: new Date().toISOString(),
  };

  try {
    const saved = localStorage.getItem(STORAGE_TOPICS_KEY);
    const customTopics: Topic[] = saved ? JSON.parse(saved) : [];
    customTopics.push(newTopic);
    localStorage.setItem(STORAGE_TOPICS_KEY, JSON.stringify(customTopics));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  return newTopic;
}

export async function recordAttempt(payload: {
  topicId: number;
  researchSecs?: number;
  explainSecs?: number;
  notes?: string;
  completed?: boolean;
}): Promise<Attempt> {
  try {
    const res = await fetch(`${BASE_URL}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }

  const allTopics = getLocalTopics();
  const topic = allTopics.find((t) => t.id === payload.topicId) || {
    id: payload.topicId,
    title: 'Medical Topic',
    category: 'Anatomy' as CategoryType,
    difficulty: 'medium' as DifficultyType,
    description: null,
    createdAt: new Date().toISOString(),
  };

  const newAttempt: Attempt = {
    id: Date.now(),
    topicId: payload.topicId,
    topic,
    startedAt: new Date().toISOString(),
    researchSecs: payload.researchSecs || 0,
    explainSecs: payload.explainSecs || 0,
    notes: payload.notes || null,
    completed: payload.completed !== false,
  };

  try {
    const existing = getLocalAttempts();
    existing.unshift(newAttempt);
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  return newAttempt;
}

export async function fetchAttempts(): Promise<Attempt[]> {
  try {
    const res = await fetch(`${BASE_URL}/attempts`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }

  return getLocalAttempts();
}

export async function fetchStreakStats(): Promise<StreakStats> {
  try {
    const res = await fetch(`${BASE_URL}/attempts/streak`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback
  }

  const attempts = getLocalAttempts().filter((a) => a.completed);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const topicsCompletedToday = attempts.filter((a) => {
    return a.startedAt.startsWith(todayStr);
  }).length;

  const totalResearchMinutes = Math.round(
    attempts.reduce((acc, curr) => acc + (curr.researchSecs || 0), 0) / 60
  );

  const dateSet = new Set<string>();
  attempts.forEach((a) => {
    const dateStr = a.startedAt.split('T')[0];
    dateSet.add(dateStr);
  });

  const sortedDates = Array.from(dateSet).sort().reverse();
  let currentStreak = 0;
  let checkDate = new Date();
  const checkTodayStr = checkDate.toISOString().split('T')[0];

  if (!sortedDates.includes(checkTodayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (sortedDates.includes(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, sortedDates.length > 0 ? 1 : 0),
    topicsCompletedToday,
    totalCompleted: attempts.length,
    totalResearchMinutes,
    activityDates: sortedDates,
  };
}
