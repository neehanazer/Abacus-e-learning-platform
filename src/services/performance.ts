/**
 * Performance Service Layer
 * Re-exports the core Performance calculation service implementing:
 * - Aggregation across Practice attempts and Homework attempts
 * - Total questions, correct/incorrect, accuracy, average score
 * - Average response time, best score
 * - Topic-wise performance, strong/weak topics, improvement over time
 */
export * from "./performanceService";
export { PerformanceService, default } from "./performanceService";
