// crisis-analyzer.js

import nlp from 'compromise';

// Extend Compromise with custom crisis language patterns and corrections
const crisisPlugin = {
  patterns: {
    // Safety patterns
    '#Negative? (safe|secure|protected|okay)': 'SafetyState',
    '(trapped|stuck|locked)': 'DangerState',
    '(help|emergency|danger|attack)': 'DangerState',
    '(siren|rocket|bomb|explosion)': 'DangerIndicator',
    '(shelter|bunker|safe room|basement)': 'SafeLocation',

    // Stress/panic patterns
    "can't breathe": 'PanicSymptom',
    'racing (heart|pulse)': 'PanicSymptom',
    '(shaking|trembling|spinning)': 'PanicSymptom',
    'losing control': 'PanicSymptom',
    'going to die': 'PanicSymptom',
    '(panic|panicking)': 'PanicState',
    '(anxious|worried|nervous|tense|stress|stressed)': 'AnxiousState',
    '(calm|stable|better|managing)': 'CalmState',

    // Location patterns
    'at #Place': 'LocationPhrase',
    'in #Place': 'LocationPhrase',
    'from #Place': 'LocationPhrase',
    '#Value #Place': 'Address',
  },
  // Fix common misclassifications
  words: {
    'stressed': 'Adjective',
    'worried': 'Adjective',
    'anxious': 'Adjective',
    'overwhelmed': 'Adjective',
    'panicked': 'Adjective',
    'scared': 'Adjective',
    'frightened': 'Adjective',
    'terrified': 'Adjective'
  },
  api: (Doc) => {
    Doc.prototype.customSentiment = function() {
      const doc = this;
      const tags = doc.tags().out('array');
      const hasNegation = doc.has('#Negative');

      let sentiment = 'neutral';
      if (tags.includes('DangerState') || tags.includes('DangerIndicator') || tags.includes('PanicSymptom')) {
        sentiment = 'negative';
      } else if (tags.includes('SafetyState') || tags.includes('CalmState')) {
        sentiment = hasNegation ? 'negative' : 'positive';
      }
      return sentiment;
    }
  }
};

// Initialize Compromise with custom plugin
nlp.plugin(crisisPlugin);

/**
 * @param {import('compromise').Document} doc
 * @returns {import('compromise').Document}
 */
function applyCrisisPatterns(doc) {
  // Apply each pattern manually
  Object.entries(crisisPlugin.patterns).forEach(([pattern, tag]) => {
    const matches = doc.match(pattern);
    if (matches.found) {
      matches.tag(tag);
    }
  });
  return doc;
}

/**
 * @typedef {Object} SemanticAnalysis
 * @property {'positive' | 'negative' | 'neutral'} sentiment
 * @property {string[]} negations
 * @property {{places: string[], people: string[], numbers: string[]}} entities
 * @property {string[]} tags
 * @property {string[]} phrases
 */

/**
 * @param {string} text
 * @returns {SemanticAnalysis}
 */
export function analyzeText(text) {
  const doc = applyCrisisPatterns(nlp(text));

  // Analyze sentiment based on negations and positive/negative terms
  const negations = doc.match('#Negative').out('array');
  const hasNegation = negations.length > 0;

  // Get all custom tags we've identified
  const jsonData = doc.json();
  const tags = [];
  jsonData.forEach((sentence) => {
    if (sentence.terms) {
      sentence.terms.forEach((term) => {
        if (term.tags) {
          tags.push(...term.tags);
        }
      });
    }
  });

  // Extract entities
  const places = doc.places().out('array');
  const people = doc.people().out('array');
  const numbers = doc.values().out('array');

  // Get noun phrases and verb phrases for better understanding
  const phrases = doc.match('#Determiner? #Adjective* #Noun+').out('array');

  // Determine overall sentiment
  let sentiment = 'neutral';

  if (tags.includes('DangerState') || tags.includes('DangerIndicator') || tags.includes('PanicSymptom')) {
    sentiment = 'negative';
  } else if (tags.includes('SafetyState') || tags.includes('CalmState')) {
    sentiment = hasNegation ? 'negative' : 'positive';
  }

  return {
    sentiment,
    negations,
    entities: {
      places,
      people,
      numbers
    },
    tags,
    phrases
  };
}

/**
 * @typedef {Object} ClassificationResult
 * @property {string} category
 * @property {number} confidence
 * @property {string} reasoning
 */

/**
 * @param {string} text
 * @returns {ClassificationResult}
 */
export function classifySafety(text) {
  const doc = nlp(text);
  const analysis = analyzeText(text);

  // Check for explicit safety/danger indicators
  const hasSafeWords = doc.has('(safe|secure|protected|okay|fine)');
  const hasDangerWords = doc.has('(danger|help|emergency|trapped|attack)');
  const hasDangerIndicators = doc.has('(siren|rocket|bomb|explosion)');
  const hasSafeLocation = doc.has('(shelter|bunker|safe room|home)');
  const hasNegation = analysis.negations.length > 0;

  // Semantic understanding of phrases
  const isAskingForHelp = doc.has('(help|save|rescue)') && !doc.has('no #Negative help');
  const isInDanger = hasDangerWords || hasDangerIndicators || isAskingForHelp;

  // Handle negations properly
  const negatedSafety = hasSafeWords && hasNegation; // "not safe", "not okay"
  const confirmedSafety = hasSafeWords && !hasNegation && !isInDanger;

  let category = 'UNSURE';
  let confidence = 0.5;
  let reasoning = '';

  if (negatedSafety || isInDanger) {
    category = 'DANGER';
    confidence = isAskingForHelp || hasDangerIndicators ? 0.9 : 0.8;
    reasoning = negatedSafety ? 'Negated safety statement' : 'Danger indicators present';
  } else if (confirmedSafety || (hasSafeLocation && !isInDanger)) {
    category = 'SAFE';
    confidence = hasSafeLocation ? 0.85 : 0.75;
    reasoning = 'Positive safety indicators';
  } else if (doc.has('(maybe|perhaps|think|unsure|confused)')) {
    category = 'UNSURE';
    confidence = 0.6;
    reasoning = 'Uncertainty expressed';
  }

  return { category, confidence, reasoning };
}

