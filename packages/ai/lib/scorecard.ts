import { Scorecard } from "scorecard-ai";
import { keys } from "@/env";

const env = keys();
const HIGH_QUALITY_SCORE = 0.9;
const MEDIUM_QUALITY_SCORE = 0.5;
const EXCELLENT_QUALITY_SCORE = 0.95;
const LOW_QUALITY_SCORE = 0.4;

export function initScorecard(): Scorecard | null {
  if (!env.SCORECARD_API_KEY) {
    return null;
  }

  return new Scorecard({
    apiKey: env.SCORECARD_API_KEY,
  });
}

export function evaluateReview(input: {
  original: string;
  suggestion: string;
  testResult: boolean;
  context?: string;
}) {
  return {
    score: input.testResult ? HIGH_QUALITY_SCORE : MEDIUM_QUALITY_SCORE,
    metrics: {
      original: input.original,
      suggestion: input.suggestion,
      testResult: input.testResult,
    },
  };
}

export function evaluateFix(input: {
  issue: string;
  fix: string;
  testPassed: boolean;
  sandboxOutput?: string;
}) {
  return {
    score: input.testPassed ? EXCELLENT_QUALITY_SCORE : LOW_QUALITY_SCORE,
    metrics: {
      issue: input.issue,
      fix: input.fix,
      testPassed: input.testPassed,
    },
  };
}

export function trackMetrics(_metrics: {
  reviewId: string;
  duration: number;
  issuesFound: number;
  fixesGenerated: number;
  testsRun: number;
  testsPassed: number;
  userAccepted: boolean;
}) {
  // Scorecard tracking placeholder
}
