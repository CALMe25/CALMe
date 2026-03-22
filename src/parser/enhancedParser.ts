// Enhanced Parser with keyword shortcuts and sentiment analysis
// Never exposes categories to the user - only provides natural conversation flow

import nlp from "compromise";
import sentiment from "sentiment";

// Type for i18n messages - will be provided by the caller
export interface ParserMessages {
  parser: {
    affirmativeResponses: string;
    negativeResponses: string;
    uncertainResponses: string;
    stressKeywords: {
      no_stress: string;
      moderate_stress: string;
      high_stress: string;
    };
    safetyKeywords: {
      safe: string;
      danger: string;
      unsure: string;
    };
    clarifications: {
      stress: string;
      safety: string;
      location: string;
      yesNo: string;
      activity: string;
    };
  };
}

export interface ParserResult {
  type: "classification" | "extraction";
  category?: string;
  extractedValue?: string;
  confidence: number;
  reasoning?: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
}

interface KeywordMapping {
  keywords: string[];
  category: string;
  confidence: number;
}

class EnhancedParser {
  private sentimentAnalyzer = new sentiment();
  private messages: ParserMessages | null = null;
  private keywordCache = new Map<string, string[]>();

  // Set the current language messages for parsing
  setMessages(messages: ParserMessages): void {
    this.messages = messages;
    // Clear cache when messages change (language switch)
    this.keywordCache.clear();
  }

  /**
   * Converts a pipe-delimited string of keywords into an array of lowercase, trimmed keywords.
   * Results are cached to avoid redundant string processing.
   * @param keywordString - Pipe-delimited string of keywords (e.g., "yes|yeah|yep")
   * @returns Array of lowercase, trimmed keywords
   */
  private parseKeywords(keywordString: string): string[] {
    const cached = this.keywordCache.get(keywordString);
    if (cached) {
      return cached;
    }
    const parsed = keywordString.split("|").map((k) => k.trim().toLowerCase());
    this.keywordCache.set(keywordString, parsed);
    return parsed;
  }

  /**
   * Checks if the input contains a keyword, using word-boundary matching for short words
   * to prevent substring false positives (e.g., "no" matching inside "know").
   */
  private matchesKeyword(input: string, keyword: string): boolean {
    if (keyword.length <= 3 && !keyword.includes(" ")) {
      return new RegExp(`\\b${keyword}\\b`, "i").test(input);
    }
    return input.toLowerCase().includes(keyword.toLowerCase());
  }

