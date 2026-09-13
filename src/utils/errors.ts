export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export class AuthenticationError extends AppError {
  constructor(m = "Unauthorized") {
    super(401, "AUTH_UNAUTHORIZED", m);
  }
}
export class AuthorizationError extends AppError {
  constructor(m = "Forbidden") {
    super(403, "AUDIO_SESSION_UNAUTHORIZED", m);
  }
}
export class NotFoundError extends AppError {
  constructor(c = "NOT_FOUND", m = "Not found") {
    super(404, c, m);
  }
}
export class ConflictError extends AppError {
  constructor(c = "CONFLICT", m = "Conflict") {
    super(409, c, m);
  }
}
export class ValidationError extends AppError {
  constructor(m = "Invalid request") {
    super(422, "VALIDATION_ERROR", m);
  }
}
