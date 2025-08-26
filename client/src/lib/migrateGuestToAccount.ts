// Minimal version for use-auth compatibility
export async function migrateGuestToAccount(guestId: string, accountId: string): Promise<void> {
  // No-op since we're not using guest migration
  return Promise.resolve();
}