import nlp from 'compromise'

import { 
  analyzeText, 
  classifySafety, 
  classifyStress, 
  extractLocation 
} from './semanticParser.js'


// ============================================================================
// MERMAID INTERPRETER - Handles flowchart structure and navigation
// ============================================================================

export class MermaidInterpreter {
  
  constructor(filePath) {
    this.flowchartStructure = null;
    this.currentPosition = null;
    this.navigationHistory = [];
    this.isReady = false;
  }

  async loadFromFile(filePath) {
    // Load the Mermaid file content
    const response = await fetch(filePath);
    const text = await response.text();
    return text;
  }

  // static async createFromFile(filePath = '/conversation-flow.mermaid') {
  async createFromFile(filePath) {
    if (!filePath) {
      throw ('No file source given');
    }
    const interpreter = new MermaidInterpreter();
    // const flowchartText = await FlowchartLoader.loadFromFile(filePath); // old
    const flowchartText = await this.loadFromFile(filePath);
    await interpreter.interpret(flowchartText);
    return interpreter;
  }

  async interpret(mermaidText) {
    // console.log(mermaidText);
    console.log('🔍 Interpreting Mermaid flowchart...');
    this.flowchartStructure = this.parseMermaidSyntax(mermaidText);
    this.currentPosition = {
      nodeId: this.findStartNode(),
      nodeType: 'question',
      waitingForResponse: true
    };
    this.isReady = true;
    console.log(`✅ Mermaid interpreted: ${this.flowchartStructure.nodes.size} nodes, ${this.flowchartStructure.edges.length} edges`);
  }

  parseMermaidSyntax(text) {
    // console.log(text);
    const nodes = new Map();
    const edges = [];
    
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('flowchart') && !line.startsWith('%%'));
    
    // Phase 1: Extract all nodes
    for (const line of lines) {
      const questionMatch = line.match(/(\w+)\{([^}]+)\}/);
      const keywordMatch = line.match(/(\w+)\["([^"]+)"\]/);
      // console.log(`q: ${questionMatch}, k: ${keywordMatch}`);

      if (questionMatch) {
        const [, nodeId, text] = questionMatch;
        nodes.set(nodeId, {
          id: nodeId,
          type: 'question',
          text: text,
          outgoingEdges: [],
          categories: new Map()
        });
      }
      
