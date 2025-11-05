// Conversation Controller for CALMe Therapeutic Flow
// Implements dynamic conversation flow based on conversation map specification

import { conversationMapV2 } from './conversationMapV2';
import { therapeuticConversationMap } from './conversationMap';
import { onboardingConversationMap, onboardingParsers } from './onboardingMap';
import { userProfileStorage, type UserProfile } from '../storage/userProfileStorage';
import * as enhancedParser from '../parser/enhancedParser';

// Import types from parser module
type ClassificationResult = {
  type: 'classification';
  category?: string;
  confidence: number;
  reasoning?: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
};

type ExtractionResult = {
  type: 'extraction';
  extractedValue?: string;
  confidence: number;
  informationType?: string;
  extractionMethod?: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
};

export interface ConversationDecisionLogic {
  conditions: Array<{
    if?: string;
    default?: string | boolean;
    goto: string;
  }>;
}

export interface ConversationNode {
  id: string;
  type: 'question' | 'activity' | 'decision' | 'end';
  content?: string;
  next?: string | ConversationDecisionLogic;
  activity?: string;
  parser?: string;
}

export interface ConversationDecision {
  condition: (result: ClassificationResult | ExtractionResult) => boolean;
  nextNode: string;
}

export interface ConversationMap {
  startNode: string;
  nodes: Map<string, ConversationNode>;
}

export interface ActivityTrigger {
  activityName: string;
  returnNode: string;
}

// Enhanced interface for the conversation controller
export interface ConversationControllerInterface {
  // Initialize with a conversation map
  initialize(map?: ConversationMap): void;
  
  // Process parser output and determine next step
  processParserOutput(result: ClassificationResult | ExtractionResult): { nextNode: ConversationNode; activityTrigger?: ActivityTrigger };
  
  // Get current conversation node
  getCurrentNode(): ConversationNode;
  
  // Move to next node
  moveToNode(nodeId: string): ConversationNode;
  
  // Check if conversation is complete
  isComplete(): boolean;
  
  // Reset conversation to start
  reset(): void;
  
  // Get parser type for current node
  getCurrentParserType(): string | null;
}

// Complete implementation
export class ConversationController implements ConversationControllerInterface {
  private conversationMap: ConversationMap;
  private currentNodeId: string;
  private isOnboarding: boolean = false;
  private userProfile: UserProfile | null = null;
  private userVariables: Record<string, any> = {};
  private attemptedActivities: Set<string> = new Set();
  private initializationComplete: boolean = false;

  constructor() {
    // Check for firsttime flag synchronously
    const urlParams = new URLSearchParams(window.location.search);
    const isFirstTime = urlParams.get('firsttime') === 'true';
    
    if (isFirstTime) {
      console.log('🧪 CONSTRUCTOR: First-time flag detected, starting with onboarding');
      this.isOnboarding = true;
      this.conversationMap = onboardingConversationMap;
      this.currentNodeId = onboardingConversationMap.startNode;
    } else {
      // Set default conversation map but wait for profile to determine which to use
      this.conversationMap = conversationMapV2;
      this.currentNodeId = conversationMapV2.startNode;
    }
    
    this.initializeProfile();
  }

