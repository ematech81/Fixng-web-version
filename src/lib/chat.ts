// Shared helpers for the live chat screens (customer + artisan).

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  jobId?: string;
}

/**
 * Add messages to the list without duplicates (a message can arrive by socket, by the send
 * response and by the periodic refresh), oldest first.
 */
export function mergeMessages<T extends { id: string; createdAt: string }>(prev: T[], incoming: T[]): T[] {
  const seen = new Set(prev.map((m) => String(m.id)));
  const fresh = incoming.filter((m) => m && m.id && !seen.has(String(m.id)));
  if (fresh.length === 0) return prev;
  return [...prev, ...fresh].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