      if (keywordMatch) {
        const [, nodeId, keywordString] = keywordMatch;
        nodes.set(nodeId, {
          id: nodeId,
          type: 'keywords',
          text: keywordString,
          keywords: keywordString.split(',').map(k => k.trim()),
          outgoingEdges: []
        });
      }
    }
    
    // Phase 2: Extract all edges/connections
    for (const line of lines) {
      const categoryEdgeMatch = line.match(/(\w+)\s*-->\s*\|([^|]+)\|\s*(\w+)/);
      const directEdgeMatch = line.match(/(\w+)\s*-->\s*(\w+)/);
      
      if (categoryEdgeMatch) {
        const [, fromId, label, toId] = categoryEdgeMatch;
        const edge = {
          from: fromId,
          to: toId,
          label: label.trim(),
          type: 'category',
          category: this.normalizeCategory(label.trim())
        };
        edges.push(edge);
        if (nodes.has(fromId)) {
          nodes.get(fromId).outgoingEdges.push(edge);
        }
      } else if (directEdgeMatch) {
        const [, fromId, toId] = directEdgeMatch;
        const edge = {
          from: fromId,
          to: toId,
          type: 'direct'
        };
        edges.push(edge);
        if (nodes.has(fromId)) {
          nodes.get(fromId).outgoingEdges.push(edge);
        }
      }
    }
    
    // Phase 3: Build question categories from edges
    this.buildQuestionCategories(nodes);
    
    return { nodes, edges };
  }

  buildQuestionCategories(nodes) {
    for (const [nodeId, node] of nodes) {
      if (node.type === 'question') {
        for (const edge of node.outgoingEdges) {
          if (edge.type === 'category') {
            const targetNode = nodes.get(edge.to);
            if (targetNode && targetNode.type === 'keywords') {
              node.categories.set(edge.category, {
                name: edge.label,
                keywords: targetNode.keywords,
                keywordNodeId: edge.to,
                nextPath: this.findNextNodeFromKeywords(targetNode)
              });
            }
          }
        }
      }
    }
  }

  findNextNodeFromKeywords(keywordNode) {
    const nextEdge = keywordNode.outgoingEdges.find(edge => edge.type === 'direct');
    return nextEdge ? nextEdge.to : null;
  }

  normalizeCategory(text) {
    return text.toUpperCase().replace(/\s+/g, '_');
  }

  findStartNode() {
    for (const [nodeId, node] of this.flowchartStructure.nodes) {
      if (node.type === 'question') {
        return nodeId;
      }
    }
    return null;
  }

  // Navigation methods
  getCurrentNode() {
    return this.flowchartStructure.nodes.get(this.currentPosition.nodeId);
  }

  getCurrentQuestion() {
    const currentNode = this.getCurrentNode();
    
    if (!currentNode || currentNode.type !== 'question') {
      return null;
    }

    const categories = {};
    currentNode.categories.forEach((categoryData, categoryKey) => {
      categories[categoryKey] = {
        keywords: categoryData.keywords,
        sampleInputs: [`Example: ${categoryData.name}`]
      };
    });

    return {
      id: currentNode.id,
      type: 'classification',
      question: currentNode.text.slice(1,-1),
      categories: categories,
      clarificationResponse: `Could you tell me more about: ${currentNode.text.toLowerCase()}`,
      defaultCategory: Array.from(currentNode.categories.keys())[0] || 'UNKNOWN'
    };
  }

  // Navigate based on classification result
  navigateToCategory(category) {
    const currentNode = this.getCurrentNode();
    if (!currentNode || currentNode.type !== 'question') {
      return { success: false, error: 'Not at a question node' };
    }

    const categoryData = currentNode.categories.get(category);
    if (!categoryData) {
      return { success: false, error: `Category ${category} not found` };
    }

    // Record navigation
    this.navigationHistory.push({
      from: this.currentPosition.nodeId,
      category: category,
      timestamp: Date.now()
    });

    // Move to keyword node first
    this.currentPosition.nodeId = categoryData.keywordNodeId;
    this.currentPosition.nodeType = 'keywords';

    // Then immediately move to next question if available
    if (categoryData.nextPath) {
      const nextNode = this.flowchartStructure.nodes.get(categoryData.nextPath);
      this.currentPosition.nodeId = categoryData.nextPath;
      this.currentPosition.nodeType = nextNode?.type || 'unknown';
      this.currentPosition.waitingForResponse = nextNode?.type === 'question';
    }

    return { success: true, newPosition: this.currentPosition };
  }

  isAtQuestion() {
    return this.currentPosition.nodeType === 'question' && this.currentPosition.waitingForResponse;
  }

  isComplete() {
    const currentNode = this.getCurrentNode();
    return currentNode?.text?.toLowerCase().includes('complete') ||
           currentNode?.text?.toLowerCase().includes('conversation complete');
  }

  shouldTriggerAction() {
    const currentNode = this.getCurrentNode();
    if (!currentNode) return null;
    
    const text = currentNode.text.toLowerCase();
    if (text.includes('breathing app')) return 'LAUNCH_BREATHING';
    if (text.includes('activities')) return 'SHOW_ACTIVITIES';
    if (text.includes('emergency')) return 'EMERGENCY_PROTOCOL';
    return null;
  }

  // Debug and introspection
  getStructureInfo() {
    return {
      totalNodes: this.flowchartStructure?.nodes.size || 0,
      totalEdges: this.flowchartStructure?.edges.length || 0,
      questionNodes: Array.from(this.flowchartStructure?.nodes || [])
        .filter(([, node]) => node.type === 'question').length,
      keywordNodes: Array.from(this.flowchartStructure?.nodes || [])
        .filter(([, node]) => node.type === 'keywords').length,
      currentPosition: this.currentPosition,
      navigationSteps: this.navigationHistory.length
    };
  }
}

// ============================================================================
// EXAMPLE: How Keywords Flow from Mermaid to NLP Parser
// ============================================================================