  // Keyword mappings for quick categorization
  private stressKeywords: KeywordMapping[] = [
    {
      keywords: [
        "good",
        "fine",
        "okay",
        "ok",
        "alright",
        "all right",
        "not bad",
        "calm",
        "relaxed",
        "peaceful",
        "chill",
        "comfortable",
        "content",
        "exploring",
        "curious",
        "looking around",
        "just checking",
        "doing well",
        "im good",
        "im fine",
        "im ok",
        "im okay",
        "pretty good",
        "feeling good",
        "no complaints",
        "managing",
        "holding up",
        "hanging in there",
        "no alarm",
        "no alert",
        "no siren",
        "all clear",
        "safe and sound",
        "everything is fine",
        "nothing happening",
      ],
      category: "no_stress",
      confidence: 0.9,
    },
    {
      keywords: [
        "anxious",
        "worried",
        "nervous",
        "uneasy",
        "uncomfortable",
        "tense",
        "bad",
        "not good",
        "not great",
        "stressed",
        "stressed out",
        "on edge",
        "restless",
        "agitated",
        "unsettled",
        "shaky",
        "upset",
        "distressed",
        "bothered",
        "troubled",
        "concerned",
        "cant sleep",
        "cant relax",
        "cant focus",
        "cant concentrate",
        "jittery",
        "jumpy",
        "irritable",
        "frustrated",
        "overwhelmed a bit",
        "a bit scared",
        "a little worried",
        "kind of anxious",
        "not feeling well",
        "feeling off",
        "something feels wrong",
        "my heart is racing",
        "heart pounding",
        "sweating",
        "waiting",
        "stuck waiting",
        "dont know what to do",
      ],
      category: "moderate_stress",
      confidence: 0.85,
    },
    {
      keywords: [
        "crisis",
        "panic",
        "panicking",
        "panic attack",
        "scared",
        "terrified",
        "petrified",
        "frozen",
        "paralyzed",
        "overwhelmed",
        "cant breathe",
        "can not breathe",
        "hard to breathe",
        "help",
        "help me",
        "someone help",
        "i need help",
        "terrible",
        "awful",
        "horrible",
        "desperate",
        "dying",
        "going to die",
        "gonna die",
        "afraid to die",
        "shaking",
        "trembling",
        "hyperventilating",
        "screaming",
        "losing it",
        "losing control",
        "out of control",
        "breaking down",
        "cant think",
        "cant move",
        "cant stop crying",
        "falling apart",
        "everything is falling apart",
        "i dont know what to do",
        "im freaking out",
        "explosion",
        "rocket",
        "siren",
        "bomb",
        "attack",
        "injured",
        "hurt",
        "bleeding",
        "someone is hurt",
        "trapped",
        "stuck",
        "cant get out",
        "locked in",
      ],
      category: "high_stress",
      confidence: 0.95,
    },
    {
      keywords: [
        // English
        "car",
        "train",
        "bus",
        "vehicle",
        "driving",
        "transit",
        "transportation",
        "on the road",
        "in traffic",
        "commuting",
        "riding",
        "passenger",
        "taxi",
        "uber",
        "walking",
        "on foot",
        "cycling",
        "bicycle",
        "highway",
        "intersection",
        "stopped at a light",
        "tram",
        "metro",
        "subway",
        "scooter",
        "motorcycle",
        // Hebrew transliterated
        "monit",
        "monit sherut",
        "monit shirut",
        "sherut",
        "otobus",
        "autobus",
        "egged",
        "dan",
        "kavim",
        "rakevet",
        "rakevet hakala",
        "rakevet-hakala",
        "rakevet kala",
        "light-rail",
        "light rail",
        "rechev",
        "noseh",
        "nesia",
        "ba derech",
        "ba kvish",
        "ofanayim",
        "ofnoa",
        "katnoah",
        "korkinet",
        "trempiada",
        "tremp",
        "hitchhike",
        "maavar hatzaya",
        "tzomet",
        "ramzor",
        "ayalon",
        "kvish 6",
        "kvish shesh",
        "tahana",
        "tahana merkazit",
        "tachana",
        // Arabic transliterated
        "sayara",
        "sayyara",
        "bass",
        "baas",
        "otobees",
        "taxi",
        "servees",
        "service",
        "sarvees",
        "qitar",
        "train",
        "tramway",
        "daraja",
        "darraja",
        "bisikleet",
        "mashee",
        "mashi",
        "walking",
        "tareeq",
        "tariq",
        "share3",
        "shara",
      ],
      category: "in_transit",
      confidence: 0.9,
    },
    {
      keywords: [
        "outside",
        "outdoors",
        "construction",
        "working",
        "open space",
        "in the field",
        "on site",
        "work site",
        "rooftop",
        "parking lot",
        "street",
        "sidewalk",
        "park",
        "garden",
        "yard",
        "balcony",
        "no cover",
        "no shelter nearby",
        "exposed area",
      ],
      category: "outdoor_worker",
      confidence: 0.85,
    },
    {
      keywords: [
        "caregiver",
        "helping someone",
        "supporting",
        "care facility",
        "nursing",
        "taking care of",
        "looking after",
        "watching over",
        "responsible for",
        "my kids",
        "my children",
        "my baby",
        "my mother",
        "my father",
        "my grandmother",
        "my grandfather",
        "elderly parent",
        "elderly person",
        "disabled person",
        "special needs",
        "wheelchair",
        "with children",
        "with kids",
        "with my family",
        "they need me",
        "depends on me",
        "counting on me",
        "patient",
        "clients",
        "residents",
        "students",
      ],
      category: "caregiver",
      confidence: 0.85,
    },
  ];

