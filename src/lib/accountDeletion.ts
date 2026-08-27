let accountJustDeleted = false;

export function markAccountDeleted(): void {
  accountJustDeleted = true;
}

export function consumeAccountDeleted(): boolean {
  const wasDeleted = accountJustDeleted;
  accountJustDeleted = false;
  return wasDeleted;
}