/*
1. MERMAID CHART:
   Safety{Are you safe?} -->|Safe| SafeWords["safe, shelter, home, okay"]
   Safety -->|Danger| DangerWords["help, trapped, danger, emergency"]

2. MERMAID INTERPRETER BUILDS:
   questionData = {
     categories: {
       SAFE: { keywords: ["safe", "shelter", "home", "okay"] },
       DANGER: { keywords: ["help", "trapped", "danger", "emergency"] }
     }
   }

3. USER INPUT: "I'm at home and feeling okay"

4. NLP PARSER SCORES:
   - SAFE category: matches "home" + "okay" → high score
   - DANGER category: no matches → low score
   - Result: SAFE category selected

5. CHANGE KEYWORDS: Edit .mermaid file keywords, parser automatically adapts!
*/

export class NLPParser {
  constructor() {
    this.plugins = [];
    this.setupCompromiseExtensions();
  }
  registerPlugin(pluginFn) {
    this.plugins.push(pluginFn);
  }
  setupCompromiseExtensions() {
    // Generic compromise.js setup - NO hardcoded domain knowledge
    // All keywords come from the flowchart
    nlp.extend({
      // Only general linguistic patterns, no domain-specific keywords
      intensifiers: ['very', 'really', 'extremely', 'totally', 'completely', 'absolutely'],
      negations: ['not', 'no', 'never', 'none', 'nothing', 'cant', 'wont', 'dont'],
      uncertainty: ['maybe', 'perhaps', 'possibly', 'might', 'could', 'think', 'guess']
    });
  }

  // Main classification method - uses ONLY keywords from flowchart
  classifyInput(userInput, questionData) {
    // Classifies user input
    // const doc = nlp(userInput);
    // const text = userInput.toLowerCase();
    const doc = nlp(userInput.toLowerCase());
    const text = userInput.toLowerCase();
    console.log('the doc is ', doc);
    console.log('the text is ', text);

    // Perform NLP analysis using only generic linguistic features
    const nlpAnalysis = this.performGenericAnalysis(doc, text);
    
    // Score categories using ONLY keywords from the flowchart
    const scores = this.scoreFlowchartCategories(text, doc, questionData.categories, nlpAnalysis);
    
    // Select best match
    const bestMatch = this.selectBestCategory(scores, questionData);
    
    return {
      type: 'classification',
      category: bestMatch.category,
      confidence: bestMatch.confidence,
      matchedKeywords: bestMatch.matchedElements,
      nlpAnalysis: nlpAnalysis,
      reasoning: bestMatch.reasoning,
      alternativeScores: scores.filter(s => s.category !== bestMatch.category)
    };
  }

  performGenericAnalysis(doc, text) {
    // Generic linguistic analysis - no domain-specific knowledge
    let pluginResults = {};
    for (const plugin of this.plugins) {
      const result = plugin(text, doc);
      pluginResults = { ...pluginResults, ...result };
    }
    //const semanticAnalysis = analyzeText(text);  
     console.log('the doc is ', doc);
     console.log('the text is ', text);
     console.log('the Sentiment is ', semanticAnalysis);
    return {
      sentiment: pluginResults.sentiment || semanticAnalysis.sentiment || 0,  
      // sentiment: doc.sentiment().out('normal'),
      //sentiment: 'negative',
      // sentiment: doc.sentiment, // isn't this supposed to be a number?
      // sentiment: Math.random(),
      entities: {
        people: doc.people().out('array'),
        places: doc.places().out('array'),
        organizations: doc.organizations().out('array')
      },
      linguistic: {
        emotions: doc.match('#Emotion').out('array'), // Generic emotion detection
        intensifiers: doc.match('(very|really|extremely|totally|completely|absolutely)').out('array'),
        negations: doc.has('#Negative'),
        uncertainties: doc.match('(maybe|perhaps|possibly|might|could|think|guess)').out('array'),
        questions: doc.questions().out('array'),
        verbs: doc.verbs().out('array'),
        adjectives: doc.adjectives().out('array'),
        length: text.length,
        wordCount: text.split(/\s+/).length
      }
    };
  }

