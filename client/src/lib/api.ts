import { Topic, Attempt, StreakStats, DrawResponse, CategoryType, DifficultyType } from '../types';

const BASE_URL = '/api';

export async function fetchRandomTopic(
  category: string,
  difficulty: string,
  excludeIds: number[] = []
): Promise<DrawResponse> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
  if (excludeIds.length > 0) params.append('excludeIds', excludeIds.join(','));

  const res = await fetch(`${BASE_URL}/topics/random?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function fetchTopics(
  category?: string,
  difficulty?: string,
  search?: string
): Promise<{ topics: Topic[]; total: number; categoryCounts: Record<string, number> }> {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
  if (search && search.trim()) params.append('search', search.trim());

  const res = await fetch(`${BASE_URL}/topics?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch topics list');
  }
  return res.json();
}

export async function createTopic(topic: {
  title: string;
  category: CategoryType;
  difficulty: DifficultyType;
  description?: string;
}): Promise<Topic> {
  const res = await fetch(`${BASE_URL}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(topic),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create topic');
  }
  return res.json();
}

export async function recordAttempt(payload: {
  topicId: number;
  researchSecs?: number;
  explainSecs?: number;
  notes?: string;
  completed?: boolean;
}): Promise<Attempt> {
  const res = await fetch(`${BASE_URL}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to log attempt');
  }
  return res.json();
}

export async function fetchAttempts(): Promise<Attempt[]> {
  const res = await fetch(`${BASE_URL}/attempts`);
  if (!res.ok) {
    throw new Error('Failed to fetch study history');
  }
  return res.json();
}

export async function fetchStreakStats(): Promise<StreakStats> {
  const res = await fetch(`${BASE_URL}/attempts/streak`);
  if (!res.ok) {
    throw new Error('Failed to fetch streak information');
  }
  return res.json();
}
