/**
 * Cheap bot filter for public forms: a hidden "website" field humans never see
 * (bots fill every field), and a minimum time between the form appearing and
 * being sent. Callers treat a hit as a silent success, so bots learn nothing.
 */
export function looksLikeBot(input: { website?: string; startedAt?: number }) {
  if (input.website?.trim()) return true;
  if (typeof input.startedAt === "number" && Date.now() - input.startedAt < 2500) return true;
  return false;
}
