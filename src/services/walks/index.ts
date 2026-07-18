import type { Walk } from '../../types/walk';
import { getStaticWalks } from './staticWalkProvider';

// Feature flag for future database integration
const PUBLIC_USE_REMOTE_WALKS = import.meta.env?.PUBLIC_USE_REMOTE_WALKS === 'true' || false;

export async function getWalks(): Promise<Walk[]> {
  if (PUBLIC_USE_REMOTE_WALKS) {
    // try { return await getRemoteWalks(); } catch (e) { ... }
    // Fall back to static for now
    return getStaticWalks();
  }
  return getStaticWalks();
}

/**
 * Normalizes date for comparison (ignores local time/timezone issues)
 */
function normalizeDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00`);
}

export async function getUpcomingWalks(): Promise<Walk[]> {
  const walks = await getWalks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return walks
    .filter((walk) => normalizeDate(walk.date) >= today)
    .sort((a, b) => normalizeDate(a.date).getTime() - normalizeDate(b.date).getTime());
}

export async function getPastWalks(): Promise<Walk[]> {
  const walks = await getWalks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return walks
    .filter((walk) => normalizeDate(walk.date) < today)
    .sort((a, b) => normalizeDate(b.date).getTime() - normalizeDate(a.date).getTime());
}
