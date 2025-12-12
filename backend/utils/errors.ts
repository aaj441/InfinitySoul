/**
 * DEPRECATED: Use @/backend/errors instead
 * This file re-exports from the unified error module for backward compatibility.
 */
export {
  AppError,
  ValidationError,
  NotFoundError,
  ExternalServiceError,
  DatabaseError,
  ConfigurationError,
  ParseError,
  OrchestratorError,
  TimeoutError,
  EthicsViolationError,
  InfinitySoulError,
  safeJsonParse,
  safeParseInt,
  parseRangeValue,
  isDefined,
  assertDefined,
  validateUrl,
  formatErrorResponse,
} from '../errors';