  private async initializeProfile() {
    try {
      console.log('🚀 INIT: Starting profile initialization');
      await userProfileStorage.init();
      console.log('🚀 INIT: Storage initialized');
      
      // Check for firsttime flag in URL params for testing
      const urlParams = new URLSearchParams(window.location.search);
      const hasFirstTimeFlag = urlParams.get('firsttime') === 'true';
      
      if (hasFirstTimeFlag) {
        console.log('🧪 INIT: First-time flag detected, clearing all data for testing');
        await userProfileStorage.clearAllData();
        // Remove the parameter from URL to avoid repeated clearing
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('🧪 INIT: Data cleared, URL cleaned');
        // Don't check profile - we already set onboarding in constructor
        this.initializationComplete = true;
        console.log('🚀 INIT: Profile initialization complete (firsttime mode)');
        return;
      }
      
      this.userProfile = await userProfileStorage.getActiveProfile();
      console.log('🚀 INIT: Profile retrieval result:', this.userProfile);
      
      // If no profile exists, switch to onboarding
      if (!this.userProfile || !this.userProfile.onboardingCompleted) {
        console.log('🎯 INIT: No valid profile found, starting onboarding');
        console.log('🎯 INIT: Profile null?', this.userProfile === null);
        console.log('🎯 INIT: Onboarding completed?', this.userProfile?.onboardingCompleted);
        this.isOnboarding = true;
        this.conversationMap = onboardingConversationMap;
        this.currentNodeId = onboardingConversationMap.startNode;
        console.log('🎯 INIT: Switched to onboarding map, starting node:', this.currentNodeId);
        console.log('🎯 INIT: isOnboarding flag set to:', this.isOnboarding);
      } else {
        console.log('✅ INIT: Profile loaded successfully:', this.userProfile.name);
        console.log('✅ INIT: Using main conversation map');
        this.userVariables.name = this.userProfile.name;
        this.isOnboarding = false;
        this.conversationMap = conversationMapV2;
        this.currentNodeId = conversationMapV2.startNode;
      }
      
      console.log('🚀 INIT: Profile initialization complete');
      console.log('🚀 INIT: Current map start node:', this.conversationMap.startNode);
      console.log('🚀 INIT: Current node ID:', this.currentNodeId);
      console.log('🚀 INIT: Is onboarding:', this.isOnboarding);
      
      this.initializationComplete = true;
    } catch (error) {
      console.error('❌ INIT: Failed to initialize profile:', error);
      // Even on error, mark as complete so app can continue
      this.initializationComplete = true;
    }
  }

  initialize(map?: ConversationMap): void {
    this.conversationMap = map || therapeuticConversationMap;
    this.currentNodeId = this.conversationMap.startNode;
  }

  processParserOutput(result: ClassificationResult | ExtractionResult): { nextNode: ConversationNode; activityTrigger?: ActivityTrigger } {
    console.log('🔧 PROCESS: Processing parser output:', result);
    const currentNode = this.getCurrentNode();
    console.log('🔧 PROCESS: Current node:', currentNode);
    
    // Handle clarification needs
    if (result.needsClarification && result.clarificationPrompt) {
      console.log('❓ PROCESS: Parser needs clarification');
      // Create a temporary clarification node
      const clarificationNode: ConversationNode = {
        id: `${this.currentNodeId}_clarify`,
        type: 'question',
        content: result.clarificationPrompt,
        next: currentNode.next,
        parser: currentNode.parser
      };
      return { nextNode: clarificationNode, activityTrigger: undefined };
    }
    
    if (!currentNode.next) {
      // Check if this is an end node or if we're completing onboarding
      if (currentNode.type === 'end' && this.isOnboarding) {
        console.log('🎯 PROCESS: Completing onboarding');
        // Complete onboarding with collected data
        this.completeOnboarding(this.userVariables);
      }
      throw new Error(`Node ${this.currentNodeId} has no next steps defined`);
    }

    let nextNodeId: string;
    
    // Handle simple string next (direct transition)
    if (typeof currentNode.next === 'string') {
      nextNodeId = currentNode.next;
      console.log('🔧 PROCESS: Simple transition to:', nextNodeId);
    } else {
      // Handle conditional logic
      console.log('🔧 PROCESS: Evaluating conditional logic');
      const decisionLogic = currentNode.next as ConversationDecisionLogic;
      nextNodeId = this.evaluateConditions(decisionLogic, result);
      console.log('🔧 PROCESS: Conditional result, moving to:', nextNodeId);
    }

    // Move to next node
    const nextNode = this.moveToNode(nextNodeId);
    console.log('🔧 PROCESS: Moved to next node:', nextNode);
    
    // Check if this triggers an activity
    let activityTrigger: ActivityTrigger | undefined;
    if (nextNode.type === 'activity' && nextNode.activity) {
      console.log('🎯 PROCESS: Activity node detected, creating trigger');
      activityTrigger = {
        activityName: nextNode.activity,
        returnNode: nextNode.next as string // Activities should have simple string next
      };
      console.log('🎯 PROCESS: Activity trigger created:', activityTrigger);
    } else {
      console.log('🔧 PROCESS: No activity trigger (node type:', nextNode.type, ', activity:', nextNode.activity, ')');
    }

    return { nextNode, activityTrigger };
  }

