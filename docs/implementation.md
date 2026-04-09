# **CALMe** Trauma Response App - Implementation Guide

## Important Notes

### Visual Design Disclaimer
**🎨 The CSS styling examples throughout this guide are technical placeholders demonstrating implementation patterns only. All visual design elements including colors, fonts, layouts, spacing, animations, and overall aesthetic choices are intentionally generic and will be completely redesigned by the graphic designer.**

**This implementation guide specifies:**
- ✅ Technical architecture and operational patterns
- ✅ Component structure and functionality  
- ✅ Responsive design implementation techniques
- ✅ RTL/internationalization technical requirements
- ✅ Accessibility and browser compatibility approaches

**This implementation guide does NOT specify:**
- ❌ Visual appearance or aesthetic design
- ❌ Color schemes, typography, or branding
- ❌ Visual hierarchy or design language
- ❌ User interface aesthetics or visual styling

The technical implementation supports any visual design the graphic designer chooses to implement.

---

## Table of Contents
1. [Development Environment Setup](#1-development-environment-setup)
2. [Social Worker Integration Process](#2-social-worker-integration-process)
3. [Natural Language Parser Implementation](#3-natural-language-parser-implementation)
4. [Conversation Manager Implementation](#4-conversation-manager-implementation)
5. [React Frontend Implementation](#5-react-frontend-implementation)
6. [Activity System Implementation](#6-activity-system-implementation)
7. [PWA Implementation](#7-pwa-implementation)
8. [Internationalization Implementation](#8-internationalization-implementation)
9. [Testing Implementation](#9-testing-implementation)
10. [Build and Deployment](#10-build-and-deployment)

---

## 1. Development Environment Setup

### 1.1 Prerequisites

**System Requirements:**
- Node.js 18+ 
- npm 9+ or yarn 3+
- Modern browser with developer tools
- VS Code or similar editor

**Target Specifications:**
- Total App Size: ~50MB including all content
- Frontend build: ~2MB
- Compromise.js: ~2MB
- Videos (480p H.264): ~35MB for 15 minutes total
- Minimum Browser: Chrome 70+, Safari 11.3+, Firefox 65+
- RAM Usage: <150MB active memory

### 1.2 Project Initialization

```bash
# Create new project
npm create vite@latest trauma-response-app -- --template react
cd trauma-response-app

# Install core dependencies
npm install react react-dom react-i18next i18next compromise

# Install PWA and build dependencies
npm install -D vite-plugin-pwa @vitejs/plugin-react

# Install development dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

### 1.3 Project Structure Setup

```bash
# Create project structure
mkdir -p src/{components,activities,i18n/locales,tests}
mkdir -p public/{conversations,videos,subtitles,audio,icons}

# Create initial files
touch src/parser.js
touch src/conversationManager.js
touch src/components/ConversationInterface.jsx
touch src/components/PWAInstall.jsx
touch public/conversations/safety_check.json
touch public/conversations/stress_assessment.json
```

### 1.4 Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4,vtt,mp3,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/localhost/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-content',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ],
        navigateFallback: null,
        offlineGoogleAnalytics: false
      },
      manifest: {
        name: 'Emergency Support App',
        short_name: 'Emergency Support',
        description: 'Trauma response and crisis support application - fully offline',
        theme_color: '#4A90E2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          i18n: ['react-i18next', 'i18next'],
          nlp: ['compromise']
        }
      }
    }
  }
});
```

---

## 2. Social Worker Integration Process

### 2.1 Conversation Data Structure Design

The social worker provides conversation maps that need to be converted into JSON format. Here's how to structure the data:

```javascript
// public/conversations/safety_check.json
{
  "SAFETY_1": {
    "id": "SAFETY_1",
    "type": "classification",
    "text": {
      "en": "Hi there. First, I need to know - are you currently in a safe place?",
      "he": "שלום. קודם כל, אני צריך לדעת - האם אתה נמצא במקום בטוח כרגע?"
    },
    "categories": {
      "SAFE": {
        "sampleResponses": {
          "en": [
            "Yes I'm safe",
            "I'm in the shelter now", 
            "We made it home",
            "I'm okay",
            "Finally inside and secure",
            "yes we're all fine here",
            "Everything's chaotic but we're protected",
            "Scared but we found shelter",
            "We're okay, just shaken up"
          ],
          "he": [
            "כן אני בטוח",
            "אני במקלט עכשיו",
            "הגענו הביתה", 
            "אני בסדר",
            "סוף סוף בפנים ובטוח",
            "כן כולנו בסדר כאן",
            "הכל מטורף אבל אנחנו מוגנים",
            "מפחד אבל מצאנו מקלט"
          ]
        },
        "description": {
          "en": "User confirms they are currently safe through semantic indicators",
          "he": "המשתמש מאשר שהוא כרגע בטוח דרך אינדיקטורים סמנטיים"
        },
        "response": {
          "en": "Good, I'm relieved you're safe. Now I need to know more details about your location.",
          "he": "טוב, אני נרגע שאתה בטוח. עכשיו אני צריך לדעת פרטים נוספים על המיקום שלך."
        },
        "next": "LOCATION_1",
        "actions": []
      },
      "DANGER": {
        "sampleResponses": {
          "en": [
            "No",
            "Still hearing sirens",
            "Help", 
            "There are explosions",
            "Can't find shelter",
            "We're trapped outside",
            "Everything's falling apart and I don't know what to do",
            "I can hear them getting closer",
            "This is terrifying and I can't get to safety"
          ],
          "he": [
            "לא",
            "עדיין שומע צפירות",
            "עזרה",
            "יש פיצוצים", 
            "לא מוצא מקלט",
            "אנחנו לכודים בחוץ",
            "הכל מתמוטט ואני לא יודע מה לעשות",
            "אני שומע אותם מתקרבים"
          ]
        },
        "description": {
          "en": "User indicates they are in danger through semantic analysis",
          "he": "המשתמש מציין שהוא בסכנה דרך ניתוח סמנטי"
        },
        "response": {
          "en": "I understand. Your safety is most important. Follow your emergency protocol. I'm switching to silent mode.",
          "he": "אני מבין. הבטיחות שלך היא הכי חשובה. עקוב אחר פרוטוקול החירום. אני עובר למצב שקט."
        },
        "next": "EMERGENCY_CHECKLIST",
        "actions": ["ENABLE_SILENT_MODE"]
      },
      "UNSURE": {
        "sampleResponses": {
          "en": [
            "I think so?",
            "Not sure",
            "Maybe",
            "Hard to tell", 
            "idk the sirens stopped but",
            "might be safe now",
            "Things seem quiet but I'm not really sure",
            "I don't really know how to tell"
          ],
          "he": [
            "אני חושב שכן?",
            "לא בטוח",
            "אולי",
            "קשה לדעת",
            "לא יודע הצפירות נפסקו אבל",
            "אולי בטוח עכשיו",
            "נראה שקט אבל אני לא באמת בטוח"
          ]
        },
        "description": {
          "en": "User is uncertain about their safety based on semantic uncertainty indicators",
          "he": "המשתמש לא בטוח לגבי הבטיחות שלו על בסיס אינדיקטורים סמנטיים של אי-ודאות"
        },
        "response": {
          "en": "Let's make sure you're safe. Are you inside a building or shelter right now?",
          "he": "בואו נוודא שאתה בטוח. האם אתה בתוך בניין או מקלט עכשיו?"
        },
        "next": "SAFETY_2",
        "actions": ["REDUCE_NOTIFICATIONS"]
      }
    },
    "clarificationPrompt": {
      "en": "I want to make sure I understand your situation. Can you tell me - are you somewhere safe right now?",
      "he": "אני רוצה לוודא שאני מבין את המצב שלך. אתה יכול להגיד לי - האם אתה במקום בטוח עכשיו?"
    },
    "contextHelp": {
      "en": "Users may be panicked and give unclear responses. Look for safety indicators vs danger signals.",
      "he": "משתמשים עלולים להיות בפאניקה ולתת תגובות לא ברורות. חפש אינדיקטורים לבטיחות מול אותות סכנה."
    },
    "default": "UNSURE"
  },

  "LOCATION_1": {
    "id": "LOCATION_1",
    "type": "extraction",
    "text": {
      "en": "Can you describe where you are right now? Include any landmarks, street names, or details that could help locate you.",
      "he": "תוכל לתאר איפה אתה נמצא עכשיו? כלול ציוני דרך, שמות רחובות או פרטים שיכולים לעזור לאתר אותך."
    },
    "extractionRules": {
      "en": {
        "location": {
          "type": "location",
          "priority": "high"
        },
        "landmark": {
          "type": "location", 
          "priority": "medium"
        },
        "personCount": {
          "type": "person_count", 
          "priority": "low"
        }
      },
      "he": {
        "location": {
          "type": "location",
          "priority": "high"
        },
        "landmark": {
          "type": "location",
          "priority": "medium"
        },
        "personCount": {
          "type": "person_count",
          "priority": "low"
        }
      }
    },
    "requiredFields": ["location"],
    "sampleResponses": {
      "en": [
        "I'm under the overpass on route 4 with some friends",
        "At the central bus station, third floor",
        "In the basement of our apartment building on King George street",
        "Behind the shopping mall, there's a parking garage here",
        "We ended up taking shelter in some underground parking thing near that big hospital everyone goes to, there's maybe 6 of us here",
        "I'm not really sure exactly where but it's like a concrete building near the train tracks",
        "Somewhere downtown, we're in what looks like an old office building basement"
      ],
      "he": [
        "אני מתחת לגשר בכביש 4 עם כמה חברים",
        "בתחנה המרכזית, קומה שלישית", 
        "במרתף של הבניין שלנו ברחוב המלך ג'ורג'",
        "מאחורי הקניון, יש כאן חניון",
        "הגענו למקלט באיזה חניון תת קרקעי ליד בית החולים הגדול, יש אולי 6 מאיתנו כאן",
        "אני לא באמת בטוח איפה בדיוק אבל זה כמו בניין בטון ליד מסילת הרכבת"
      ]
    },
    "response": {
      "en": "Thank you for the location details. Now, how many people are with you?",
      "he": "תודה על פרטי המיקום. עכשיו, כמה אנשים איתך?"
    },
    "clarificationPrompt": {
      "en": "I need more specific location information. Can you tell me the name of the street, building, or nearest landmark?",
      "he": "אני צריך מידע מיקום יותר ספציפי. תוכל להגיד לי שם של רחוב, בניין או ציון דרך הכי קרוב?"
    },
    "next": "GROUP_SIZE_1"
  }
}
```

### 2.2 Social Worker Conversion Process

**Step 1: Receive Social Worker Input**
- Conversation map with question IDs and text in both English and Hebrew
- Response categories with sample user responses for each category
- Therapeutic responses and next question routing

**Step 2: Convert to Implementation Format**
```javascript
// From social worker's table format:
// Category: SAFE | Keywords EN: safe, yes, secure | Keywords HE: בטוח, כן, מוגן
// Sample EN: "Yes I'm safe" | Sample HE: "כן אני בטוח"

// To developer JSON:
const convertSocialWorkerData = (socialWorkerTable) => {
  return {
    [questionId]: {
      id: questionId,
      type: socialWorkerTable.questionType, // "classification" or "extraction"
      text: {
        en: socialWorkerTable.questionText.en,
        he: socialWorkerTable.questionText.he
      },
      categories: socialWorkerTable.categories.map(category => ({
        [category.id]: {
          sampleResponses: {
            en: category.sampleResponses.en,
            he: category.sampleResponses.he
          },
          response: {
            en: category.therapeuticResponse.en,
            he: category.therapeuticResponse.he
          },
          next: category.nextQuestion,
          actions: category.actions || []
        }
      })),
      clarificationPrompt: {
        en: socialWorkerTable.clarificationPrompt.en,
        he: socialWorkerTable.clarificationPrompt.he
      }
    }
  };
};
```

**Step 3: Validate and Test**
```javascript
// Test each question with sample responses
const validateConversationData = async (conversationData) => {
  for (const [questionId, questionNode] of Object.entries(conversationData)) {
    console.log(`Testing question: ${questionId}`);
    
    for (const [categoryId, categoryData] of Object.entries(questionNode.categories)) {
      for (const sampleResponse of categoryData.sampleResponses.en) {
        const result = await parser.parse(sampleResponse, questionNode, 'en');
        console.log(`Sample: "${sampleResponse}" -> ${result.category}`);
      }
    }
  }
};
```

---

## 3. Natural Language Parser Implementation

### 3.1 Core Parser Setup

```javascript
// src/parser.js
import nlp from 'compromise';

class LocalCompromiseParser {
  constructor() {
    this.modelReady = false;
    this.patterns = {};
    this.conversationData = null;
  }

  async init() {
    try {
      console.log('Loading local language understanding...');
      
      // Load conversation data from bundled files (no network access)
      this.conversationData = await this.loadLocalConversations();
      
      // Load custom patterns for crisis language
      await this.loadCrisisPatterns();
      
      // Load Hebrew language support
      await this.loadHebrewSupport();
      
      this.modelReady = true;
      console.log('Local parser ready - no network required');
    } catch (error) {
      console.error('Failed to load local parser:', error);
      throw new Error('Cannot initialize local language parser');
    }
  }

  async loadLocalConversations() {
    try {
      // These files are bundled with the app during build
      const safetyCheck = await import('../public/conversations/safety_check.json');
      const stressAssessment = await import('../public/conversations/stress_assessment.json');
      
      return {
        safety_check: safetyCheck.default,
        stress_assessment: stressAssessment.default
      };
    } catch (error) {
      console.error('Failed to load local conversation data:', error);
      throw error;
    }
  }

  async loadCrisisPatterns() {
    // Define semantic patterns for crisis understanding
    this.semanticPatterns = {
      emotional_states: {
        distress: {
          indicators: ['negative_emotion', 'overwhelming_feeling', 'loss_of_control'],
          semantic_markers: ['overwhelm', 'chaos', 'cant_handle', 'breaking_down']
        },
        coping: {
          indicators: ['trying', 'managing', 'holding_together'],
          semantic_markers: ['effort', 'responsibility', 'perseverance']
        },
        safety_seeking: {
          indicators: ['need_help', 'looking_for_safety', 'protection'],
          semantic_markers: ['shelter', 'protection', 'escape']
        }
      },
      contextual_roles: {
        caregiver: ['kids', 'children', 'family', 'responsibility'],
        isolated: ['alone', 'nobody', 'by_myself'],
        group_member: ['we', 'us', 'together', 'others']
      }
    };
  }

  async loadHebrewSupport() {
    // Hebrew semantic understanding
    this.hebrewSemantics = {
      emotional_expressions: {
        distress_patterns: ['מתמוטט', 'לא מצליח', 'נשבר'],
        coping_patterns: ['מחזיק מעמד', 'מנסה', 'נאבק'],
        family_responsibility: ['הילדים', 'המשפחה', 'אחראי']
      },
      location_semantics: {
        shelter_types: ['מקלט', 'מרתף', 'חניון תת קרקעי'],
        landmark_types: ['בית חולים', 'תחנה מרכזית', 'קניון'],
        proximity_indicators: ['ליד', 'בסביבת', 'קרוב ל']
      }
    };
  }

  detectLanguage(text) {
    const hebrewPattern = /[\u0590-\u05FF]/;
    return hebrewPattern.test(text) ? 'he' : 'en';
  }
}

export default LocalCompromiseParser;
```

### 3.2 Classification Parser Implementation

```javascript
// Add to LocalCompromiseParser class

async parse(userInput, questionNode, language = 'en') {
  if (!this.modelReady) {
    throw new Error('Local parser not ready');
  }

  const detectedLang = language || this.detectLanguage(userInput);
  let doc = nlp(userInput);
  
  if (questionNode.type === 'classification') {
    return this.parseClassification(doc, questionNode, detectedLang);
  } else if (questionNode.type === 'extraction') {
    return this.parseExtraction(doc, questionNode, detectedLang);
  } else {
    throw new Error(`Unknown question type: ${questionNode.type}`);
  }
}

parseClassification(doc, questionNode, language) {
  const semanticAnalysis = this.performSemanticAnalysis(doc, language);
  const categoryMatch = this.findSemanticCategory(semanticAnalysis, questionNode, language);
  return categoryMatch;
}

performSemanticAnalysis(doc, language) {
  const analysis = {
    sentiment: doc.sentiment(),
    emotions: this.extractEmotionalState(doc, language),
    intent: this.extractIntent(doc, language),
    context: this.extractContext(doc, language),
    certainty: this.assessCertainty(doc, language),
    social_context: this.extractSocialContext(doc, language)
  };

  return analysis;
}

extractEmotionalState(doc, language) {
  const emotions = [];
  
  const sentiment = doc.sentiment();
  const terms = doc.terms();
  
  // Analyze emotional intensity and type
  if (sentiment.score < -0.3) {
    emotions.push('distress');
    if (doc.has('#Negative')) emotions.push('negative_affect');
  }
  
  // Check for coping language
  if (doc.has(['try', 'manage', 'handle']) || doc.has(['מנסה', 'מנהל', 'מתמודד'])) {
    emotions.push('coping_effort');
  }
  
  // Detect overwhelm through semantic patterns
  const overwhelmIndicators = doc.match('(can not|cannot|cant) * (handle|take|bear)');
  if (overwhelmIndicators.length > 0) {
    emotions.push('overwhelmed');
  }
  
  // Hebrew emotional expressions
  if (language === 'he') {
    if (doc.has(['מתמוטט', 'נשבר', 'לא יכול יותר'])) {
      emotions.push('breakdown');
    }
  }
  
  return emotions;
}

extractIntent(doc, language) {
  const intents = [];
  
  if (doc.has(['need', 'want', 'looking for']) || doc.has(['צריך', 'רוצה', 'מחפש'])) {
    intents.push('seeking_help');
  }
  
  if (doc.has(['here', 'at', 'in']) || doc.has(['כאן', 'ב', 'ליד'])) {
    intents.push('providing_location');
  }
  
  if (doc.match('(is this|will i|am i) * (okay|normal|safe)').length > 0) {
    intents.push('seeking_reassurance');
  }
  
  return intents;
}

assessCertainty(doc, language) {
  let certaintyScore = 0.5; // Neutral baseline
  
  if (doc.has(['definitely', 'absolutely', 'certain']) || doc.has(['בהחלט', 'בוודאי', 'בטוח'])) {
    certaintyScore += 0.3;
  }
  
  if (doc.has(['maybe', 'possibly', 'think', 'guess']) || doc.has(['אולי', 'יכול להיות', 'חושב'])) {
    certaintyScore -= 0.2;
  }
  
  if (doc.text().includes('?') || doc.has(['um', 'uh', 'well'])) {
    certaintyScore -= 0.1;
  }
  
  return Math.max(0, Math.min(1, certaintyScore));
}

findSemanticCategory(analysis, questionNode, language) {
  const categoryScores = {};
  
  for (const [categoryId, categoryData] of Object.entries(questionNode.categories)) {
    let score = 0;
    
    const sampleResponses = categoryData.sampleResponses[language] || categoryData.sampleResponses.en;
    
    // Semantic similarity with sample responses
    for (const sample of sampleResponses) {
      const sampleDoc = nlp(sample);
      const similarity = this.calculateSemanticSimilarity(analysis, sampleDoc, language);
      score = Math.max(score, similarity);
    }
    
    // Boost score based on semantic indicators
    if (categoryId === 'SAFE' && analysis.emotions.includes('coping_effort')) score += 0.2;
    if (categoryId === 'DANGER' && analysis.emotions.includes('distress')) score += 0.3;
    if (categoryId === 'UNSURE' && analysis.certainty < 0.3) score += 0.4;
    
    categoryScores[categoryId] = score;
  }
  
  const bestCategory = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (!bestCategory || bestCategory[1] < 0.4) {
    return {
      category: 'NEEDS_CLARIFICATION',
      confidence: bestCategory ? bestCategory[1] : 0,
      semantic_analysis: analysis
    };
  }
  
  return {
    category: bestCategory[0],
    confidence: bestCategory[1],
    semantic_analysis: analysis
  };
}

calculateSemanticSimilarity(userAnalysis, sampleDoc, language) {
  let similarity = 0;
  
  // Sentiment similarity
  const sampleSentiment = sampleDoc.sentiment();
  const sentimentDiff = Math.abs(userAnalysis.sentiment.score - sampleSentiment.score);
  similarity += (1 - sentimentDiff) * 0.3;
  
  // Intent overlap
  const sampleIntent = this.extractIntent(sampleDoc, language);
  const intentOverlap = userAnalysis.intent.filter(i => sampleIntent.includes(i)).length;
  similarity += (intentOverlap / Math.max(userAnalysis.intent.length, 1)) * 0.4;
  
  // Emotional state overlap
  const sampleEmotions = this.extractEmotionalState(sampleDoc, language);
  const emotionOverlap = userAnalysis.emotions.filter(e => sampleEmotions.includes(e)).length;
  similarity += (emotionOverlap / Math.max(userAnalysis.emotions.length, 1)) * 0.3;
  
  return similarity;
}
```

### 3.3 Extraction Parser Implementation

```javascript
// Add to LocalCompromiseParser class

parseExtraction(doc, questionNode, language) {
  const extractedData = {};
  const extractionRules = questionNode.extractionRules[language] || questionNode.extractionRules.en;
  
  // Extract each required field using semantic understanding
  for (const [fieldName, rule] of Object.entries(extractionRules)) {
    extractedData[fieldName] = this.extractFieldSemantically(doc, rule, language);
  }
  
  const completeness = this.calculateCompleteness(extractedData, questionNode.requiredFields);
  
  return {
    type: 'extraction',
    data: extractedData,
    completeness: completeness,
    needsClarification: completeness < 0.7,
    clarifyPrompt: completeness < 0.7 ? questionNode.clarificationPrompt[language] : null
  };
}

extractFieldSemantically(doc, rule, language) {
  const { type, priority } = rule;
  
  switch (type) {
    case 'location':
      return this.extractLocationSemantically(doc, language);
    case 'person_count':
      return this.extractPersonCountSemantically(doc, language);
    case 'symptoms':
      return this.extractSymptomsSemantically(doc, language);
    case 'time':
      return this.extractTimeSemantically(doc, language);
    case 'number':
      return this.extractNumberSemantically(doc, language);
    default:
      return this.extractGenericSemantically(doc, rule, language);
  }
}

extractLocationSemantically(doc, language) {
  const locationData = {
    specific_location: null,
    location_type: null,
    reference_points: [],
    certainty: 'unknown'
  };
  
  // Use Compromise.js NER for places
  const places = doc.places().out('array');
  if (places.length > 0) {
    locationData.specific_location = places[0];
    locationData.certainty = 'high';
  }
  
  // Semantic analysis for location types
  const locationType = this.inferLocationType(doc, language);
  if (locationType) {
    locationData.location_type = locationType;
  }
  
  // Extract reference points through context
  const references = this.extractLocationReferences(doc, language);
  locationData.reference_points = references;
  
  // Assess location certainty through linguistic cues
  if (doc.has(['somewhere', 'some', 'kind of']) || doc.has(['איפשהו', 'סוג של'])) {
    locationData.certainty = 'low';
  } else if (doc.has(['exactly', 'precisely']) || doc.has(['בדיוק', 'במדויק'])) {
    locationData.certainty = 'high';
  }
  
  return locationData;
}

extractPersonCountSemantically(doc, language) {
  const personData = {
    count: null,
    certainty: 'unknown',
    social_context: null
  };
  
  // Extract explicit numbers
  const numbers = doc.numbers();
  if (numbers.length > 0) {
    personData.count = numbers.first().toNumber();
    personData.certainty = 'explicit';
  }
  
  // Semantic inference from pronouns and context
  const pronouns = doc.pronouns();
  if (pronouns.has('we') || doc.has('אנחנו')) {
    personData.count = personData.count || 'multiple';
    personData.social_context = 'group';
  } else if (pronouns.has('i') || doc.has('אני')) {
    if (doc.has(['alone', 'by myself']) || doc.has(['לבד', 'בעצמי'])) {
      personData.count = 1;
      personData.social_context = 'alone';
      personData.certainty = 'inferred';
    }
  }
  
  return personData;
}

calculateCompleteness(extractedData, requiredFields) {
  if (!requiredFields || requiredFields.length === 0) return 1.0;
  
  const filledFields = Object.values(extractedData).filter(value => 
    value !== null && value !== undefined && value !== ''
  ).length;
  
  return filledFields / requiredFields.length;
}
```

---

## 4. Conversation Manager Implementation

```javascript
// src/conversationManager.js
import LocalCompromiseParser from './parser.js';

class LocalConversationManager {
  constructor() {
    this.parser = new LocalCompromiseParser();
    this.currentNode = 'SAFETY_1';
    this.conversationId = 'safety_check';
    this.history = [];
    this.extractedData = {};
    this.mode = 'NORMAL';
    this.initialized = false;
  }

  async init() {
    try {
      await this.parser.init();
      this.loadLocalState();
      this.initialized = true;
      console.log('Conversation manager ready - fully offline');
    } catch (error) {
      console.error('Failed to initialize conversation manager:', error);
      throw error;
    }
  }

  async processInput(userInput, language = 'en') {
    if (!this.initialized) {
      throw new Error('Conversation manager not initialized');
    }

    const questionNode = this.parser.getLocalConversationNode(this.conversationId, this.currentNode);
    if (!questionNode) {
      throw new Error('Question not found in local data');
    }

    const parseResult = await this.parser.parse(userInput, questionNode, language);
    
    if (questionNode.type === 'classification') {
      return this.handleClassificationResult(parseResult, questionNode, userInput, language);
    } else if (questionNode.type === 'extraction') {
      return this.handleExtractionResult(parseResult, questionNode, userInput, language);
    } else {
      throw new Error(`Unknown question type: ${questionNode.type}`);
    }
  }

  handleClassificationResult(parseResult, questionNode, userInput, language) {
    if (parseResult.category === 'NEEDS_CLARIFICATION') {
      return {
        type: 'clarification',
        text: parseResult.clarifyPrompt || questionNode.clarificationPrompt[language],
        needsClarification: true,
        nextNode: this.currentNode
      };
    }
    
    const responseData = questionNode.categories[parseResult.category];
    
    this.addToHistory({
      q: questionNode.id,
      input: userInput.substring(0, 50),
      type: 'classification',
      result: parseResult.category,
      confidence: parseResult.confidence,
      time: Date.now()
    });
    
    this.executeActions(responseData.actions || []);
    
    this.currentNode = responseData.next;
    this.saveLocalState();
    
    return {
      type: 'classification_response',
      text: responseData.response[language] || responseData.response.en,
      nextNode: responseData.next,
      needsClarification: false,
      category: parseResult.category,
      confidence: parseResult.confidence
    };
  }

  handleExtractionResult(parseResult, questionNode, userInput, language) {
    if (parseResult.needsClarification) {
      return {
        type: 'extraction_clarification',
        text: parseResult.clarifyPrompt || questionNode.clarificationPrompt[language],
        needsClarification: true,
        nextNode: this.currentNode,
        extractedSoFar: parseResult.data,
        completeness: parseResult.completeness
      };
    }

    this.addToHistory({
      q: questionNode.id,
      input: userInput.substring(0, 50),
      type: 'extraction',
      data: parseResult.data,
      completeness: parseResult.completeness,
      time: Date.now()
    });

    this.extractedData[questionNode.id] = parseResult.data;
    
    let responseText = questionNode.response[language] || questionNode.response.en;
    
    // Replace {{field}} placeholders with extracted data
    for (const [field, value] of Object.entries(parseResult.data)) {
      if (value !== null && value !== undefined) {
        responseText = responseText.replace(`{{${field}}}`, value);
      }
    }
    
    this.currentNode = questionNode.next;
    this.saveLocalState();
    
    return {
      type: 'extraction_response',
      text: responseText,
      nextNode: questionNode.next,
      needsClarification: false,
      extractedData: parseResult.data,
      completeness: parseResult.completeness
    };
  }

  executeActions(actions) {
    for (const action of actions) {
      if (action === 'ENABLE_SILENT_MODE') {
        this.mode = 'SILENT';
        document.body.classList.add('silent-mode');
      } else if (action === 'REDUCE_NOTIFICATIONS') {
        this.mode = 'QUIET';
      }
    }
  }

  addToHistory(interaction) {
    this.history.push(interaction);
    if (this.history.length > 20) {
      this.history.shift();
    }
  }

  loadLocalState() {
    try {
      const saved = localStorage.getItem('conversation_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.currentNode = state.currentNode || 'SAFETY_1';
        this.conversationId = state.conversationId || 'safety_check';
        this.history = state.history || [];
        this.mode = state.mode || 'NORMAL';
      }
    } catch (error) {
      console.warn('Failed to load local state:', error);
    }
  }

  saveLocalState() {
    try {
      const state = {
        currentNode: this.currentNode,
        conversationId: this.conversationId,
        history: this.history,
        mode: this.mode,
        lastSaved: Date.now()
      };
      localStorage.setItem('conversation_state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save local state:', error);
    }
  }

  getCurrentQuestion(language = 'en') {
    const questionNode = this.parser.getLocalConversationNode(this.conversationId, this.currentNode);
    if (!questionNode) {
      return null;
    }
    
    return {
      id: questionNode.id,
      text: questionNode.text[language] || questionNode.text.en,
      isValid: true
    };
  }

  reset() {
    this.currentNode = 'SAFETY_1';
    this.conversationId = 'safety_check';
    this.history = [];
    this.mode = 'NORMAL';
    this.saveLocalState();
  }
}

export default LocalConversationManager;
```

---

## 5. React Frontend Implementation

**⚠️ IMPLEMENTATION FOCUS: This section demonstrates component structure, state management, and user interaction patterns. The CSS styling shown is for technical demonstration only - all visual design will be created by the graphic designer.**

### 5.1 Main Conversation Interface

```jsx
// src/components/ConversationInterface.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocalConversationManager from '../conversationManager.js';
import styles from './ConversationInterface.module.css';

const ConversationInterface = () => {
  const { t, i18n } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manager, setManager] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeManager();
  }, []);

  const initializeManager = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newManager = new LocalConversationManager();
      await newManager.init();
      
      setManager(newManager);
      
      const firstQuestion = newManager.getCurrentQuestion(i18n.language);
      if (firstQuestion) {
        setCurrentQuestion(firstQuestion);
        setConversation([{
          type: 'question',
          text: firstQuestion.text,
          id: firstQuestion.id
        }]);
      }
      
    } catch (error) {
      console.error('Failed to initialize:', error);
      setError('Failed to initialize app. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || loading || !manager) return;

    setLoading(true);
    setError(null);
    
    setConversation(prev => [...prev, {
      type: 'user',
      text: userInput
    }]);

    try {
      const result = await manager.processInput(userInput, i18n.language);
      
      setConversation(prev => [...prev, {
        type: 'response',
        text: result.text,
        confidence: result.confidence
      }]);

      if (result.needsClarification) {
        setUserInput('');
      } else {
        if (result.nextNode) {
          if (result.nextNode.startsWith('ACTIVITY_')) {
            handleActivityTransition(result.nextNode);
          } else {
            const nextQuestion = manager.getCurrentQuestion(i18n.language);
            if (nextQuestion) {
              setCurrentQuestion(nextQuestion);
              setConversation(prev => [...prev, {
                type: 'question',
                text: nextQuestion.text,
                id: nextQuestion.id
              }]);
            }
            setUserInput('');
          }
        }
      }

    } catch (error) {
      console.error('Failed to process input:', error);
      setError('Processing failed. Please try again.');
      setConversation(prev => [...prev, {
        type: 'error',
        text: t('error.processingFailed')
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityTransition = (activityNode) => {
    const activityType = activityNode.split('_')[1].toLowerCase();
    console.log('Transitioning to activity:', activityType);
    sessionStorage.setItem('returnNode', manager.currentNode);
  };

  const isRTL = i18n.language === 'he';

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={initializeManager}>
          {t('ui.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isRTL ? styles.rtl : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.conversation}>
        {conversation.map((message, index) => (
          <div 
            key={index} 
            className={`${styles.message} ${styles[message.type]}`}
          >
            {message.text}
            {message.confidence && (
              <small className={styles.confidence}>
                {t('ui.confidence')}: {Math.round(message.confidence * 100)}%
              </small>
            )}
          </div>
        ))}
        {loading && (
          <div className={styles.loading}>
            {t('ui.processing')}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={t('ui.typeResponse')}
          className={styles.input}
          disabled={loading || !manager}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <button 
          type="submit" 
          disabled={loading || !userInput.trim() || !manager}
          className={styles.sendButton}
        >
          {t('ui.send')}
        </button>
      </form>
      
      <div className={styles.languageToggle}>
        <button 
          onClick={() => i18n.changeLanguage('en')}
          className={i18n.language === 'en' ? styles.active : ''}
        >
          English
        </button>
        <button 
          onClick={() => i18n.changeLanguage('he')}
          className={i18n.language === 'he' ? styles.active : ''}
        >
          עברית
        </button>
      </div>
      
      <div className={styles.offlineStatus}>
        {t('ui.fullyOffline')}
      </div>
    </div>
  );
};

export default ConversationInterface;
```

### 5.2 CSS Modules Styling

**⚠️ DESIGN DISCLAIMER: The following CSS examples are technical placeholders demonstrating implementation patterns only. All visual styling, colors, fonts, layouts, and aesthetic choices will be determined by the graphic designer. This section documents the technical approach to styling (CSS Modules, responsive design, RTL support) rather than prescribing actual appearance.**

```css
/* src/components/ConversationInterface.module.css 
   PLACEHOLDER STYLES - To be replaced by graphic designer */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container.rtl {
  direction: rtl;
}

.conversation {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  margin-bottom: 20px;
}

.message {
  margin: 12px 0;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
}

.message.question {
  background: #4A90E2;
  color: white;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.message.user {
  background: #E8F4FD;
  color: #333;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.rtl .message.user {
  margin-left: 0;
  margin-right: auto;
  align-self: flex-start;
}

.message.response {
  background: #F0F0F0;
  color: #333;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.message.error {
  background: #FFE6E6;
  color: #D32F2F;
  align-self: center;
  border: 1px solid #FFCDD2;
}

.confidence {
  display: block;
  margin-top: 8px;
  opacity: 0.7;
  font-size: 0.85em;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.inputForm {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #4A90E2;
}

.input:disabled {
  background: #F5F5F5;
  color: #999;
}

.sendButton {
  padding: 12px 24px;
  background: #4A90E2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sendButton:hover:not(:disabled) {
  background: #357ABD;
}

.sendButton:disabled {
  background: #CCCCCC;
  cursor: not-allowed;
}

.languageToggle {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  justify-content: center;
}

.languageToggle button {
  padding: 8px 16px;
  border: 1px solid #DDD;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.languageToggle button.active {
  background: #4A90E2;
  color: white;
  border-color: #4A90E2;
}

.offlineStatus {
  text-align: center;
  padding: 8px;
  background: #E8F5E8;
  color: #2E7D32;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
}

.error {
  text-align: center;
  padding: 40px 20px;
  background: #FFE6E6;
  border-radius: 12px;
  color: #D32F2F;
}

.error button {
  margin-top: 16px;
  padding: 12px 24px;
  background: #D32F2F;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

/* Silent mode styles */
body.silent-mode .container {
  background: #1a1a1a;
  color: #fff;
}

body.silent-mode .message.question {
  background: #333;
}

body.silent-mode .message.response {
  background: #2a2a2a;
  color: #fff;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }
  
  .message {
    max-width: 90%;
  }
  
  .inputForm {
    padding: 12px;
  }
  
  .input, .sendButton {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
```

---

## 6. Activity System Implementation

**⚠️ VISUAL DESIGN NOTE: The activity components below demonstrate technical functionality and interaction patterns. All visual styling, animations, colors, and aesthetic elements are placeholder examples. The graphic designer will determine the final visual presentation while maintaining the documented technical functionality.**

### 6.1 Breathing Exercise Component

```jsx
// src/components/activities/BreathingExercise.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './BreathingExercise.module.css';

const BreathingExercise = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const [phase, setPhase] = useState(0); // 0: inhale, 1: hold, 2: exhale
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(null);
  const [cycleCount, setCycleCount] = useState(0);

  const phases = [
    { 
      key: 'inhale', 
      duration: 4000, 
      text: { en: 'Breathe In...', he: 'שאף פנימה...' }
    },
    { 
      key: 'hold', 
      duration: 4000, 
      text: { en: 'Hold...', he: 'עצור...' }
    },
    { 
      key: 'exhale', 
      duration: 4000, 
      text: { en: 'Breathe Out...', he: 'נשף החוצה...' }
    }
  ];

  useEffect(() => {
    if (isActive) {
      const newTimer = setTimeout(() => {
        const newPhase = (phase + 1) % phases.length;
        setPhase(newPhase);
        
        // Count completed cycles
        if (newPhase === 0) {
          setCycleCount(prev => prev + 1);
        }
      }, phases[phase].duration);
      setTimer(newTimer);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, isActive]);

  const start = () => {
    setIsActive(true);
    setCycleCount(0);
  };
  
  const stop = () => {
    setIsActive(false);
    if (timer) clearTimeout(timer);
    onComplete?.();
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t('activities.breathing.title')}
      </h2>
      
      <div className={styles.breathingArea}>
        <div className={`${styles.circle} ${styles[phases[phase].key]} ${isActive ? styles.active : ''}`}>
          <div className={styles.innerCircle}>
            <span className={styles.phaseText}>
              {phases[phase].text[i18n.language] || phases[phase].text.en}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.instructions}>
        <p>{t('activities.breathing.instruction')}</p>
        {isActive && (
          <p className={styles.cycleCounter}>
            {t('activities.breathing.cycles')}: {cycleCount}
          </p>
        )}
      </div>
      
      <div className={styles.controls}>
        {!isActive ? (
          <button onClick={start} className={styles.startButton}>
            {t('activities.breathing.start')}
          </button>
        ) : (
          <button onClick={stop} className={styles.stopButton}>
            {t('ui.done')}
          </button>
        )}
      </div>
      
      <div className={styles.offlineNote}>
        {t('ui.fullyOffline')}
      </div>
    </div>
  );
};

export default BreathingExercise;
```

```css
/* src/components/activities/BreathingExercise.module.css 
   PLACEHOLDER STYLES - Visual design to be determined by graphic designer */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.title {
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 300;
}

.breathingArea {
  margin: 2rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 4s ease-in-out;
  position: relative;
}

.circle.active.inhale {
  transform: scale(1.3);
  background: rgba(100, 200, 255, 0.3);
  border-color: rgba(100, 200, 255, 0.6);
}

.circle.active.hold {
  transform: scale(1.3);
  background: rgba(255, 255, 100, 0.3);
  border-color: rgba(255, 255, 100, 0.6);
}

.circle.active.exhale {
  transform: scale(1.0);
  background: rgba(255, 150, 150, 0.3);
  border-color: rgba(255, 150, 150, 0.6);
}

.innerCircle {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.phaseText {
  font-size: 1.2rem;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.instructions {
  margin: 2rem 0;
  max-width: 400px;
}

.instructions p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.cycleCounter {
  font-size: 1rem;
  font-weight: 500;
  color: #FFE082;
}

.controls {
  margin: 2rem 0;
}

.startButton, .stopButton {
  padding: 15px 30px;
  font-size: 1.1rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.startButton {
  background: #4CAF50;
  color: white;
}

.startButton:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.stopButton {
  background: #FF6B6B;
  color: white;
}

.stopButton:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.offlineNote {
  margin-top: 2rem;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .circle {
    width: 150px;
    height: 150px;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .phaseText {
    font-size: 1rem;
  }
}
```

### 6.2 Video Exercise Component

```jsx
// src/components/activities/VideoExercise.jsx
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './VideoExercise.module.css';

const VideoExercise = ({ videoName, onComplete }) => {
  const { t, i18n } = useTranslation();
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onComplete?.();
  };

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    setError('Video failed to load');
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // Get localized video file from local bundle
  const getVideoSrc = () => {
    const baseUrl = '/videos/';
    const localizedName = `${videoName}_${i18n.language}`;
    return `${baseUrl}${localizedName}.mp4`;
  };

  const getSubtitleSrc = () => {
    return `/subtitles/${videoName}_${i18n.language}.vtt`;
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={onComplete} className={styles.doneButton}>
          {t('ui.done')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t('activities.video.title')}
      </h2>
      
      <div className={styles.videoContainer}>
        <video 
          ref={videoRef}
          width="100%" 
          controls 
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          onPlay={handlePlay}
          onPause={handlePause}
          className={styles.video}
        >
          <source src={getVideoSrc()} type="video/mp4" />
          <track 
            kind="subtitles" 
            srcLang={i18n.language} 
            src={getSubtitleSrc()}
            default
          />
          {t('error.videoNotSupported')}
        </video>
      </div>
      
      <div className={styles.instructions}>
        <p>{t('activities.video.instruction')}</p>
      </div>
      
      <button onClick={onComplete} className={styles.doneButton}>
        {t('ui.done')}
      </button>
      
      <div className={styles.offlineNote}>
        {t('ui.fullyOffline')}
      </div>
    </div>
  );
};

export default VideoExercise;
```

### 6.3 Memory Game Component

```jsx
// src/components/activities/MemoryGame.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MemoryGame.module.css';

const MemoryGame = ({ onComplete }) => {
  const { t } = useTranslation();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Simple card symbols that work across languages
  const symbols = ['🌸', '🌊', '🌳', '☀️', '🌙', '⭐', '🦋', '🌈'];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].symbol === cards[second].symbol) {
        setMatchedCards(prev => [...prev, first, second]);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
  }, [matchedCards, cards, onComplete]);

  const initializeGame = () => {
    // Create pairs of cards
    const gameSymbols = symbols.slice(0, 6); // Use 6 pairs for 12 cards
    const cardPairs = [...gameSymbols, ...gameSymbols];
    
    // Shuffle cards
    const shuffled = cardPairs
      .map((symbol, index) => ({ id: index, symbol }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameStarted(true);
  };

  const handleCardClick = (index) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(index)) return;
    if (matchedCards.includes(index)) return;
    
    setFlippedCards(prev => [...prev, index]);
  };

  const isCardVisible = (index) => {
    return flippedCards.includes(index) || matchedCards.includes(index);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t('activities.game.title')}
      </h2>
      
      <div className={styles.instructions}>
        <p>{t('activities.game.instruction')}</p>
        <p>{t('activities.game.moves')}: {moves}</p>
      </div>
      
      <div className={styles.gameBoard}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`${styles.card} ${isCardVisible(index) ? styles.flipped : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className={styles.cardInner}>
              <div className={styles.cardBack}>?</div>
              <div className={styles.cardFront}>{card.symbol}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.controls}>
        <button onClick={initializeGame} className={styles.restartButton}>
          {t('activities.game.restart')}
        </button>
        <button onClick={onComplete} className={styles.exitButton}>
          {t('ui.exitGame')}
        </button>
      </div>
      
      {matchedCards.length === cards.length && cards.length > 0 && (
        <div className={styles.completion}>
          <p>{t('activities.game.completed')} {moves} {t('activities.game.moves').toLowerCase()}</p>
        </div>
      )}
      
      <div className={styles.offlineNote}>
        {t('ui.fullyOffline')}
      </div>
    </div>
  );
};

export default MemoryGame;
```

---

## 7. PWA Implementation

### 7.1 Service Worker Implementation

```javascript
// public/sw.js
const CACHE_NAME = 'trauma-response-v1';
const OFFLINE_CACHE = 'offline-content-v1';

// All files that must be cached for offline operation
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/conversations/safety_check.json',
  '/conversations/stress_assessment.json',
  '/i18n/locales/en.json',
  '/i18n/locales/he.json',
  '/videos/breathing_3min_en.mp4',
  '/videos/breathing_3min_he.mp4',
  '/videos/grounding_5min_en.mp4',
  '/videos/grounding_5min_he.mp4',
  '/subtitles/breathing_3min_en.vtt',
  '/subtitles/breathing_3min_he.vtt',
  '/subtitles/grounding_5min_en.vtt',
  '/subtitles/grounding_5min_he.vtt',
  '/audio/bell.mp3',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache all essential files
self.addEventListener('install', event => {
  console.log('Service Worker installing - caching all essential files');
  
  event.waitUntil(
    caches.open(OFFLINE_CACHE)
      .then(cache => {
        console.log('Caching essential files for offline use');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('All essential files cached - app will work offline');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache essential files:', error);
        throw error;
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== OFFLINE_CACHE && cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service worker activated - app ready for offline use');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache ONLY (no network fallbacks)
self.addEventListener('fetch', event => {
  // Block any non-essential network requests
  if (event.request.url.includes('analytics') || 
      event.request.url.includes('tracking') ||
      event.request.url.includes('cdn.') ||
      event.request.url.includes('api.') && !event.request.url.includes(self.location.origin)) {
    console.log('Blocking external request:', event.request.url);
    event.respondWith(new Response('', { status: 204 }));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        // For local requests only, try to fetch and cache
        if (event.request.url.startsWith(self.location.origin)) {
          return fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(OFFLINE_CACHE)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return networkResponse;
            })
            .catch(() => {
              console.log('Local request failed - serving offline content');
              
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
              }
              
              return new Response('Offline', { 
                status: 200, 
                statusText: 'Offline Mode',
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        }
        
        // Block all external requests after setup
        console.log('Blocking external request after setup:', event.request.url);
        return new Response('External requests disabled in offline mode', { 
          status: 200,
          statusText: 'Offline Mode' 
        });
      })
  );
});

// Message handling for setup completion
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    caches.open(OFFLINE_CACHE)
      .then(cache => cache.keys())
      .then(keys => {
        event.ports[0].postMessage({
          cached: keys.length,
          total: ESSENTIAL_FILES.length,
          ready: keys.length >= ESSENTIAL_FILES.length
        });
      });
  }
});

console.log('Service Worker loaded - app configured for full offline operation');
```

### 7.2 PWA Installation Component

**⚠️ STYLING NOTE: CSS classes and basic layout structure shown for technical implementation. Visual design will be determined by graphic designer.**

```jsx
// src/components/PWAInstall.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PWAInstall.module.css';

const PWAInstall = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({ ready: false, cached: 0, total: 0 });
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    const checkCacheStatus = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          setCacheStatus(event.data);
        };
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATUS' }, 
          [messageChannel.port2]
        );
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    checkCacheStatus();
    const statusInterval = setInterval(checkCacheStatus, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearInterval(statusInterval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Support App',
          text: 'Download this emergency trauma support app - works completely offline',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.origin);
      alert('App link copied to clipboard');
    }
  };

  // Don't show if user dismissed or already installed
  if (!showInstallPrompt || 
      sessionStorage.getItem('installPromptDismissed') ||
      isInstalled) {
    return (
      <div className={styles.statusBar}>
        {isInstalled ? (
          <div className={styles.installedStatus}>
            ✓ {t('pwa.installed')}
          </div>
        ) : (
          <div className={styles.offlineStatus}>
            {cacheStatus.ready ? (
              <span>✓ {t('ui.fullyOffline')}</span>
            ) : (
              <span>Caching: {cacheStatus.cached}/{cacheStatus.total}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.installPrompt}>
      <div className={styles.content}>
        <h3>{t('pwa.install.title')}</h3>
        <p>{t('pwa.install.description')}</p>
        
        <div className={styles.cacheStatus}>
          {cacheStatus.ready ? (
            <div className={styles.ready}>
              ✓ {t('ui.fullyOffline')}
            </div>
          ) : (
            <div className={styles.caching}>
              {t('pwa.caching')}: {cacheStatus.cached}/{cacheStatus.total}
            </div>
          )}
        </div>
        
        <div className={styles.buttons}>
          <button 
            onClick={handleInstallClick}
            className={styles.installButton}
            disabled={!cacheStatus.ready}
          >
            {t('pwa.install.button')}
          </button>
          <button 
            onClick={handleShare}
            className={styles.shareButton}
          >
            {t('share.shareLink')}
          </button>
          <button 
            onClick={handleDismiss}
            className={styles.dismissButton}
          >
            {t('ui.notNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;
```

---

## 8. Internationalization Implementation

### 8.1 i18n Setup

```javascript
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly (bundled with app)
import enTranslations from './locales/en.json';
import heTranslations from './locales/he.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    // Resources are bundled with app - no network loading
    resources: {
      en: {
        translation: enTranslations
      },
      he: {
        translation: heTranslations
      }
    },
    
    detection: {
      // Only use localStorage and navigator - no network detection
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

### 8.2 Translation Files

```json
// src/i18n/locales/en.json
{
  "ui": {
    "typeResponse": "Type your response...",
    "send": "Send",
    "processing": "Understanding your response...",
    "loading": "Loading...",
    "retry": "Retry",
    "confidence": "Confidence",
    "fullyOffline": "✓ Fully offline - no network required",
    "done": "Done",
    "exitGame": "Exit Game",
    "notNow": "Not Now",
    "sharing": "Sharing...",
    "downloading": "Downloading..."
  },
  "error": {
    "processingFailed": "I'm having trouble understanding. Could you try rephrasing that?",
    "initializationFailed": "Failed to initialize app. Please refresh and try again.",
    "videoNotSupported": "Your browser doesn't support this video format."
  },
  "activities": {
    "breathing": {
      "title": "Breathing Exercise",
      "instruction": "Follow the circle with your breathing",
      "start": "Start Exercise",
      "cycles": "Cycles"
    },
    "video": {
      "title": "Guided Exercise",
      "instruction": "Watch and follow along"
    },
    "game": {
      "title": "Focus Game",
      "instruction": "Concentrate on the game to help calm your mind",
      "moves": "Moves",
      "restart": "Restart Game",
      "completed": "Completed in"
    }
  },
  "pwa": {
    "install": {
      "title": "Install Emergency Support App",
      "description": "Install this app on your device for quick access during emergencies",
      "button": "Install App"
    },
    "installed": "App Installed",
    "caching": "Downloading for offline use"
  },
  "share": {
    "title": "Share Emergency App",
    "description": "Share this emergency support app with others",
    "shareLink": "Share Link",
    "instructions": "To share this app in emergency situations:",
    "step1": "Click 'Share Link' to copy the download URL",
    "step2": "Send via text, email, or local WiFi",
    "step3": "Recipients can download and install immediately"
  }
}
```

```json
// src/i18n/locales/he.json
{
  "ui": {
    "typeResponse": "הקלד את תגובתך...",
    "send": "שלח",
    "processing": "מבין את התגובה שלך...",
    "loading": "טוען...",
    "retry": "נסה שוב",
    "confidence": "רמת ביטחון",
    "fullyOffline": "✓ פועל לחלוטין ללא אינטרנט",
    "done": "סיום",
    "exitGame": "יציאה מהמשחק",
    "notNow": "לא עכשיו",
    "sharing": "משתף...",
    "downloading": "מוריד..."
  },
  "error": {
    "processingFailed": "אני מתקשה להבין. תוכל לנסח את זה אחרת?",
    "initializationFailed": "נכשל בהפעלת האפליקציה. אנא רענן ונסה שוב.",
    "videoNotSupported": "הדפדפן שלך לא תומך בפורמט הוידאו הזה."
  },
  "activities": {
    "breathing": {
      "title": "תרגיל נשימה", 
      "instruction": "עקוב אחר העיגול עם הנשימה שלך",
      "start": "התחל תרגיל",
      "cycles": "מחזורים"
    },
    "video": {
      "title": "תרגיל מודרך",
      "instruction": "צפה ועקוב"
    },
    "game": {
      "title": "משחק ריכוז",
      "instruction": "התרכז במשחק כדי לעזור להרגיע את המוח שלך",
      "moves": "מהלכים",
      "restart": "התחל משחק מחדש",
      "completed": "הושלם ב"
    }
  },
  "pwa": {
    "install": {
      "title": "התקן אפליקציית תמיכה חירום",
      "description": "התקן אפליקציה זו על המכשיר שלך לגישה מהירה במצבי חירום",
      "button": "התקן אפליקציה"
    },
    "installed": "אפליקציה מותקנת",
    "caching": "מוריד לשימוש ללא אינטרנט"
  },
  "share": {
    "title": "שתף אפליקציית חירום",
    "description": "שתף אפליקציית תמיכת חירום זו עם אחרים",
    "shareLink": "שתף קישור",
    "instructions": "לשיתוף האפליקציה במצבי חירום:",
    "step1": "לחץ על 'שתף קישור' כדי להעתיק את כתובת ההורדה",
    "step2": "שלח באמצעות הודעות, אימייל או WiFi מקומי",
    "step3": "הנמענים יכולים להוריד ולהתקין מיד"
  }
}
```

### 8.3 RTL Support Implementation

**⚠️ TECHNICAL IMPLEMENTATION NOTE: This section demonstrates the technical patterns for implementing right-to-left (RTL) language support. Actual visual styling, typography choices, and layout aesthetics will be determined by the graphic designer.**

```css
/* src/index.css - Global RTL technical implementation patterns 
   PLACEHOLDER STYLES - Design aesthetics to be finalized by graphic designer */
[dir="rtl"] {
  text-align: right;
}

[dir="rtl"] .conversation {
  direction: rtl;
}

[dir="rtl"] .message.user {
  margin-right: 0;
  margin-left: auto;
  align-self: flex-start;
}

[dir="rtl"] .message.response {
  align-self: flex-end;
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .inputForm {
  direction: rtl;
}

[dir="rtl"] .input {
  text-align: right;
}

/* Hebrew-specific fonts */
[lang="he"] {
  font-family: "Noto Sans Hebrew", "Arial Hebrew", Arial, sans-serif;
  line-height: 1.6;
}

[lang="he"] .title {
  font-weight: 400; /* Hebrew fonts often need different font weights */
}

[lang="he"] .message {
  line-height: 1.7; /* Better readability for Hebrew text */
}
```

---

## 9. Testing Implementation

### 9.1 Parser Testing Suite

```javascript
// src/tests/parser.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import LocalCompromiseParser from '../parser.js';

describe('Natural Language Parser', () => {
  let parser;
  
  beforeAll(async () => {
    parser = new LocalCompromiseParser();
    await parser.init();
  });

  describe('Classification Questions', () => {
    const testQuestion = {
      id: "SAFETY_1",
      type: "classification",
      categories: {
        "SAFE": {
          sampleResponses: {
            en: ["Yes I'm safe", "I'm in the shelter now", "We made it home"],
            he: ["כן אני בטוח", "אני במקלט עכשיו", "הגענו הביתה"]
          }
        },
        "DANGER": {
          sampleResponses: {
            en: ["No", "Still hearing sirens", "Help"],
            he: ["לא", "עדיין שומע צפירות", "עזרה"]
          }
        },
        "UNSURE": {
          sampleResponses: {
            en: ["I think so?", "Not sure", "Maybe"],
            he: ["אני חושב שכן?", "לא בטוח", "אולי"]
          }
        }
      },
      clarificationPrompt: {
        en: "I want to make sure I understand your situation.",
        he: "אני רוצה לוודא שאני מבין את המצב שלך."
      }
    };

    it('should classify clear safety responses correctly in English', async () => {
      const testCases = [
        { input: "Yes I'm safe", expected: "SAFE" },
        { input: "we're ok but scared", expected: "SAFE" },
        { input: "finally inside and secure", expected: "SAFE" }
      ];

      for (const testCase of testCases) {
        const result = await parser.parse(testCase.input, testQuestion, 'en');
        expect(result.category).toBe(testCase.expected);
        expect(result.confidence).toBeGreaterThan(0.4);
      }
    });

    it('should classify danger responses correctly in English', async () => {
      const testCases = [
        { input: "No", expected: "DANGER" },
        { input: "Everything's falling apart and I don't know what to do", expected: "DANGER" },
        { input: "This is terrifying and I can't get to safety", expected: "DANGER" }
      ];

      for (const testCase of testCases) {
        const result = await parser.parse(testCase.input, testQuestion, 'en');
        expect(result.category).toBe(testCase.expected);
        expect(result.confidence).toBeGreaterThan(0.4);
      }
    });

    it('should handle Hebrew responses correctly', async () => {
      const testCases = [
        { input: "כן אני בטוח", expected: "SAFE" },
        { input: "לא", expected: "DANGER" },
        { input: "אולי", expected: "UNSURE" }
      ];

      for (const testCase of testCases) {
        const result = await parser.parse(testCase.input, testQuestion, 'he');
        expect(result.category).toBe(testCase.expected);
        expect(result.confidence).toBeGreaterThan(0.3);
      }
    });

    it('should request clarification for ambiguous responses', async () => {
      const ambiguousInputs = ["hmm", "uh", "what?", "..."];
      
      for (const input of ambiguousInputs) {
        const result = await parser.parse(input, testQuestion, 'en');
        expect(result.category).toBe('NEEDS_CLARIFICATION');
        expect(result.confidence).toBeLessThan(0.4);
      }
    });
  });

  describe('Extraction Questions', () => {
    const locationQuestion = {
      id: "LOCATION_1",
      type: "extraction",
      extractionRules: {
        en: {
          location: { type: "location", priority: "high" },
          personCount: { type: "person_count", priority: "low" }
        }
      },
      requiredFields: ["location"],
      clarificationPrompt: {
        en: "I need more specific location information."
      }
    };

    it('should extract location information correctly', async () => {
      const testCases = [
        {
          input: "I'm under the overpass on route 4 with some friends",
          expectedLocation: expect.objectContaining({
            specific_location: expect.any(String)
          }),
          expectedCount: expect.objectContaining({
            count: expect.any(String),
            social_context: "accompanied"
          })
        },
        {
          input: "At the central bus station, third floor",
          expectedLocation: expect.objectContaining({
            location_type: "transport_hub"
          })
        }
      ];

      for (const testCase of testCases) {
        const result = await parser.parse(testCase.input, locationQuestion, 'en');
        expect(result.type).toBe('extraction');
        expect(result.completeness).toBeGreaterThan(0.5);
        
        if (testCase.expectedLocation) {
          expect(result.data.location).toMatchObject(testCase.expectedLocation);
        }
        
        if (testCase.expectedCount) {
          expect(result.data.personCount).toMatchObject(testCase.expectedCount);
        }
      }
    });

    it('should request clarification for incomplete extractions', async () => {
      const incompleteInputs = ["somewhere", "not sure where", "around here"];
      
      for (const input of incompleteInputs) {
        const result = await parser.parse(input, locationQuestion, 'en');
        expect(result.needsClarification).toBe(true);
        expect(result.completeness).toBeLessThan(0.7);
      }
    });
  });

  describe('Language Detection', () => {
    it('should detect Hebrew text correctly', () => {
      const hebrewText = "שלום עולם";
      const language = parser.detectLanguage(hebrewText);
      expect(language).toBe('he');
    });

    it('should detect English text correctly', () => {
      const englishText = "Hello world";
      const language = parser.detectLanguage(englishText);
      expect(language).toBe('en');
    });

    it('should handle mixed language text', () => {
      const mixedText = "Hello שלום";
      const language = parser.detectLanguage(mixedText);
      expect(language).toBe('he'); // Should detect Hebrew presence
    });
  });
});
```

### 9.2 Conversation Manager Testing

```javascript
// src/tests/conversationManager.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import LocalConversationManager from '../conversationManager.js';

describe('Conversation Manager', () => {
  let manager;

  beforeEach(async () => {
    manager = new LocalConversationManager();
    await manager.init();
    manager.reset(); // Start fresh for each test
  });

  describe('Conversation Flow', () => {
    it('should start with safety check question', () => {
      const currentQuestion = manager.getCurrentQuestion('en');
      expect(currentQuestion).toBeTruthy();
      expect(currentQuestion.id).toBe('SAFETY_1');
    });

    it('should progress through conversation based on responses', async () => {
      // Simulate safe response
      const safetyResult = await manager.processInput("Yes I'm safe", 'en');
      
      expect(safetyResult.type).toBe('classification_response');
      expect(safetyResult.category).toBe('SAFE');
      expect(safetyResult.nextNode).toBeTruthy();
      
      // Check that we moved to next question
      const nextQuestion = manager.getCurrentQuestion('en');
      expect(nextQuestion.id).toBe(safetyResult.nextNode);
    });

    it('should handle emergency mode correctly', async () => {
      const dangerResult = await manager.processInput("Help! I'm trapped", 'en');
      
      expect(dangerResult.category).toBe('DANGER');
      expect(manager.mode).toBe('SILENT');
      expect(document.body.classList.contains('silent-mode')).toBe(true);
    });

    it('should request clarification when needed', async () => {
      const ambiguousResult = await manager.processInput("uh", 'en');
      
      expect(ambiguousResult.type).toBe('clarification');
      expect(ambiguousResult.needsClarification).toBe(true);
      expect(ambiguousResult.nextNode).toBe('SAFETY_1'); // Should stay on same question
    });
  });

  describe('Extraction Questions', () => {
    it('should handle complete extraction responses', async () => {
      // First get to extraction question
      await manager.processInput("Yes I'm safe", 'en');
      
      const locationResult = await manager.processInput(
        "I'm at the central bus station, third floor with 3 friends", 
        'en'
      );
      
      expect(locationResult.type).toBe('extraction_response');
      expect(locationResult.extractedData).toBeTruthy();
      expect(locationResult.completeness).toBeGreaterThan(0.7);
    });

    it('should request clarification for incomplete extractions', async () => {
      // Get to extraction question
      await manager.processInput("Yes I'm safe", 'en');
      
      const incompleteResult = await manager.processInput("somewhere", 'en');
      
      expect(incompleteResult.type).toBe('extraction_clarification');
      expect(incompleteResult.needsClarification).toBe(true);
      expect(incompleteResult.completeness).toBeLessThan(0.7);
    });
  });

  describe('State Persistence', () => {
    it('should save and restore conversation state', async () => {
      // Progress conversation
      await manager.processInput("Yes I'm safe", 'en');
      const currentNode = manager.currentNode;
      
      // Create new manager to simulate app restart
      const newManager = new LocalConversationManager();
      await newManager.init();
      
      // Should restore to same state
      expect(newManager.currentNode).toBe(currentNode);
    });

    it('should maintain conversation history', async () => {
      await manager.processInput("Yes I'm safe", 'en');
      await manager.processInput("Central bus station", 'en');
      
      expect(manager.history).toHaveLength(2);
      expect(manager.history[0].result).toBe('SAFE');
    });
  });

  describe('Multilingual Support', () => {
    it('should handle Hebrew conversations', async () => {
      const hebrewResult = await manager.processInput("כן אני בטוח", 'he');
      
      expect(hebrewResult.category).toBe('SAFE');
      expect(hebrewResult.text).toBeTruthy();
      
      // Verify Hebrew response text
      const currentQuestion = manager.getCurrentQuestion('he');
      expect(currentQuestion.text).toContain('איפה'); // Hebrew location question
    });

    it('should detect language automatically', async () => {
      const result = await manager.processInput("כן אני בטוח"); // No language specified
      
      expect(result.category).toBe('SAFE');
    });
  });
});
```

### 9.3 Component Testing

```javascript
// src/tests/ConversationInterface.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConversationInterface from '../components/ConversationInterface.jsx';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

// Mock the conversation manager
vi.mock('../conversationManager.js', () => {
  return {
    default: class MockConversationManager {
      async init() {}
      getCurrentQuestion() {
        return {
          id: 'SAFETY_1',
          text: 'Are you currently in a safe place?',
          isValid: true
        };
      }
      async processInput(input) {
        return {
          type: 'classification_response',
          text: 'Thank you for your response.',
          category: 'SAFE',
          confidence: 0.8,
          nextNode: 'LOCATION_1'
        };
      }
    }
  };
});

describe('ConversationInterface', () => {
  const renderWithI18n = (component) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };

  it('should render initial question', async () => {
    renderWithI18n(<ConversationInterface />);
    
    await waitFor(() => {
      expect(screen.getByText(/Are you currently in a safe place/)).toBeInTheDocument();
    });
  });

  it('should handle user input submission', async () => {
    renderWithI18n(<ConversationInterface />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your response/)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/Type your response/);
    const sendButton = screen.getByText('Send');
    
    fireEvent.change(input, { target: { value: "Yes I'm safe" } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText("Yes I'm safe")).toBeInTheDocument();
      expect(screen.getByText('Thank you for your response.')).toBeInTheDocument();
    });
  });

  it('should show confidence scores', async () => {
    renderWithI18n(<ConversationInterface />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type your response/);
      fireEvent.change(input, { target: { value: "Yes" } });
      fireEvent.click(screen.getByText('Send'));
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Confidence: 80%/)).toBeInTheDocument();
    });
  });

  it('should support language switching', async () => {
    renderWithI18n(<ConversationInterface />);
    
    const hebrewButton = screen.getByText('עברית');
    fireEvent.click(hebrewButton);
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('עברית')).toHaveClass('active');
    });
  });

  it('should show offline status', () => {
    renderWithI18n(<ConversationInterface />);
    
    expect(screen.getByText(/Fully offline/)).toBeInTheDocument();
  });
});
```

---

## 10. Build and Deployment

### 10.1 Package.json Configuration

```json
{
  "name": "trauma-response-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build && npm run verify-offline",
    "verify-offline": "node scripts/verify-offline.js",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:offline": "node src/tests/parser.test.js",
    "lint": "eslint src --ext .js,.jsx",
    "format": "prettier --write src/**/*.{js,jsx}",
    "analyze": "npm run build && npx vite-bundle-analyzer"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-i18next": "^12.2.0",
    "i18next": "^22.4.15",
    "compromise": "^14.10.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
    "vite-plugin-pwa": "^0.14.7",
    "vitest": "^0.33.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "prettier": "^2.8.8"
  }
}
```

### 10.2 Build Verification Script

```javascript
// scripts/verify-offline.js
import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

async function verifyOfflineBuild() {
  const distPath = './dist';
  const requiredFiles = [
    'index.html',
    'manifest.json',
    'sw.js',
    'conversations/safety_check.json',
    'conversations/stress_assessment.json',
    'i18n/locales/en.json',
    'i18n/locales/he.json',
    'videos/breathing_3min_en.mp4',
    'videos/breathing_3min_he.mp4'
  ];
  
  console.log('🔍 Verifying offline build...\n');
  
  let totalSize = 0;
  let missingFiles = [];
  
  // Check required files
  for (const file of requiredFiles) {
    try {
      const filePath = join(distPath, file);
      const stats = await stat(filePath);
      totalSize += stats.size;
      console.log(`✅ ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    } catch (error) {
      missingFiles.push(file);
      console.log(`❌ ${file} - MISSING`);
    }
  }
  
  console.log(`\n📊 Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  
  if (totalSize > 55 * 1024 * 1024) {
    console.warn(`⚠️  Warning: App size exceeds 55MB target`);
  }
  
  if (missingFiles.length > 0) {
    console.error('\n❌ Missing required files for offline operation:');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    process.exit(1);
  }
  
  // Check for network dependencies in built files
  const jsFiles = await findJSFiles(distPath);
  let networkReferences = [];
  
  for (const jsFile of jsFiles) {
    try {
      const content = await readFile(jsFile, 'utf8');
      
      // Check for problematic network calls
      if (content.includes('fetch(') && !content.includes('// offline-safe')) {
        if (content.includes('api.') || content.includes('cdn.') || content.includes('analytics')) {
          networkReferences.push(jsFile);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read ${jsFile}: ${error.message}`);
    }
  }
  
  if (networkReferences.length > 0) {
    console.warn('\n⚠️  Warning: Found potential external network calls in:');
    networkReferences.forEach(file => console.warn(`  - ${file}`));
    console.warn('Please verify these are offline-safe or add // offline-safe comments');
  }
  
  // Verify PWA manifest
  try {
    const manifestPath = join(distPath, 'manifest.json');
    const manifestContent = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    if (!manifest.icons || manifest.icons.length === 0) {
      console.error('❌ PWA manifest missing icons');
      process.exit(1);
    }
    
    if (manifest.display !== 'standalone') {
      console.warn('⚠️  PWA manifest display mode is not standalone');
    }
    
    console.log('✅ PWA manifest valid');
    
  } catch (error) {
    console.error('❌ PWA manifest validation failed:', error.message);
    process.exit(1);
  }
  
  // Verify service worker
  try {
    const swPath = join(distPath, 'sw.js');
    const swContent = await readFile(swPath, 'utf8');
    
    if (!swContent.includes('OFFLINE_CACHE')) {
      console.error('❌ Service worker missing offline cache configuration');
      process.exit(1);
    }
    
    console.log('✅ Service worker configured for offline operation');
    
  } catch (error) {
    console.error('❌ Service worker validation failed:', error.message);
    process.exit(1);
  }
  
  console.log('\n🎉 Build verified for offline operation!');
  console.log('\n📋 Next steps:');
  console.log('  1. Test offline functionality: npm run preview (then disconnect network)');
  console.log('  2. Test PWA installation on mobile devices');
  console.log('  3. Verify conversation flows with social worker input');
  console.log('  4. Deploy to hosting platform');
}

async function findJSFiles(dir) {
  const files = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await findJSFiles(fullPath));
      } else if (entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

verifyOfflineBuild().catch(console.error);
```

### 10.3 Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Verify offline capabilities
echo "🔍 Verifying offline build..."
npm run verify-offline

if [ $? -ne 0 ]; then
    echo "❌ Offline verification failed"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed"
    exit 1
fi

# Test PWA functionality
echo "🔌 Testing PWA offline functionality..."
npm run preview &
PREVIEW_PID=$!

# Wait for server to start
sleep 3

# Test that app loads
curl -f http://localhost:4173/ > /dev/null

if [ $? -ne 0 ]; then
    echo "❌ App failed to load in preview mode"
    kill $PREVIEW_PID
    exit 1
fi

# Kill preview server
kill $PREVIEW_PID

echo "✅ All checks passed!"

# Deploy to hosting platform (example for Netlify)
if [ "$1" = "production" ]; then
    echo "🌐 Deploying to production..."
    
    # Example deployment commands
    # netlify deploy --prod --dir=dist
    # or: rsync -avz dist/ user@server:/var/www/trauma-app/
    # or: aws s3 sync dist/ s3://trauma-app-bucket --delete
    
    echo "🎉 Deployment complete!"
    echo "📱 Test PWA installation: https://your-domain.com"
    echo "📊 Monitor app size and performance"
    echo "🔄 Share download link for emergency distribution"
else
    echo "💡 Run './scripts/deploy.sh production' to deploy to production"
fi
```

### 10.4 GitHub Actions CI/CD

```yaml
# .github/workflows/build-and-test.yml
name: Build and Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build application
      run: npm run build
    
    - name: Verify offline capabilities
      run: npm run verify-offline
    
    - name: Test PWA functionality
      run: |
        npm run preview &
        sleep 5
        curl -f http://localhost:4173/
        pkill node
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
    
    - name: Archive build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: dist
        path: dist/

  lighthouse:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli@0.12.x
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: [test, lighthouse]
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to hosting
      run: |
        # Add your deployment commands here
        # Examples:
        # netlify deploy --prod --dir=dist --auth=$NETLIFY_AUTH_TOKEN
        # aws s3 sync dist/ s3://$S3_BUCKET --delete
        echo "Deploy to your hosting platform here"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        S3_BUCKET: ${{ secrets.S3_BUCKET }}
```

### 10.5 Performance Optimization

```javascript
// scripts/optimize-assets.js
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';

async function optimizeAssets() {
  console.log('🎯 Optimizing assets for crisis distribution...\n');
  
  const distPath = './dist';
  
  // Analyze video files
  console.log('📹 Video file analysis:');
  const videoDir = join(distPath, 'videos');
  
  try {
    const videoFiles = await readdir(videoDir);
    let totalVideoSize = 0;
    
    for (const file of videoFiles) {
      if (file.endsWith('.mp4')) {
        const filePath = join(videoDir, file);
        const stats = await stat(filePath);
        totalVideoSize += stats.size;
        
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  ${file}: ${sizeMB}MB`);
        
        // Warn if individual video is too large
        if (stats.size > 8 * 1024 * 1024) {
          console.warn(`  ⚠️  ${file} exceeds 8MB target for crisis distribution`);
        }
      }
    }
    
    console.log(`  Total video size: ${(totalVideoSize / 1024 / 1024).toFixed(2)}MB\n`);
    
    if (totalVideoSize > 40 * 1024 * 1024) {
      console.warn('⚠️  Total video size exceeds 40MB target\n');
    }
    
  } catch (error) {
    console.warn('⚠️  Could not analyze video files:', error.message);
  }
  
  // Analyze JavaScript bundles
  console.log('📦 JavaScript bundle analysis:');
  const jsFiles = await findFiles(distPath, '.js');
  let totalJSSize = 0;
  
  for (const file of jsFiles) {
    const stats = await stat(file);
    totalJSSize += stats.size;
    
    const relativePath = file.replace(distPath + '/', '');
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  ${relativePath}: ${sizeMB}MB`);
  }
  
  console.log(`  Total JS size: ${(totalJSSize / 1024 / 1024).toFixed(2)}MB\n`);
  
  // Check for large dependencies
  const compromiseSize = await checkDependencySize('compromise');
  if (compromiseSize) {
    console.log(`📚 Compromise.js size: ${compromiseSize}MB`);
    if (compromiseSize > 3) {
      console.warn('⚠️  Compromise.js larger than expected');
    }
  }
  
  // Generate optimization report
  const report = {
    timestamp: new Date().toISOString(),
    totalSize: (totalVideoSize + totalJSSize) / 1024 / 1024,
    videoSize: totalVideoSize / 1024 / 1024,
    jsSize: totalJSSize / 1024 / 1024,
    optimizationSuggestions: []
  };
  
  if (report.totalSize > 50) {
    report.optimizationSuggestions.push('Consider reducing video quality or duration');
  }
  
  if (report.jsSize > 5) {
    report.optimizationSuggestions.push('Consider code splitting or removing unused dependencies');
  }
  
  await writeFile(
    join(distPath, 'optimization-report.json'), 
    JSON.stringify(report, null, 2)
  );
  
  console.log('📊 Optimization report saved to dist/optimization-report.json');
  
  if (report.optimizationSuggestions.length > 0) {
    console.log('\n💡 Optimization suggestions:');
    report.optimizationSuggestions.forEach(suggestion => {
      console.log(`  - ${suggestion}`);
    });
  }
  
  console.log('\n✅ Asset optimization analysis complete');
}

async function findFiles(dir, extension) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findFiles(fullPath, extension));
    } else if (entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function checkDependencySize(depName) {
  try {
    const bundleFiles = await findFiles('./dist', '.js');
    
    for (const file of bundleFiles) {
      const content = await readFile(file, 'utf8');
      if (content.includes(depName)) {
        const stats = await stat(file);
        return (stats.size / 1024 / 1024).toFixed(2);
      }
    }
  } catch (error) {
    console.warn(`Could not check ${depName} size:`, error.message);
  }
  
  return null;
}

optimizeAssets().catch(console.error);
```

This concludes the comprehensive Implementation Guide. The guide provides step-by-step instructions for building the trauma response app with all the technical details needed for development, testing, and deployment.
