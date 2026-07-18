import type { Walk } from '../../types/walk';
import walksData from '../../data/walks.json';

export async function getStaticWalks(): Promise<Walk[]> {
  // In a real scenario, this might parse dates or perform static transformations.
  return walksData as Walk[];
}
