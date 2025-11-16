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

  // Set the current language messages for parsing
  setMessages(messages: ParserMessages): void {
    this.messages = messages;
  }

  // Helper to convert pipe-separated string to array
  private parseKeywords(keywordString: string): string[] {
    return keywordString.split("|").map((k) => k.trim().toLowerCase());
  }

  // Keyword mappings for quick categorization
  private stressKeywords: KeywordMapping[] = [
    {
      keywords: [
        "good",
        "fine",
        "okay",
        "exploring",
        "curious",
        "looking around",
        "just checking",
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
      ],
      category: "moderate_stress",
      confidence: 0.85,
    },
    {
      keywords: [
        "crisis",
        "panic",
        "scared",
        "terrified",
        "overwhelmed",
        "cant breathe",
        "help",
      ],
      category: "high_stress",
      confidence: 0.95,
    },
    {
      keywords: [
        "car",
        "train",
        "bus",
        "vehicle",
        "driving",
        "transit",
        "transportation",
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
      ],
      category: "SAFE",
      confidence: 0.9,
    },
    {
      keywords: [
        "no",
        "not safe",
        "unsafe",
        "exposed",
        "danger",
        "at risk",
        "vulnerable",
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
      ],
      category: "UNSURE",
      confidence: 0.7,
    },
  ];

  private locationKeywords: KeywordMapping[] = [
    {
      keywords: ["home", "house", "apartment", "flat", "residence"],
      category: "home",
      confidence: 0.9,
    },
    {
      keywords: ["miklat", "shelter", "bunker", "safe room"],
      category: "shelter",
      confidence: 0.95,
    },
    {
      keywords: ["mamad", "reinforced room", "protected room"],
      category: "mamad",
      confidence: 0.95,
    },
    {
      keywords: ["stairway", "stairwell", "stairs", "staircase"],
      category: "stairway",
      confidence: 0.9,
    },
  ];

  classifyStress(input: string): ParserResult {
    console.log("🔍 Parser: Analyzing stress level from input:", input);

    const doc = nlp(input);
    const lowerInput = input.toLowerCase();

    // Use dynamic keywords from i18n if available
    if (this.messages) {
      const stressKeywordMappings = [
        {
          keywords: this.parseKeywords(
            this.messages.parser.stressKeywords.no_stress,
          ),
          category: "no_stress",
          confidence: 0.9,
        },
        {
          keywords: this.parseKeywords(
            this.messages.parser.stressKeywords.moderate_stress,
          ),
          category: "moderate_stress",
          confidence: 0.85,
        },
        {
          keywords: this.parseKeywords(
            this.messages.parser.stressKeywords.high_stress,
          ),
          category: "high_stress",
          confidence: 0.95,
        },
      ];

      // Check for keyword matches with i18n keywords
      for (const mapping of stressKeywordMappings) {
        for (const keyword of mapping.keywords) {
          if (lowerInput.includes(keyword)) {
            console.log(
              `✅ Parser: Found i18n keyword match: "${keyword}" → ${mapping.category}`,
            );
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
          if (lowerInput.includes(keyword)) {
            console.log(
              `✅ Parser: Found keyword match: "${keyword}" → ${mapping.category}`,
            );
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
      doc.match("#Negative").found ||
      doc.match("(sad|angry|frustrated|upset)").found;
    const hasPositiveEmotion =
      doc.match("#Positive").found ||
      doc.match("(happy|calm|relaxed|peaceful)").found;

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

    const lowerInput = input.toLowerCase();

    // Use dynamic keywords from i18n if available
    if (this.messages) {
      const safetyKeywordMappings = [
        {
          keywords: this.parseKeywords(
            this.messages.parser.safetyKeywords.safe,
          ),
          category: "SAFE",
          confidence: 0.9,
        },
        {
          keywords: this.parseKeywords(
            this.messages.parser.safetyKeywords.danger,
          ),
          category: "DANGER",
          confidence: 0.95,
        },
        {
          keywords: this.parseKeywords(
            this.messages.parser.safetyKeywords.unsure,
          ),
          category: "UNSURE",
          confidence: 0.7,
        },
      ];

      // Check for keyword matches with i18n keywords
      for (const mapping of safetyKeywordMappings) {
        for (const keyword of mapping.keywords) {
          if (lowerInput.includes(keyword)) {
            console.log(
              `✅ Parser: Found i18n safety keyword: "${keyword}" → ${mapping.category}`,
            );
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
      const affirmativeKeywords = this.parseKeywords(
        this.messages.parser.affirmativeResponses,
      );
      const negativeKeywords = this.parseKeywords(
        this.messages.parser.negativeResponses,
      );

      for (const keyword of affirmativeKeywords) {
        if (lowerInput.includes(keyword)) {
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
        if (lowerInput.includes(keyword)) {
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
          if (lowerInput.includes(keyword)) {
            console.log(
              `✅ Parser: Found safety keyword: "${keyword}" → ${mapping.category}`,
            );
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
    console.log(
      "⚠️ Parser: Cannot determine safety status, needs clarification",
    );
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

    const lowerInput = input.toLowerCase();
    let extractedLocation = "";
    let confidence = 0;

    // Check location keywords
    for (const mapping of this.locationKeywords) {
      for (const keyword of mapping.keywords) {
        if (lowerInput.includes(keyword)) {
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

    const lowerInput = input.toLowerCase();

    // Use i18n keywords if available
    if (this.messages) {
      const affirmativeKeywords = this.parseKeywords(
        this.messages.parser.affirmativeResponses,
      );
      const negativeKeywords = this.parseKeywords(
        this.messages.parser.negativeResponses,
      );
      const uncertainKeywords = this.parseKeywords(
        this.messages.parser.uncertainResponses,
      );

      // Check affirmative
      for (const keyword of affirmativeKeywords) {
        if (lowerInput.includes(keyword)) {
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
        if (lowerInput.includes(keyword)) {
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
        if (lowerInput.includes(keyword)) {
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
        doc.has(
          "(yes|yeah|yep|yup|sure|definitely|absolutely|correct|right|exactly)",
        ) ||
        lowerInput.includes("yes") ||
        lowerInput.includes("yeah")
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
        lowerInput.includes("no") ||
        lowerInput.includes("nope")
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
        if (lowerInput.includes(keyword)) {
          console.log(
            `🎯 Parser: Activity preference detected: ${mapping.activity}`,
          );
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
export const classifyStress = (input: string) =>
  enhancedParser.classifyStress(input);
export const classifySafety = (input: string) =>
  enhancedParser.classifySafety(input);
export const extractLocation = (input: string) =>
  enhancedParser.extractLocation(input);
export const parseYesNo = (input: string) => enhancedParser.parseYesNo(input);
export const parseActivityPreference = (input: string) =>
  enhancedParser.parseActivityPreference(input);
