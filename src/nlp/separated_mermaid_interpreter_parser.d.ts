// Type definitions for separated_mermaid_interpreter_parser.js

import type { PathLike } from "fs";

// Type definition for Compromise.js document (external library without TS types)
interface CompromiseDoc {
  json(): unknown[];
  match(pattern: string): CompromiseDoc;
  found: boolean;
  has(pattern: string): boolean;
  out(format: string): string[];
  terms(): CompromiseDoc;
  forEach(callback: (term: unknown) => void): void;
  places(): CompromiseDoc;
  nouns(): CompromiseDoc;
  text(): string;
  // Add other methods as needed
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface FlowchartNode {
  id: string;
  type: 'question' | 'keywords';
  text: string;
  outgoingEdges: FlowchartEdge[];
  keywords?: string[];
  categories?: Map<string, CategoryData>;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  type: 'category' | 'direct';
  category?: string;
}

export interface CategoryData {
  name: string;
  keywords: string[];
  keywordNodeId: string;
  nextPath: string | null;
}

export interface FlowchartStructure {
  nodes: Map<string, FlowchartNode>;
  edges: FlowchartEdge[];
}

export interface CurrentPosition {
  nodeId: string;
  nodeType: string;
  waitingForResponse: boolean;
}

export interface NavigationHistoryItem {
  from: string;
  category: string;
  timestamp: number;
}

export interface QuestionData {
  id: string;
  type: 'classification' | 'extraction';
  question: string;
  categories: Record<string, CategoryInfo>;
  clarificationResponse: string;
  defaultCategory: string;
  informationType?: string;
}

export interface CategoryInfo {
  keywords: string[];
  sampleInputs: string[];
}

export interface ClassificationResult {
  type: 'classification';
  category: string;
  confidence: number;
  matchedKeywords: string[];
  nlpAnalysis: NLPAnalysis;
  reasoning: string;
  alternativeScores: CategoryScore[];
}

export interface ExtractionResult {
  type: 'extraction';
  extractedValue: string;
  confidence: number;
  informationType: string;
  extractionMethod: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  matchedElements: string[];
}

export interface NLPAnalysis {
  // sentiment: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  entities: {
    people: string[];
    places: string[];
    organizations: string[];
  };
  linguistic: {
    emotions: string[];
    intensifiers: string[];
    negations: boolean;
    uncertainties: string[];
    questions: string[];
    verbs: string[];
    adjectives: string[];
    length: number;
    wordCount: number;
  };
}

export interface NavigationResult {
  success: boolean;
  error?: string;
  newPosition?: CurrentPosition;
}

export interface ProcessingResult {
  success: boolean;
  error?: string;
  classification?: ClassificationResult | ExtractionResult;
  shouldTriggerAction?: string | null;
  isComplete?: boolean;
  debugInfo?: {
    interpreterInfo: StructureInfo;
    currentPosition: CurrentPosition;
  };
}

export interface StructureInfo {
  totalNodes: number;
  totalEdges: number;
  questionNodes: number;
  keywordNodes: number;
  currentPosition: CurrentPosition;
  navigationSteps: number;
}

export interface DebugInfo {
  ready: boolean;
  interpreter?: StructureInfo;
  currentQuestion?: QuestionData | null;
}

// ============================================================================
// MERMAID INTERPRETER CLASS
// ============================================================================

export declare class MermaidInterpreter {
  flowchartStructure: FlowchartStructure | null;
  currentPosition: CurrentPosition | null;
  navigationHistory: NavigationHistoryItem[];
  isReady: boolean;

  constructor();

  /**
   * Creates a MermaidInterpreter instance from a file
   * @param filePath - Path to the mermaid flowchart file
   * @returns Promise resolving to configured MermaidInterpreter
   */
  static createFromFile(filePath?: string): Promise<MermaidInterpreter>;

  /**
   * Interprets mermaid syntax and builds flowchart structure
   * @param mermaidText - Raw mermaid flowchart text
   */
  interpret(mermaidText: string): Promise<void>;

  /**
   * Parses mermaid syntax into structured data
   * @param text - Mermaid flowchart text
   * @returns Parsed flowchart structure
   */
  parseMermaidSyntax(text: string): FlowchartStructure;

  /**
   * Builds category mappings for question nodes
   * @param nodes - Map of flowchart nodes
   */
  buildQuestionCategories(nodes: Map<string, FlowchartNode>): void;

  /**
   * Finds the next node from a keywords node
   * @param keywordNode - Keyword node to search from
   * @returns Next node ID or null
   */
  findNextNodeFromKeywords(keywordNode: FlowchartNode): string | null;

  /**
   * Normalizes category text for consistent matching
   * @param text - Category text to normalize
   * @returns Normalized category string
   */
  normalizeCategory(text: string): string;

