/**
 * AI Evaluation Service Layer
 * Re-exports the core AI evaluation service implementing:
 * - Strengths, weak areas, recommended practice
 * - Accuracy improvement, speed improvement, readiness
 * - Pluggable connection for real AI API (e.g. Gemini)
 * - Safe, separated rule-based fallback when AI is not configured
 * - Evaluation persistence in MongoDB
 */
export * from "./aiEvaluationService";
export { AIEvaluationService, default } from "./aiEvaluationService";
