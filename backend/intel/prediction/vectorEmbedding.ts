/**
 * Vector Embedding for Legal Documents
 *
 * Creates vector representations of legal filings, violations, and company profiles
 * for similarity matching and clustering analysis.
 */

import { logger } from '../../../utils/logger';
import { RiskFeatures } from './riskFeatureExtractor';

export type VectorEmbedding = number[];

export interface EmbeddingConfig {
  dimensions: number;
  normalization: 'l2' | 'minmax' | 'none';
}

export class LegalVectorEmbedder {
  private config: EmbeddingConfig;

  constructor(config: Partial<EmbeddingConfig> = {}) {
    this.config = {
      dimensions: 52, // 52-dimensional embedding as specified
      normalization: 'l2',
      ...config
    };
  }

  /**
   * Convert risk features to vector embedding
   */
  featuresToVector(features: RiskFeatures): VectorEmbedding {
    const vector: number[] = [
      // Violation features (8 dimensions)
      features.violationTrend,
      features.criticalViolationCount / 100,
      features.seriousViolationCount / 100,
      features.moderateViolationCount / 100,
      features.totalViolationCount / 200,
      features.violationDiversity,
      features.violationSeverityScore / 100,
      features.remediationVelocity / 10,

      // Industry features (6 dimensions)
      features.industryDensity / 20,
      features.industryRiskScore / 100,
      features.industryFilingVelocity / 20,

      // Jurisdiction features (6 dimensions)
      features.jurisdictionRisk / 100,
      features.jurisdictionFilingRate / 30,
      features.jurisdictionPlaintiffFriendly,

      // Plaintiff proximity (6 dimensions)
      features.plaintiffProximityScore / 100,
      features.nearbyPlaintiffCount / 10,
      features.serialPlaintiffActivityLevel / 100,

      // Company characteristics (8 dimensions)
      features.cmsRisk,
      features.companySizeRisk,
      features.revenueRisk,
      features.employeeCountRisk,

      // Temporal features (6 dimensions)
      Math.min(features.daysSinceRedesign / 365, 1),
      features.seasonalityFactor,
      features.economicSensitivity,

      // Compliance indicators (10 dimensions)
      features.hasAccessibilityStatement,
      features.hasCompliantFooter,
      features.wcagLevelNumeric / 6,
      features.complianceImprovement,

      // Padding to reach 52 dimensions
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    // Normalize if configured
    return this.normalize(vector.slice(0, this.config.dimensions));
  }

  /**
   * Calculate similarity between two vectors (cosine similarity)
   */
  cosineSimilarity(vector1: VectorEmbedding, vector2: VectorEmbedding): number {
    if (vector1.length !== vector2.length) {
      throw new Error('Vectors must have same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      norm1 += vector1[i] * vector1[i];
      norm2 += vector2[i] * vector2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find K nearest neighbors
   */
  findNearestNeighbors(
    query: VectorEmbedding,
    corpus: Array<{ id: string; vector: VectorEmbedding; metadata?: any }>,
    k: number = 5
  ): Array<{ id: string; similarity: number; metadata?: any }> {
    const similarities = corpus.map(item => ({
      id: item.id,
      similarity: this.cosineSimilarity(query, item.vector),
      metadata: item.metadata
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  /**
   * Cluster vectors using simple K-means
   */
  cluster(
    vectors: Array<{ id: string; vector: VectorEmbedding }>,
    k: number = 3
  ): Array<{ clusterId: number; members: string[] }> {
    if (vectors.length < k) {
      logger.warn(`Not enough vectors for ${k} clusters`);
      k = Math.max(1, vectors.length);
    }

    // Initialize centroids randomly
    const centroids: VectorEmbedding[] = [];
    const shuffled = [...vectors].sort(() => Math.random() - 0.5);

    for (let i = 0; i < k; i++) {
      centroids.push([...shuffled[i].vector]);
    }

    // K-means iterations
    const maxIterations = 10;
    let assignments = new Map<string, number>();

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to nearest centroid
      const newAssignments = new Map<string, number>();

      for (const item of vectors) {
        let maxSimilarity = -1;
        let assignedCluster = 0;

        for (let c = 0; c < k; c++) {
          const similarity = this.cosineSimilarity(item.vector, centroids[c]);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            assignedCluster = c;
          }
        }

        newAssignments.set(item.id, assignedCluster);
      }

      // Check convergence
      if (this.assignmentsEqual(assignments, newAssignments)) {
        break;
      }

      assignments = newAssignments;

      // Update centroids
      for (let c = 0; c < k; c++) {
        const clusterMembers = vectors.filter(v => assignments.get(v.id) === c);

        if (clusterMembers.length > 0) {
          const newCentroid = this.calculateCentroid(clusterMembers.map(m => m.vector));
          centroids[c] = newCentroid;
        }
      }
    }

    // Format results
    const clusters: Array<{ clusterId: number; members: string[] }> = [];

    for (let c = 0; c < k; c++) {
      const members = vectors
        .filter(v => assignments.get(v.id) === c)
        .map(v => v.id);

      clusters.push({
        clusterId: c,
        members
      });
    }

    return clusters;
  }

  /**
   * Normalize vector
   */
  private normalize(vector: VectorEmbedding): VectorEmbedding {
    switch (this.config.normalization) {
      case 'l2':
        return this.normalizeL2(vector);
      case 'minmax':
        return this.normalizeMinMax(vector);
      default:
        return vector;
    }
  }

  /**
   * L2 normalization
   */
  private normalizeL2(vector: VectorEmbedding): VectorEmbedding {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

    if (norm === 0) return vector;

    return vector.map(val => val / norm);
  }

  /**
   * Min-max normalization
   */
  private normalizeMinMax(vector: VectorEmbedding): VectorEmbedding {
    const min = Math.min(...vector);
    const max = Math.max(...vector);

    if (max === min) return vector;

    return vector.map(val => (val - min) / (max - min));
  }

  /**
   * Calculate centroid of vectors
   */
  private calculateCentroid(vectors: VectorEmbedding[]): VectorEmbedding {
    if (vectors.length === 0) return [];

    const dimensions = vectors[0].length;
    const centroid = new Array(dimensions).fill(0);

    for (const vector of vectors) {
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += vector[i];
      }
    }

    return centroid.map(val => val / vectors.length);
  }

  /**
   * Check if two assignments are equal
   */
  private assignmentsEqual(a: Map<string, number>, b: Map<string, number>): boolean {
    if (a.size !== b.size) return false;

    for (const [key, value] of a.entries()) {
      if (b.get(key) !== value) return false;
    }

    return true;
  }
}

/**
 * Singleton instance
 */
export const vectorEmbedder = new LegalVectorEmbedder();
