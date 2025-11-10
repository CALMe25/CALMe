// crisis-analyzer.d.ts

// This is a minimal declaration to satisfy the import statement since 'compromise' doesn't have an official type declaration.
declare module "compromise" {
  import nlp from "compromise/types/index.d";
  export default nlp;
}

export interface SemanticAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  negations: string[];
  entities: {
    places: string[];
    people: string[];
    numbers: string[];
  };
  tags: string[];
  phrases: string[];
}

export function analyzeText(text: string): SemanticAnalysis;

export interface ClassificationResult {
  category: string;
  confidence: number;
  reasoning: string;
}

export function classifySafety(text: string): ClassificationResult;

export function classifyStress(text: string): ClassificationResult;

export interface ExtractionResult {
  extractedValue: string;
  confidence: number;
  extractionMethod: string;
}

export function extractLocation(text: string): ExtractionResult;