/**
 * @param {string} text
 * @returns {ClassificationResult}
 */
export function classifyStress(text) {
  const doc = applyCrisisPatterns(nlp(text));
  const analysis = analyzeText(text);

  let stressLevel = 0;
  let confidence = 0.7;
  let reasoning = [];

  // Use semantic tags from the NLP plugin
  if (analysis.tags.includes('PanicSymptom') || analysis.tags.includes('PanicState')) {
    stressLevel += 6;
    reasoning.push('panic indicators detected');
  }

  if (analysis.tags.includes('AnxiousState')) {
    stressLevel += 3;
    reasoning.push('anxiety detected');
  }

  if (analysis.tags.includes('CalmState')) {
    // Check for negations
    if (analysis.negations.length > 0) {
      stressLevel += 3;
      reasoning.push('negated calm state');
    } else {
      stressLevel -= 2;
      reasoning.push('calm state detected');
    }
  }

  // Use sentiment analysis
  if (analysis.sentiment === 'negative') {
    stressLevel += 2;
    reasoning.push('negative sentiment');
  } else if (analysis.sentiment === 'positive') {
    stressLevel -= 1;
    reasoning.push('positive sentiment');
  }

  // Look for intensifiers with any stress-related content
  const intensifiers = doc.match('(very|extremely|really|quite|super|highly|high|severely|deeply|incredibly|terribly)');
  if (intensifiers.found && (stressLevel > 0 || doc.has('stress'))) {
    const intensifierWords = intensifiers.out('array');
    stressLevel += intensifierWords.length * 2;
    reasoning.push(`intensified: ${intensifierWords.join(', ')}`);
  }

  // Special patterns for crisis situations
  if (doc.has("can't breathe") || doc.has("cannot breathe")) {
    stressLevel += 6;
    reasoning.push('breathing difficulty');
  }

  if (doc.has('(heart|pulse) (racing|pounding|fast)')) {
    stressLevel += 4;
    reasoning.push('cardiac symptoms');
  }

  if (doc.has('(dying|die|death)')) {
    stressLevel += 5;
    reasoning.push('mortality fears');
  }

  if (doc.has('losing control') || doc.has('out of control')) {
    stressLevel += 4;
    reasoning.push('loss of control');
  }

  // Convert stress level to category
  let category;
  if (stressLevel >= 5) {
    category = 'HIGH_STRESS';
    confidence = Math.min(0.9, 0.7 + (stressLevel - 5) * 0.05);
  } else if (stressLevel >= 2) {
    category = 'MODERATE_STRESS';
    confidence = 0.75;
  } else {
    category = 'LOW_STRESS';
    confidence = 0.8;
  }

  return {
    category,
    confidence,
    reasoning: reasoning.length > 0 ? reasoning.join('; ') : 'General assessment'
  };
}

/**
 * @typedef {Object} ExtractionResult
 * @property {string} extractedValue
 * @property {number} confidence
 * @property {string} extractionMethod
 */

/**
 * @param {string} text
 * @returns {ExtractionResult}
 */
export function extractLocation(text) {
  const doc = nlp(text);
  const analysis = analyzeText(text);

  // Try different extraction methods in order of preference

  // 1. Look for explicit place names
  if (analysis.entities.places.length > 0) {
    return {
      extractedValue: analysis.entities.places.join(', '),
      confidence: 0.9,
      extractionMethod: 'Named place extraction'
    };
  }

  // 2. Look for location patterns with prepositions
  const locationPhrases = doc.match('(at|in|from) #Determiner? #Adjective* #Noun+').out('array');
  if (locationPhrases.length > 0) {
    // Remove the preposition from the extracted value
    const location = locationPhrases[0].replace(/^(at|in|from)\s+/i, '');
    return {
      extractedValue: location,
      confidence: 0.85,
      extractionMethod: 'Prepositional phrase extraction'
    };
  }

  // 3. Look for common location words
  const commonLocations = doc.match('(home|house|apartment|office|shelter|bunker|building|hospital|school)').out('text');
  if (commonLocations) {
    return {
      extractedValue: commonLocations,
      confidence: 0.8,
      extractionMethod: 'Common location word'
    };
  }

  // 4. Look for addresses (numbers followed by text)
  const addresses = doc.match('#Value #Noun+').out('array');
  if (addresses.length > 0) {
    return {
      extractedValue: addresses[0],
      confidence: 0.75,
      extractionMethod: 'Address pattern'
    };
  }

  // 5. If nothing specific found, return the cleaned text
  const cleaned = text.trim();
  return {
    extractedValue: cleaned,
    confidence: cleaned.length > 2 ? 0.5 : 0.2,
    extractionMethod: 'Full text fallback'
  };
}
