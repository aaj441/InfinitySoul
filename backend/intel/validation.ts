/**
 * Validation Schemas for InfinitySoul
 * ===================================
 *
 * Provides Zod-based validation schemas for all input data in the risk distribution framework.
 * Ensures type safety and data integrity at system boundaries.
 *
 * @module validation
 */

/**
 * Simple validation implementation for environments without zod
 * Can be replaced with: import { z } from 'zod' if zod is installed
 */

export interface ValidationError {
  path: string[];
  message: string;
}

export class ValidationResult<T> {
  constructor(
    public success: boolean,
    public data?: T,
    public errors?: ValidationError[]
  ) {}
}

/**
 * Validator for risk ingestion input
 */
export const validateRiskIngestion = (data: any): ValidationResult<any> => {
  const errors: ValidationError[] = [];

  // Type validation
  if (typeof data !== 'object' || data === null) {
    errors.push({
      path: ['root'],
      message: 'Input must be an object',
    });
    return new ValidationResult(false, undefined, errors);
  }

  // type validation
  if (typeof data.type !== 'string' || data.type.trim() === '') {
    errors.push({
      path: ['type'],
      message: 'type must be a non-empty string',
    });
  }

  // value validation
  if (typeof data.value !== 'number' || data.value <= 0 || !isFinite(data.value)) {
    errors.push({
      path: ['value'],
      message: 'value must be a positive finite number',
    });
  }

  // probability validation
  if (typeof data.probability !== 'number' || data.probability < 0 || data.probability > 1 || !isFinite(data.probability)) {
    errors.push({
      path: ['probability'],
      message: 'probability must be a number between 0 and 1',
    });
  }

  // industry validation
  if (typeof data.industry !== 'string' || data.industry.trim() === '') {
    errors.push({
      path: ['industry'],
      message: 'industry must be a non-empty string',
    });
  }

  // geography validation
  if (typeof data.geography !== 'string' || data.geography.trim() === '') {
    errors.push({
      path: ['geography'],
      message: 'geography must be a non-empty string',
    });
  }

  // duration validation
  if (typeof data.duration !== 'number' || data.duration <= 0 || !isFinite(data.duration)) {
    errors.push({
      path: ['duration'],
      message: 'duration must be a positive finite number',
    });
  }

  // description validation (optional)
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push({
      path: ['description'],
      message: 'description must be a string if provided',
    });
  }

  if (errors.length > 0) {
    return new ValidationResult(false, undefined, errors);
  }

  return new ValidationResult(true, data);
};

/**
 * Validator for data collateral registration
 */
export const validateDataCollateral = (data: any): ValidationResult<any> => {
  const errors: ValidationError[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push({
      path: ['root'],
      message: 'Input must be an object',
    });
    return new ValidationResult(false, undefined, errors);
  }

  // name validation
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push({
      path: ['name'],
      message: 'name must be a non-empty string',
    });
  }

  // category validation
  if (typeof data.category !== 'string' || data.category.trim() === '') {
    errors.push({
      path: ['category'],
      message: 'category must be a non-empty string',
    });
  }

  // type validation
  if (typeof data.type !== 'string' || data.type.trim() === '') {
    errors.push({
      path: ['type'],
      message: 'type must be a non-empty string',
    });
  }

  // recordCount validation
  if (typeof data.recordCount !== 'number' || data.recordCount <= 0 || !isFinite(data.recordCount)) {
    errors.push({
      path: ['recordCount'],
      message: 'recordCount must be a positive finite number',
    });
  }

  // sizeBytes validation
  if (typeof data.sizeBytes !== 'number' || data.sizeBytes <= 0 || !isFinite(data.sizeBytes)) {
    errors.push({
      path: ['sizeBytes'],
      message: 'sizeBytes must be a positive finite number',
    });
  }

  // quality validation
  if (typeof data.quality !== 'object' || data.quality === null) {
    errors.push({
      path: ['quality'],
      message: 'quality must be an object',
    });
  } else {
    const qualityMetrics = ['completeness', 'accuracy', 'consistency', 'timeliness', 'uniqueness'];
    for (const metric of qualityMetrics) {
      if (typeof data.quality[metric] !== 'number' || data.quality[metric] < 0 || data.quality[metric] > 1) {
        errors.push({
          path: ['quality', metric],
          message: `quality.${metric} must be a number between 0 and 1`,
        });
      }
    }
  }

  // owner validation
  if (typeof data.owner !== 'string' || data.owner.trim() === '') {
    errors.push({
      path: ['owner'],
      message: 'owner must be a non-empty string',
    });
  }

  if (errors.length > 0) {
    return new ValidationResult(false, undefined, errors);
  }

  return new ValidationResult(true, data);
};

/**
 * Validator for data pledging
 */
export const validateDataPledge = (dataAssetId: string, riskTokenId: string, pledgeValue: number): ValidationResult<any> => {
  const errors: ValidationError[] = [];

  if (typeof dataAssetId !== 'string' || dataAssetId.trim() === '') {
    errors.push({
      path: ['dataAssetId'],
      message: 'dataAssetId must be a non-empty string',
    });
  }

  if (typeof riskTokenId !== 'string' || riskTokenId.trim() === '') {
    errors.push({
      path: ['riskTokenId'],
      message: 'riskTokenId must be a non-empty string',
    });
  }

  if (typeof pledgeValue !== 'number' || pledgeValue <= 0 || !isFinite(pledgeValue)) {
    errors.push({
      path: ['pledgeValue'],
      message: 'pledgeValue must be a positive finite number',
    });
  }

  if (errors.length > 0) {
    return new ValidationResult(false, undefined, errors);
  }

  return new ValidationResult(true, { dataAssetId, riskTokenId, pledgeValue });
};

/**
 * Format validation errors for logging
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map(e => `${e.path.join('.')}: ${e.message}`)
    .join('; ');
};