  private safetyKeywords: KeywordMapping[] = [
    {
      keywords: [
        "yes",
        "safe",
        "protected",
        "secure",
        "sheltered",
        "im good",
        "all good",
        "im safe",
        "we are safe",
        "were safe",
        "in the shelter",
        "in the mamad",
        "in the safe room",
        "inside",
        "indoors",
        "sealed room",
        "reinforced",
        "got to safety",
        "made it",
        "reached the shelter",
        "in a building",
        "underground",
        "basement",
        "doors locked",
        "windows closed",
        "hunkered down",
      ],
      category: "SAFE",
      confidence: 0.9,
    },
    {
      keywords: [
        "not safe",
        "unsafe",
        "exposed",
        "danger",
        "at risk",
        "vulnerable",
        "no shelter",
        "no protection",
        "in the open",
        "outside",
        "cant get to shelter",
        "cant reach",
        "too far",
        "no mamad",
        "no safe room",
        "no miklat",
        "on the street",
        "in my car",
        "driving",
        "no cover",
        "nowhere to go",
        "stuck outside",
        "under fire",
        "rockets",
        "explosions nearby",
        "building damaged",
        "not reinforced",
        "windows shattered",
      ],
      category: "DANGER",
      confidence: 0.95,
    },
    {
      keywords: [
        "maybe",
        "not sure",
        "i think",
        "possibly",
        "sort of",
        "kind of",
        "i guess",
        "probably",
        "hopefully",
        "i think so",
        "not really sure",
        "hard to tell",
        "dont know",
        "partially",
        "somewhat",
        "more or less",
      ],
      category: "UNSURE",
      confidence: 0.7,
    },
  ];

  private locationKeywords: KeywordMapping[] = [
    {
      keywords: [
        "home",
        "house",
        "apartment",
        "flat",
        "residence",
        "my place",
        "my room",
        "bedroom",
        "living room",
        "kitchen",
        "dorm",
        "dorm room",
        "hostel",
      ],
      category: "home",
      confidence: 0.9,
    },
    {
      keywords: [
        "miklat",
        "shelter",
        "bunker",
        "safe room",
        "bomb shelter",
        "public shelter",
        "community shelter",
        "building shelter",
        "underground shelter",
        "basement shelter",
      ],
      category: "shelter",
      confidence: 0.95,
    },
    {
      keywords: [
        "mamad",
        "reinforced room",
        "protected room",
        "sealed room",
        "security room",
        "fortified room",
      ],
      category: "mamad",
      confidence: 0.95,
    },
    {
      keywords: [
        "stairway",
        "stairwell",
        "stairs",
        "staircase",
        "hallway",
        "corridor",
        "lobby",
        "entrance hall",
      ],
      category: "stairway",
      confidence: 0.9,
    },
  ];

  // Social context keywords (used by multi-signal extraction in offlineParser)
  socialKeywords: KeywordMapping[] = [
    {
      keywords: [
        "alone",
        "by myself",
        "on my own",
        "no one here",
        "nobody here",
        "all alone",
        "here alone",
        "im alone",
        "just me",
        "solo",
        "isolated",
        "no one around",
      ],
      category: "alone",
      confidence: 0.9,
    },
    {
      keywords: [
        "with people",
        "with others",
        "people here",
        "everyone",
        "neighbors",
        "strangers",
        "crowd",
        "group",
        "other people",
        "some people",
        "a few people",
        "with friends",
        "with my partner",
        "with my spouse",
        "my husband",
        "my wife",
        "my boyfriend",
        "my girlfriend",
        "roommate",
        "roommates",
        "colleagues",
        "coworkers",
      ],
      category: "with_others",
      confidence: 0.85,
    },
    {
      keywords: [
        "with my kids",
        "with my children",
        "with my baby",
        "with my mother",
        "with my father",
        "with my parents",
        "with my grandmother",
        "with my grandfather",
        "with my grandparents",
        "taking care of",
        "looking after",
        "watching over",
        "elderly",
        "disabled",
        "special needs",
        "wheelchair",
        "my family",
        "whole family",
        "kids are with me",
        "baby is crying",
        "children are scared",
        "kids are frightened",
        "pets",
        "my dog",
        "my cat",
      ],
      category: "caregiver",
      confidence: 0.9,
    },
  ];

