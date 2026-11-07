/** Resolves to the Postgres error (code + constraint) a promise rejects with, or fails if it succeeds. */
export async function pgFailure(promise: PromiseLike<unknown>): Promise<{ code?: string; constraint?: string }> {
  try {
    await promise;
  } catch (error) {
    const e = error as { code?: string; constraint_name?: string; cause?: { code?: string; constraint_name?: string } };
    const inner = e.cause ?? e;
    return { code: inner.code, constraint: inner.constraint_name };
  }
  throw new Error("expected the database to reject this statement, but it succeeded");
}

export const PG = {
  unique: "23505",
  foreignKey: "23503",
  check: "23514",
  invalidEnum: "22P02",
  restrict: "23503",
} as const;