  private evaluateConditions(decisionLogic: ConversationDecisionLogic, result: ClassificationResult | ExtractionResult): string {
    // Evaluate each condition in order
    for (const condition of decisionLogic.conditions) {
      if (condition.if) {
        // Create a safe evaluation context
        const evaluationContext = {
          category: result.type === 'classification' ? result.category : undefined,
          extractedValue: result.type === 'extraction' ? result.extractedValue : undefined,
          confidence: result.confidence
        };
        
        try {
          // Simple condition evaluation (can be enhanced with a proper expression parser)
          if (this.evaluateCondition(condition.if, evaluationContext)) {
            return condition.goto;
          }
        } catch (error) {
          console.warn(`Error evaluating condition: ${condition.if}`, error);
          continue;
        }
      } else if (condition.default) {
        return condition.goto; // Use goto for default conditions too
      }
    }
    
    // Fallback to first condition's goto if no default found
    return decisionLogic.conditions[0]?.goto || 'ongoing_support';
  }

  private evaluateCondition(conditionStr: string, context: any): boolean {
    // Simple condition evaluation - replace with a proper expression parser for production
    const { category, extractedValue, confidence } = context;
    
    // Handle common condition patterns
    if (conditionStr.includes('category ===')) {
      const match = conditionStr.match(/category === ["']([^"']+)["']/);
      if (match && category) {
        return category === match[1];
      }
    }
    
    if (conditionStr.includes('||')) {
      const conditions = conditionStr.split('||').map(c => c.trim());
      return conditions.some(cond => this.evaluateCondition(cond, context));
    }
    
    if (conditionStr.includes('extractedValue') && extractedValue) {
      if (conditionStr.includes('.toLowerCase().includes(')) {
        const match = conditionStr.match(/extractedValue\.toLowerCase\(\)\.includes\(["']([^"']+)["']\)/);
        if (match) {
          return extractedValue.toLowerCase().includes(match[1]);
        }
      }
    }
    
    if (conditionStr.includes('confidence') && confidence !== undefined) {
      const match = conditionStr.match(/confidence ([><]=?) ([0-9.]+)/);
      if (match) {
        const operator = match[1];
        const threshold = parseFloat(match[2]);
        switch (operator) {
          case '>': return confidence > threshold;
          case '>=': return confidence >= threshold;
          case '<': return confidence < threshold;
          case '<=': return confidence <= threshold;
          case '==': return confidence === threshold;
        }
      }
    }
    
    return false;
  }

  getCurrentNode(): ConversationNode {
    console.log('🔍 NODE: Getting current node with ID:', this.currentNodeId);
    console.log('🔍 NODE: Current map has', this.conversationMap.nodes.size, 'nodes');
    console.log('🔍 NODE: Is onboarding:', this.isOnboarding);
    
    const node = this.conversationMap.nodes.get(this.currentNodeId);
    if (!node) {
      console.error('❌ NODE: Node not found!', this.currentNodeId);
      console.error('❌ NODE: Available nodes:', Array.from(this.conversationMap.nodes.keys()));
      throw new Error(`Node ${this.currentNodeId} not found`);
    }
    
    console.log('✅ NODE: Found node:', node);
    
    // Substitute variables in content
    if (node.content) {
      let content = node.content;
      console.log('🔍 NODE: Original content:', content);
      console.log('🔍 NODE: Available variables:', this.userVariables);
      
      // Replace {variable} with actual values
      Object.entries(this.userVariables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      });
      
      console.log('🔍 NODE: Content after substitution:', content);
      return { ...node, content };
    }
    