  classifyStress(input: string): ParserResult {
    console.log("🔍 Parser: Analyzing stress level from input:", input);

    const doc = nlp(input);

    // Use dynamic keywords from i18n if available
    if (this.messages) {
      const stressKeywordMappings = [
        {
          keywords: this.parseKeywords(this.messages.parser.stressKeywords.no_stress),
          category: "no_stress",
          confidence: 0.9,
        },
        {
          keywords: this.parseKeywords(this.messages.parser.stressKeywords.moderate_stress),
          category: "moderate_stress",
          confidence: 0.85,
        },
        {
          keywords: this.parseKeywords(this.messages.parser.stressKeywords.high_stress),
          category: "high_stress",
          confidence: 0.95,
        },
      ];

      // Check for keyword matches with i18n keywords
      for (const mapping of stressKeywordMappings) {
        for (const keyword of mapping.keywords) {
          if (this.matchesKeyword(input, keyword)) {
            console.log(`✅ Parser: Found i18n keyword match: "${keyword}" → ${mapping.category}`);
            return {
              type: "classification",
              category: mapping.category,
              confidence: mapping.confidence,
              reasoning: `Keyword match: ${keyword}`,
            };
          }
        }
      }
    } else {
      // Fallback to hardcoded English keywords
      for (const mapping of this.stressKeywords) {
        for (const keyword of mapping.keywords) {
          if (this.matchesKeyword(input, keyword)) {
            console.log(`✅ Parser: Found keyword match: "${keyword}" → ${mapping.category}`);
            return {
              type: "classification",
              category: mapping.category,
              confidence: mapping.confidence,
              reasoning: `Keyword match: ${keyword}`,
            };
          }
        }
      }
    }

    // If no keywords, use sentiment analysis
    const sentimentResult = this.sentimentAnalyzer.analyze(input);
    console.log("📊 Parser: Sentiment analysis:", sentimentResult);

    // Also check for emotional terms
    const hasNegativeEmotion =
      doc.match("#Negative").found || doc.match("(sad|angry|frustrated|upset)").found;
    const hasPositiveEmotion =
      doc.match("#Positive").found || doc.match("(happy|calm|relaxed|peaceful)").found;

    // Determine stress level from sentiment
    if (sentimentResult.score < -3 || hasNegativeEmotion) {
      console.log("🔴 Parser: High stress detected from sentiment");
      return {
        type: "classification",
        category: "high_stress",
        confidence: 0.7,
        reasoning: "Negative sentiment detected",
      };
    } else if (sentimentResult.score < 0) {
      console.log("🟡 Parser: Moderate stress detected from sentiment");
      return {
        type: "classification",
        category: "moderate_stress",
        confidence: 0.6,
        reasoning: "Slightly negative sentiment",
      };
    } else if (sentimentResult.score >= 0 || hasPositiveEmotion) {
      console.log("🟢 Parser: No stress detected from sentiment");
      return {
        type: "classification",
        category: "no_stress",
        confidence: 0.6,
        reasoning: "Neutral or positive sentiment",
      };
    }

    // Low confidence fallback
    console.log("⚠️ Parser: Low confidence classification, needs clarification");
    return {
      type: "classification",
      category: "uncertain",
      confidence: 0.3,
      needsClarification: true,
      clarificationPrompt: this.messages
        ? this.messages.parser.clarifications.stress
        : "I didn't quite understand. Are you feeling relaxed, somewhat stressed, or very stressed?",
    };
  }

  classifySafety(input: string): ParserResult {
    console.log("🔍 Parser: Analyzing safety status from input:", input);

    // Use dynamic keywords from i18n if available
    if (this.messages) {
      const safetyKeywordMappings = [
        {
          keywords: this.parseKeywords(this.messages.parser.safetyKeywords.safe),
          category: "SAFE",
          confidence: 0.9,
        },
        {
          keywords: this.parseKeywords(this.messages.parser.safetyKeywords.danger),
          category: "DANGER",
          confidence: 0.95,
        },
        {
          keywords: this.parseKeywords(this.messages.parser.safetyKeywords.unsure),
          category: "UNSURE",
          confidence: 0.7,
        },
      ];

      // Check for keyword matches with i18n keywords
      for (const mapping of safetyKeywordMappings) {
        for (const keyword of mapping.keywords) {
          if (this.matchesKeyword(input, keyword)) {
            console.log(`✅ Parser: Found i18n safety keyword: "${keyword}" → ${mapping.category}`);
            return {
              type: "classification",
              category: mapping.category,
              confidence: mapping.confidence,
              reasoning: `Keyword match: ${keyword}`,
            };
          }
        }
      }

      // Check for yes/no responses using i18n keywords
      const affirmativeKeywords = this.parseKeywords(this.messages.parser.affirmativeResponses);
      const negativeKeywords = this.parseKeywords(this.messages.parser.negativeResponses);

      for (const keyword of affirmativeKeywords) {
        if (this.matchesKeyword(input, keyword)) {
          console.log("✅ Parser: Affirmative response detected (i18n)");
          return {
            type: "classification",
            category: "SAFE",
            confidence: 0.8,
            reasoning: "Affirmative response",
          };
        }
      }

      for (const keyword of negativeKeywords) {
        if (this.matchesKeyword(input, keyword)) {
          console.log("❌ Parser: Negative response detected (i18n)");
          return {
            type: "classification",
            category: "DANGER",
            confidence: 0.8,
            reasoning: "Negative response",
          };
        }
      }
    } else {
      // Fallback to hardcoded English keywords
      for (const mapping of this.safetyKeywords) {
        for (const keyword of mapping.keywords) {
          if (this.matchesKeyword(input, keyword)) {
            console.log(`✅ Parser: Found safety keyword: "${keyword}" → ${mapping.category}`);
            return {
              type: "classification",
              category: mapping.category,
              confidence: mapping.confidence,
              reasoning: `Keyword match: ${keyword}`,
            };
          }
        }
      }

      // Use NLP for yes/no detection (English only)
      const doc = nlp(input);
      if (doc.has("(yes|yeah|yep|yup|sure|definitely|absolutely)")) {
        console.log("✅ Parser: Affirmative response detected");
        return {
          type: "classification",
          category: "SAFE",
          confidence: 0.8,
          reasoning: "Affirmative response",
        };
      }

      if (doc.has("(no|nope|not|negative|nah)")) {
        console.log("❌ Parser: Negative response detected");
        return {
          type: "classification",
          category: "DANGER",
          confidence: 0.8,
          reasoning: "Negative response",
        };
      }
    }

    // Low confidence fallback
    console.log("⚠️ Parser: Cannot determine safety status, needs clarification");
    return {
      type: "classification",
      category: "UNSURE",
      confidence: 0.3,
      needsClarification: true,
      clarificationPrompt: this.messages
        ? this.messages.parser.clarifications.safety
        : "I need to make sure - are you in a safe, protected space right now?",
    };
  }

