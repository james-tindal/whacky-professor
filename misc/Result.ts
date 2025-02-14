
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function tryCatch<T>(fn: () => T): Result<T, unknown> {
  try {
    return { ok: true, value: fn() }
  } catch (error) {
    return { ok: false, error }
  }
}