    return node;
  }

  moveToNode(nodeId: string): ConversationNode {
    const node = this.conversationMap.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    this.currentNodeId = nodeId;
    return node;
  }

  isComplete(): boolean {
    const currentNode = this.getCurrentNode();
    return currentNode.type === 'end';
  }

  reset(): void {
    this.currentNodeId = this.conversationMap.startNode;
  }

  getCurrentParserType(): string | null {
    const currentNode = this.getCurrentNode();
    return currentNode.parser || null;
  }

  // Handle onboarding completion
  async completeOnboarding(profileData: Partial<UserProfile>) {
    try {
      const profile: UserProfile = {
        id: 'primary', // Single profile for now
        name: profileData.name || 'User',
        safeSpaceType: profileData.safeSpaceType || 'other',
        safeSpaceLocation: profileData.safeSpaceLocation || '',
        timeToReachSafety: profileData.timeToReachSafety || 60,
        backupLocation: profileData.backupLocation,
        accessibilityNeeds: profileData.accessibilityNeeds || [],
        calmingPreferences: profileData.calmingPreferences || [],
        emergencyContacts: profileData.emergencyContacts,
        language: profileData.language || 'en',
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        onboardingCompleted: true
      };

      await userProfileStorage.saveProfile(profile);
      this.userProfile = profile;
      this.isOnboarding = false;
      
      // Switch to main conversation
      this.conversationMap = conversationMapV2;
      this.currentNodeId = conversationMapV2.startNode;
      
      console.log('✅ Onboarding completed for:', profile.name);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  // Enhanced parser that routes to appropriate parser
  runParser(parserType: string, input: string): ClassificationResult | ExtractionResult {
    console.log(`🔧 Running parser: ${parserType} on input: "${input}"`);
    
    // Check onboarding-specific parsers first
    if (this.isOnboarding && parserType in onboardingParsers) {
      const parser = onboardingParsers[parserType as keyof typeof onboardingParsers];
      const result = parser(input);
      
      // Store extracted values for profile building
      if (result.type === 'extraction') {
        this.userVariables[result.informationType] = result.extractedValue;
      }
      
      return result;
    }
    
    // Use enhanced parser for standard parsers
    switch (parserType) {
      case 'classifyStress':
        return enhancedParser.classifyStress(input);
      case 'classifySafety':
        return enhancedParser.classifySafety(input);
      case 'extractLocation':
        return enhancedParser.extractLocation(input);
      case 'parseYesNo':
        return enhancedParser.parseYesNo(input);
      case 'parseActivityPreference':
        const result = enhancedParser.parseActivityPreference(input);
        // Track attempted activities
        if (result.category && result.category !== 'no_activity' && result.category !== 'unclear_activity') {
          this.attemptedActivities.add(result.category);
        }
        return result;
      default:
        console.warn(`Unknown parser type: ${parserType}`);
        return {
          type: 'classification',
          category: 'unknown',
          confidence: 0.1,
          needsClarification: true
        };
    }
  }

  // Record activity completion
  async recordActivityCompletion(activityName: string, completed: boolean) {
    if (this.userProfile) {
      await userProfileStorage.recordActivity(this.userProfile.id, activityName, completed);
    }
    
    // Add to attempted activities
    this.attemptedActivities.add(activityName);
  }

  // Get list of activities user hasn't tried yet
  getUnattemptedActivities(): string[] {
    const allActivities = ['breathing', 'stretching', 'matching-cards', 'sudoku', 'puzzle', 'paint', 'grounding', 'music', 'story'];
    return allActivities.filter(activity => !this.attemptedActivities.has(activity));
  }

  // Switch to alert mode
  switchToAlertMode() {
    console.log('🚨 Switching to alert mode');
    this.currentNodeId = 'alert_start';
  }

  // Check if in onboarding
  isInOnboarding(): boolean {
    return this.isOnboarding;
  }

  // Force refresh profile check (for testing)
  async refreshProfile(): Promise<void> {
    await this.initializeProfile();
  }

  // Check if initialization is complete
  isInitialized(): boolean {
    return this.initializationComplete;
  }
}