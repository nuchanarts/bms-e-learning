// In-memory online user tracker — userId → last active timestamp
const lastActive = new Map<string, Date>();

export const onlineTracker = {
  touch(userId: string) {
    lastActive.set(userId, new Date());
  },
  isOnline(userId: string, thresholdMs = 5 * 60 * 1000): boolean {
    const t = lastActive.get(userId);
    if (!t) return false;
    return Date.now() - t.getTime() < thresholdMs;
  },
  getAll(): Record<string, Date> {
    return Object.fromEntries(lastActive);
  },
};