  /**
   * Finds the starting node of the flowchart
   * @returns Start node ID or null
   */
  findStartNode(): string | null;

  /**
   * Gets the current node in the flowchart
   * @returns Current node or undefined
   */
  getCurrentNode(): FlowchartNode | undefined;

  /**
   * Gets the current question data for user interaction
   * @returns Question data or null
   */
  getCurrentQuestion(): QuestionData | null;

  /**
   * Navigates to a specific category
   * @param category - Category to navigate to
   * @returns Navigation result
   */
  navigateToCategory(category: string): NavigationResult;

  /**
   * Checks if currently at a question node
   * @returns True if at question, false otherwise
   */
  isAtQuestion(): boolean;

  /**
   * Checks if conversation is complete
   * @returns True if complete, false otherwise
   */
  isComplete(): boolean;

  /**
   * Checks if current node should trigger an action
   * @returns Action type or null
   */
  shouldTriggerAction(): string | null;

  /**
   * Gets debug information about flowchart structure
   * @returns Structure information object
   */
  getStructureInfo(): StructureInfo;
}

// ============================================================================
// NLP PARSER CLASS
// ============================================================================

export declare class NLPParser {
  constructor();

  /**
   * Sets up compromise.js extensions for NLP processing
   */
  setupCompromiseExtensions(): void;

  /**
   * Classifies user input based on flowchart categories
   * @param userInput - User's text input
   * @param questionData - Current question data with categories
   * @returns Classification result
   */
  classifyInput(userInput: string, questionData: QuestionData): ClassificationResult;

  /**
   * Performs generic NLP analysis on text
   * @param doc - Compromise.js document object
   * @param text - Original text string
   * @returns NLP analysis results
   */
  performGenericAnalysis(doc: CompromiseDoc, text: string): NLPAnalysis;

  /**
   * Scores categories based on flowchart keywords
   * @param text - User input text
   * @param doc - Compromise.js document
   * @param flowchartCategories - Categories from flowchart
   * @param nlpAnalysis - Previous NLP analysis
   * @returns Array of category scores
   */
  scoreFlowchartCategories(
    text: string,
    doc: CompromiseDoc,
    flowchartCategories: Record<string, CategoryInfo>,
    nlpAnalysis: NLPAnalysis
  ): CategoryScore[];

  /**
   * Calculates semantic similarity score for flowchart keywords
   * @param doc - Compromise.js document
   * @param flowchartKeywords - Keywords from flowchart
   * @param nlpAnalysis - NLP analysis results
   * @returns Semantic similarity score
   */
  calculateFlowchartSemanticScore(
    doc: CompromiseDoc,
    flowchartKeywords: string[],
    nlpAnalysis: NLPAnalysis
  ): number;

  /**
   * Calculates generic linguistic patterns score
   * @param nlpAnalysis - NLP analysis results
   * @param categoryKey - Category being scored
   * @returns Linguistic score
   */
  calculateGenericLinguisticScore(nlpAnalysis: NLPAnalysis, categoryKey: string): number;

  /**
   * Selects the best category from scores
   * @param scores - Array of category scores
   * @param questionData - Question data with defaults
   * @returns Best category match
   */
  selectBestCategory(scores: CategoryScore[], questionData: QuestionData): {
    category: string;
    confidence: number;
    matchedElements: string[];
    reasoning: string;
  };

  /**
   * Extracts information from user input
   * @param userInput - User's text input
   * @param questionData - Question configuration
   * @returns Extraction result
   */
  extractInformation(userInput: string, questionData: QuestionData): ExtractionResult;
}

// ============================================================================
// CONVERSATION CONTROLLER CLASS
// ============================================================================

export declare class ConversationController {
  interpreter: MermaidInterpreter | null;
  nlpParser: NLPParser;
  isReady: boolean;
  scriptPath: PathLike | null;

  constructor(filePath: PathLike | null);

  /**
   * Creates a ConversationController from a flowchart file
   * @param filePath - Path to mermaid flowchart file
   * @returns Promise resolving to configured controller
   */
  static createFromFile(): Promise<ConversationController>;

  /**
   * Initializes the conversation controller
   * @param filePath - Path to flowchart file
   */
  initialize(): Promise<void>;

  /**
   * Gets the current question for user interaction
   * @returns Current question data or null
   */
  getCurrentQuestion(): QuestionData | null;

  /**
   * Processes user input and updates conversation state
   * @param userInput - User's text input
   * @returns Processing result with navigation and classification
   */
  processUserInput(userInput: string): ProcessingResult;

  /**
   * Reloads the flowchart from file
   * @param filePath - Path to flowchart file
   */
  reloadFlowchart(filePath?: string): Promise<void>;

  /**
   * Gets debug information about the conversation state
   * @returns Debug information object
   */
  getDebugInfo(): DebugInfo;
}