  scoreFlowchartCategories(text, doc, flowchartCategories, nlpAnalysis) {
    const scores = [];

    // Score each category using ONLY the keywords from the flowchart
    for (const [categoryKey, categoryData] of Object.entries(flowchartCategories)) {
      let score = 0;
      let matchedElements = [];
      
      // 1. Direct keyword matching from flowchart (40% weight)
      for (const keyword of categoryData.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 0.4;
          matchedElements.push(`flowchart-keyword: ${keyword}`);
        }
      }
      
      // 2. Lemmatized matching of flowchart keywords (30% weight)
      for (const keyword of categoryData.keywords) {
        const keywordDoc = nlp(keyword);
        const lemma = keywordDoc.verbs().toInfinitive().text() || 
                     keywordDoc.nouns().toSingular().text() || keyword;
        
        if (doc.has(lemma) && lemma !== keyword && !text.includes(keyword.toLowerCase())) {
          score += 0.3;
          matchedElements.push(`flowchart-lemma: ${lemma}`);
        }
      }
      
      // 3. Semantic similarity to flowchart keywords (20% weight)
      const semanticScore = this.calculateFlowchartSemanticScore(doc, categoryData.keywords, nlpAnalysis);
      score += semanticScore * 0.20;
      if (semanticScore > 0.1) {
        matchedElements.push(`semantic-similarity: ${semanticScore.toFixed(2)}`);
      }
      
      // 4. Generic linguistic patterns (10% weight)
      const linguisticScore = this.calculateGenericLinguisticScore(nlpAnalysis, categoryKey);
      score += linguisticScore * 0.10;
      if (linguisticScore > 0.1) {
        matchedElements.push(`linguistic: ${linguisticScore.toFixed(2)}`);
      }
      
      scores.push({
        category: categoryKey,
        score: score,
        matchedElements: matchedElements
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  calculateFlowchartSemanticScore(doc, flowchartKeywords, nlpAnalysis) {
    let score = 0;
    
    // Check if any flowchart keywords appear in different forms in the text
    for (const keyword of flowchartKeywords) {
      const keywordDoc = nlp(keyword);
      
      // Check for synonyms or related words using compromise.js
      if (keywordDoc.has('#Emotion') && nlpAnalysis.linguistic.emotions.length > 0) {
        score += 0.2;
      }
      
      if (keywordDoc.has('#Place') && nlpAnalysis.entities.places.length > 0) {
        score += 0.3;
      }
      
      // Check for semantic relationships
      const keywordSentiment = keywordDoc.sentiment().out('normal');
      if (Math.abs(keywordSentiment - nlpAnalysis.sentiment) < 0.3) {
        score += 0.1;
      }
    }
    
    return Math.min(1.0, score);
  }

  calculateGenericLinguisticScore(nlpAnalysis, categoryKey) {
    let score = 0;
    
    // Generic patterns that don't rely on hardcoded knowledge
    
    // Sentiment-based scoring
    if (nlpAnalysis.sentiment > 0.3) {
      // Positive sentiment might indicate categories with positive keywords
      score += 0.1;
    } else if (nlpAnalysis.sentiment < -0.3) {
      // Negative sentiment might indicate categories with negative keywords  
      score += 0.1;
    }
    
    // Uncertainty patterns
    if (nlpAnalysis.linguistic.uncertainties.length > 0) {
      // If category name suggests uncertainty (contains "unsure", "maybe", etc.)
      if (categoryKey.toLowerCase().includes('unsure') || 
          categoryKey.toLowerCase().includes('uncertain') ||
          categoryKey.toLowerCase().includes('maybe')) {
        score += 0.3;
      }
    }
    
    // Intensity patterns  
    if (nlpAnalysis.linguistic.intensifiers.length > 0) {
      // If category suggests high intensity
      if (categoryKey.toLowerCase().includes('high') || 
          categoryKey.toLowerCase().includes('extreme') ||
          categoryKey.toLowerCase().includes('severe')) {
        score += 0.2;
      }
    }
    
    // Length-based patterns
    if (nlpAnalysis.linguistic.wordCount > 10) {
      // Longer responses might indicate more complex categories
      score += 0.05;
    }
    
    // Question patterns
    if (nlpAnalysis.linguistic.questions.length > 0) {
      // Questions often indicate uncertainty
      if (categoryKey.toLowerCase().includes('unsure') || 
          categoryKey.toLowerCase().includes('uncertain')) {
        score += 0.2;
      }
    }
    
    return Math.min(1.0, score);
  }

  selectBestCategory(scores, questionData) {
    if (scores.length === 0) {
      return {
        category: questionData.defaultCategory,
        confidence: 0.3,
        matchedElements: [],
        reasoning: 'No categories available from flowchart'
      };
    }

    const bestScore = scores[0];
    
    // Dynamic confidence calculation based on score distribution
    let confidence = Math.min(0.95, Math.max(0.3, bestScore.score));
    
    // Boost confidence if there's a clear winner
    if (scores.length > 1) {
      const secondBest = scores[1];
      const margin = bestScore.score - secondBest.score;
      if (margin > 0.3) {
        confidence = Math.min(0.95, confidence + 0.1);
      }
    }
    
    // Require minimum threshold for meaningful classification
    const threshold = 0.15;
    if (bestScore.score < threshold) {
      return {
        category: questionData.defaultCategory,
        confidence: 0.3,
        matchedElements: [],
        reasoning: `Best score ${bestScore.score.toFixed(3)} below threshold ${threshold}, using default category from flowchart`
      };
    }

    return {
      category: bestScore.category,
      confidence: confidence,
      matchedElements: bestScore.matchedElements,
      reasoning: `Best flowchart match: ${bestScore.category} (score: ${bestScore.score.toFixed(3)}). Elements: ${bestScore.matchedElements.join(', ')}`
    };
  }

  // Method for extraction-type questions
  extractInformation(userInput, questionData) {
    const doc = nlp(userInput);
    
    switch (questionData.informationType) {
      case 'location':
        const places = doc.places().out('array');
        if (places.length > 0) {
          return {
            type: 'extraction',
            extractedValue: places[0],
            confidence: 0.8,
            informationType: 'location',
            extractionMethod: 'compromise.js places()'
          };
        }
        
        // Fallback to nouns
        const nouns = doc.nouns().out('array');
        return {
          type: 'extraction',
          extractedValue: nouns[0] || userInput.trim(),
          confidence: nouns.length > 0 ? 0.6 : 0.4,
          informationType: 'location',
          extractionMethod: 'compromise.js nouns() fallback'
        };
        
      default:
        return {
          type: 'extraction',
          extractedValue: userInput.trim(),
          confidence: 0.5,
          informationType: questionData.informationType,
          extractionMethod: 'direct text'
        };
    }
  }
}

// ============================================================================
// CONVERSATION CONTROLLER - Coordinates interpreter and parser
// ============================================================================

export class ConversationController {
  constructor(filePath) {
    this.interpreter = null;
    this.nlpParser = new NLPParser();    
    this.nlpParser.registerPlugin((text, doc) => analyzeText(text));
    this.isReady = false;
    this.scriptPath = filePath || null;
    // this.firstNode = null
  }

  // static async createFromFile(filePath = '/src/conversation_flows/conversation-flow.mermaid') {
  // static async createFromFile() { // what is the use of this??
  //   // this.scriptPath = filePath;
  //   const controller = new ConversationController();
  //   // await controller.initialize(filePath);
  //   await controller.initialize();
  //   return controller;
  // }

  // async initialize(filePath) {
  async initialize() {
    console.log('🚀 Initializing conversation controller...');
    // this.interpreter = await mermaidInterpreter.createFromFile(filePath);
    const mermaidInterpreter = new MermaidInterpreter()
    this.interpreter = await mermaidInterpreter.createFromFile(this.scriptPath); // Creates a MermaidInterpreter instance
    // this.firstNode = await mermaidInterpreter.getCurrentQuestion();
    // if (!this.firstNode){

    // }
    this.isReady = true;
    console.log('✅ Conversation controller ready');
  }

  getCurrentQuestion() {
    // bad
    // if (!this.isReady || !this.interpreter.isAtQuestion()) {
    //   return null;
    // }
    
    // return this.interpreter.getCurrentQuestion();

    // Fixed
    if (!this.scriptPath) { // No file path defined
      return null
    }  // initiation has occurred once
    // if (!this.isReady || this.interpreter === null) {
    //   this.scriptPath = filePath;
    //   this.initialize()
    //   return null;
    // }
    // At this point, TypeScript knows this.interpreter is definitely MermaidInterpreter
    if (!this.interpreter.isAtQuestion()) {
      return null;
    }
    return this.interpreter.getCurrentQuestion();
  }

  processUserInput(userInput) {
    if (!this.isReady) {
      return { success: false, error: 'Controller not ready' };
    }


    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      return { success: false, error: 'Not at a question' };
    }
    console.log('user input: ', userInput, '\ncurrent question: ', currentQuestion);
    // Use NLP parser to understand input
    // let result;
    // if (currentQuestion.type === 'classification') {
    //   result = this.nlpParser.classifyInput(userInput, currentQuestion);
    // } else {
    //   result = this.nlpParser.extractInformation(userInput, currentQuestion);
    // }
    let result = this.nlpParser.classifyInput(userInput, currentQuestion);
    if (currentQuestion.type !== 'classification') {
     result = this.nlpParser.extractInformation(userInput, currentQuestion);
    }
    console.log('user Input was classified as ', result);

    // Use interpreter to navigate
    if (result.type === 'classification') {
      console.log('old current position ', this.interpreter.currentPosition);
      const navigationResult = this.interpreter.navigateToCategory(result.category);
      console.log('navigation to ', result.category);
      console.log('new current position ', this.interpreter.currentPosition);
      if (!navigationResult.success) {
        return { success: false, error: navigationResult.error };
      }
    }

    return {
      success: true,
      classification: result,
      shouldTriggerAction: this.interpreter.shouldTriggerAction(),
      isComplete: this.interpreter.isComplete(),
      debugInfo: {
        interpreterInfo: this.interpreter.getStructureInfo(),
        currentPosition: this.interpreter.currentPosition
      }
    };
  }

  // Development helpers
  async reloadFlowchart() {
    console.log('🔄 Reloading flowchart...');
    this.interpreter = await MermaidInterpreter.createFromFile(this.filePath);
    console.log('✅ Flowchart reloaded');
  }

  getDebugInfo() {
    return {
      ready: this.isReady,
      interpreter: this.interpreter?.getStructureInfo(),
      currentQuestion: this.getCurrentQuestion()
    };
  }

  // async getFirstNode(){
  //   this.firstNode = await MermaidInterpreter.flowchartStructure;
  //   return this.firstNode
  // }
}

// ============================================================================
// USAGE IN APP COMPONENT
// ============================================================================

// Updated App component usage:
/*
function App() {
  const [conversationController, setConversationController] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initController = async () => {
      try {
        setLoading(true);
        const controller = await ConversationController.createFromFile('/conversation-flow.mermaid');
        setConversationController(controller);
        console.log('✅ Conversation system initialized');
      } catch (err) {
        console.error('❌ Failed to initialize conversation system:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    initController();
  }, []);

  // Clean separation of concerns
  const getCurrentQuestion = () => {
    return conversationController?.getCurrentQuestion();
  };

  const getResult = () => {
    if (!userInput.trim() || !conversationController) return;
    
    const result = conversationController.processUserInput(userInput);
    
    if (result.success) {
      setResult(result.classification);
      
      if (result.shouldTriggerAction === 'LAUNCH_BREATHING') {
        setShouldAutoLaunchApp(true);
        // ... breathing app logic
      }
      
      if (result.isComplete) {
        setCurrentStep('complete');
      }
      
      console.log('Processing result:', result.debugInfo);
    } else {
      console.error('Failed to process input:', result.error);
    }
    
    setUserInput('');
  };
  

  // Development helper
  const reloadFlowchart = async () => {
    if (conversationController) {
      await conversationController.reloadFlowchart();
      console.log('Debug info:', conversationController.getDebugInfo());
    }
  };

  // Your existing JSX...
}
*/
/* 
===============================================
ARCHITECTURE BENEFITS: MERMAID-DRIVEN NLP
===============================================

✅ SINGLE SOURCE OF TRUTH:
   - All conversation logic lives in conversation-flow.mermaid
   - Keywords, categories, paths all defined in one place
   - No scattered hardcoded knowledge across components

✅ EASY CONTENT UPDATES:
   - Change keywords: Edit .mermaid file only
   - Add new categories: Edit .mermaid file only  
   - Modify conversation flow: Edit .mermaid file only
   - No code changes needed!

✅ TESTABLE COMPONENTS:
   - Test Mermaid Interpreter parsing independently
   - Test NLP Parser classification with any keywords
   - Test Conversation Controller orchestration
   - Each component has single responsibility

✅ FLEXIBLE & REUSABLE:
   - Same NLP Parser works with any flowchart
   - Same Interpreter works with any NLP approach
   - Easy to swap components without affecting others

✅ CLEAR DATA FLOW:
   Mermaid File → Interpreter (structure) → Parser (keywords) → Controller (orchestration) → App

This architecture ensures your conversation system is driven entirely by the 
flowchart content, making it easy to maintain and modify without code changes.
*/