  extractLocation(input: string): ParserResult {
    console.log("🔍 Parser: Extracting location from input:", input);

    let extractedLocation = "";
    let confidence = 0;

    // Check location keywords
    for (const mapping of this.locationKeywords) {
      for (const keyword of mapping.keywords) {
        if (this.matchesKeyword(input, keyword)) {
          console.log(`📍 Parser: Found location keyword: "${keyword}"`);
          extractedLocation = mapping.category;
          confidence = mapping.confidence;
          break;
        }
      }
      if (extractedLocation) break;
    }

    // If no keyword match, try to extract any location-like phrase
    if (!extractedLocation) {
      const doc = nlp(input);
      const places = doc.places().out("array");
      const rooms = doc.match("(room|space|area|place)").out("array");

      if (places.length > 0) {
        extractedLocation = places[0];
        confidence = 0.6;
        console.log(`📍 Parser: Extracted place: "${extractedLocation}"`);
      } else if (rooms.length > 0) {
        extractedLocation = input; // Use full input as location description
        confidence = 0.5;
        console.log(`📍 Parser: Using full input as location description`);
      }
    }

    if (extractedLocation) {
      return {
        type: "extraction",
        extractedValue: extractedLocation,
        confidence: confidence,
        reasoning: "Location extracted from text",
      };
    }

    // Fallback if no location found
    console.log("⚠️ Parser: No location found, needs clarification");
    return {
      type: "extraction",
      extractedValue: "",
      confidence: 0.2,
      needsClarification: true,
      clarificationPrompt: this.messages
        ? this.messages.parser.clarifications.location
        : "Where exactly are you right now? For example: at home, in a shelter, or somewhere else?",
    };
  }

  // Generic yes/no parser for various contexts
  parseYesNo(input: string): ParserResult {
    console.log("🔍 Parser: Analyzing yes/no response:", input);

    // Use i18n keywords if available
    if (this.messages) {
      const affirmativeKeywords = this.parseKeywords(this.messages.parser.affirmativeResponses);
      const negativeKeywords = this.parseKeywords(this.messages.parser.negativeResponses);
      const uncertainKeywords = this.parseKeywords(this.messages.parser.uncertainResponses);

      // Check affirmative
      for (const keyword of affirmativeKeywords) {
        if (this.matchesKeyword(input, keyword)) {
          return {
            type: "classification",
            category: "yes",
            confidence: 0.9,
            reasoning: "Affirmative response detected (i18n)",
          };
        }
      }

      // Check negative
      for (const keyword of negativeKeywords) {
        if (this.matchesKeyword(input, keyword)) {
          return {
            type: "classification",
            category: "no",
            confidence: 0.9,
            reasoning: "Negative response detected (i18n)",
          };
        }
      }

      // Check uncertain
      for (const keyword of uncertainKeywords) {
        if (this.matchesKeyword(input, keyword)) {
          return {
            type: "classification",
            category: "maybe",
            confidence: 0.7,
            reasoning: "Uncertain response detected (i18n)",
          };
        }
      }
    } else {
      // Fallback to English NLP
      const doc = nlp(input);

      // Strong yes indicators
      if (
        doc.has("(yes|yeah|yep|yup|sure|definitely|absolutely|correct|right|exactly)") ||
        this.matchesKeyword(input, "yes") ||
        this.matchesKeyword(input, "yeah")
      ) {
        return {
          type: "classification",
          category: "yes",
          confidence: 0.9,
          reasoning: "Affirmative response detected",
        };
      }

      // Strong no indicators
      if (
        doc.has("(no|nope|not|negative|nah|never|wrong)") ||
        this.matchesKeyword(input, "no") ||
        this.matchesKeyword(input, "nope")
      ) {
        return {
          type: "classification",
          category: "no",
          confidence: 0.9,
          reasoning: "Negative response detected",
        };
      }

      // Maybe/uncertain
      if (doc.has("(maybe|perhaps|possibly|might|could|unsure|not sure)")) {
        return {
          type: "classification",
          category: "maybe",
          confidence: 0.7,
          reasoning: "Uncertain response detected",
        };
      }
    }

    // Low confidence
    return {
      type: "classification",
      category: "unclear",
      confidence: 0.3,
      needsClarification: true,
      clarificationPrompt: this.messages
        ? this.messages.parser.clarifications.yesNo
        : "I need a yes or no answer to continue. Can you please clarify?",
    };
  }

  // Parser for activity preferences - Updated to match appsContext names
  parseActivityPreference(input: string): ParserResult {
    console.log("🔍 Parser: Analyzing activity preference from input:", input);

    const lowerInput = input.toLowerCase();

    const activityKeywords = [
      { keywords: ["breath", "breathing", "breathe"], activity: "breathing" },
      {
        keywords: ["stretch", "stretching", "exercise"],
        activity: "stretching",
      },
      {
        keywords: ["game", "match", "play", "cards", "memory"],
        activity: "matching-cards",
      },
      {
        keywords: ["sudoku", "numbers", "puzzle", "logic"],
        activity: "sudoku",
      },
      { keywords: ["jigsaw", "piece", "pieces"], activity: "puzzle" },
      {
        keywords: ["draw", "drawing", "creative", "art", "paint"],
        activity: "paint",
      },
      // Fallback aliases for unmapped activities
      { keywords: ["ground", "grounding", "5-4-3-2-1"], activity: "grounding" },
      { keywords: ["music", "song", "listen", "audio"], activity: "music" },
      { keywords: ["story", "tale", "narrative"], activity: "story" },
    ];

    for (const mapping of activityKeywords) {
      for (const keyword of mapping.keywords) {
        if (this.matchesKeyword(input, keyword)) {
          console.log(`🎯 Parser: Activity preference detected: ${mapping.activity}`);
          return {
            type: "classification",
            category: mapping.activity,
            confidence: 0.85,
            reasoning: `Activity keyword: ${keyword}`,
          };
        }
      }
    }

    // Check for rejection
    if (
      this.parseYesNo(input).category === "no" ||
      lowerInput.includes("nothing") ||
      lowerInput.includes("none")
    ) {
      return {
        type: "classification",
        category: "no_activity",
        confidence: 0.8,
        reasoning: "User declined activity",
      };
    }

    // Low confidence
    return {
      type: "classification",
      category: "unclear_activity",
      confidence: 0.3,
      needsClarification: true,
      clarificationPrompt: this.messages
        ? this.messages.parser.clarifications.activity
        : "Would you like to try breathing exercises, stretching, or perhaps a matching game?",
    };
  }
}

// Singleton instance
export const enhancedParser = new EnhancedParser();

// Export individual parser functions for backward compatibility
export const classifyStress = (input: string) => enhancedParser.classifyStress(input);
export const classifySafety = (input: string) => enhancedParser.classifySafety(input);
export const extractLocation = (input: string) => enhancedParser.extractLocation(input);
export const parseYesNo = (input: string) => enhancedParser.parseYesNo(input);
export const parseActivityPreference = (input: string) =>
  enhancedParser.parseActivityPreference(input);
