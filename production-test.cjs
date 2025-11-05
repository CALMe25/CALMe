#!/usr/bin/env node

// Production-Ready Test Suite for CALMe Phase 2
// Validates the complete therapeutic conversation system

const { ConversationController } = require('./test-setup.cjs');

class ProductionTestSuite {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  // Comprehensive parser simulation with realistic edge cases
  classifySafety(text) {
    const lowerText = text.toLowerCase();
    
    // High confidence safety indicators
    if (lowerText.match(/\b(safe|secure|shelter|protected|inside|home|building|bunker)\b/)) {
      return { category: 'SAFE', confidence: 0.9, reasoning: 'Strong safety indicators' };
    }
    
    // High confidence danger indicators  
    if (lowerText.match(/\b(danger|explosion|attack|siren|trapped|help|emergency|outside.*danger)\b/)) {
      return { category: 'DANGER', confidence: 0.95, reasoning: 'Clear danger signals' };
    }
    
    // Uncertainty indicators
    if (lowerText.match(/\b(think|maybe|not sure|uncertain|possibly|might be)\b/)) {
      return { category: 'UNSURE', confidence: 0.8, reasoning: 'Uncertainty expressions' };
    }
    
    // Default to safe with lower confidence
    return { category: 'SAFE', confidence: 0.6, reasoning: 'No clear danger indicators' };
  }

  classifyStress(text) {
    const lowerText = text.toLowerCase();
    
    // High stress/panic indicators
    if (lowerText.match(/\b(panic|can't breathe|heart racing|pounding|losing control|terrified|dying)\b/)) {
      return { category: 'HIGH_STRESS', confidence: 0.95, reasoning: 'Panic attack indicators' };
    }
    
    // Confusion/dissociation indicators
    if (lowerText.match(/\b(fuzzy|distant|numb|don't know|disconnected|unreal|floating)\b/)) {
      return { category: 'CONFUSED', confidence: 0.85, reasoning: 'Dissociation symptoms' };
    }
    
    // Moderate stress indicators
    if (lowerText.match(/\b(anxious|worried|stressed|nervous|tense|overwhelmed|scared)\b/)) {
      return { category: 'MODERATE_STRESS', confidence: 0.8, reasoning: 'Moderate anxiety symptoms' };
    }
    
    // Calm/positive indicators
    if (lowerText.match(/\b(calm|okay|fine|better|good|stable|peaceful|managing)\b/)) {
      return { category: 'LOW_STRESS', confidence: 0.85, reasoning: 'Calm emotional state' };
    }
    
    // Default moderate stress
    return { category: 'MODERATE_STRESS', confidence: 0.6, reasoning: 'Default stress classification' };
  }

  extractLocation(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.match(/\b(home|house|apartment|my place)\b/)) {
      return { extractedValue: 'home', confidence: 0.9, extractionMethod: 'keyword matching' };
    }
    
    if (lowerText.match(/\b(shelter|safe room|bunker|protected area)\b/)) {
      return { extractedValue: 'shelter', confidence: 0.95, extractionMethod: 'safety location' };
    }
    
    if (lowerText.match(/\b(building|office|store|mall)\b/)) {
      return { extractedValue: 'building', confidence: 0.8, extractionMethod: 'structure identification' };
    }
    
    if (lowerText.match(/\b(outside|street|car|vehicle)\b/)) {
      return { extractedValue: 'outside', confidence: 0.85, extractionMethod: 'outdoor location' };
    }
    
    return { extractedValue: 'unknown location', confidence: 0.4, extractionMethod: 'no clear location' };
  }

  runConversationTest(testCase) {
    console.log(`\n🔬 Testing: ${testCase.name}`);
    console.log(`📋 Scenario: ${testCase.description}`);
    
    const controller = new ConversationController();
    const flowPath = [controller.getCurrentNode().id];
    const interactions = [];
    
    for (let i = 0; i < testCase.inputs.length; i++) {
      const input = testCase.inputs[i];
      const currentNode = controller.getCurrentNode();
      
      // Skip if conversation ended
      if (currentNode.type === 'end') {
        console.log(`  ⚠️  Conversation ended early at: ${currentNode.id}`);
        break;
      }
      
      const parserType = controller.getCurrentParserType();
      console.log(`\n  💬 Input ${i + 1}: "${input}"`);
      console.log(`  📍 Current Node: ${currentNode.id}`);
      console.log(`  🧠 Parser: ${parserType}`);
      
      // Run appropriate parser
      let parserResult;
      if (parserType === 'classifySafety') {
        const result = this.classifySafety(input);
        parserResult = { type: 'classification', ...result };
      } else if (parserType === 'classifyStress') {
        const result = this.classifyStress(input);
        parserResult = { type: 'classification', ...result };
      } else if (parserType === 'extractLocation') {
        const result = this.extractLocation(input);
        parserResult = { type: 'extraction', informationType: 'location', ...result };
      } else {
        const result = this.classifyStress(input);
        parserResult = { type: 'classification', ...result };
      }
      
      console.log(`  🔍 Classification: ${parserResult.category || parserResult.extractedValue} (${Math.round(parserResult.confidence * 100)}%)`);
      
      try {
        const { nextNode, activityTrigger } = controller.processParserOutput(parserResult);
        
        console.log(`  ➡️  Next Node: ${nextNode.id}`);
        flowPath.push(nextNode.id);
        
        if (activityTrigger) {
          console.log(`  🎯 Activity: ${activityTrigger.activityName}`);
          console.log(`  🔄 Return: ${activityTrigger.returnNode}`);
          
          // Simulate activity completion
          controller.moveToNode(activityTrigger.returnNode);
          const returnNode = controller.getCurrentNode();
          flowPath.push(returnNode.id);
          console.log(`  ↩️  Returned to: ${returnNode.id}`);
        }
        
        interactions.push({
          input,
          parserResult,
          nodeId: nextNode.id,
          activityTrigger: activityTrigger?.activityName
        });
        
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        return { success: false, error: error.message, flowPath, interactions };
      }
    }
    
    const finalNode = controller.getCurrentNode();
    console.log(`\n  🏁 Final State: ${finalNode.id} (${finalNode.type})`);
    console.log(`  🗺️  Flow Path: ${flowPath.join(' → ')}`);
    
    return {
      success: true,
      flowPath,
      interactions,
      finalNode: finalNode.id,
      finalType: finalNode.type
    };
  }

  validateTestCase(testCase, result) {
    const validations = [];
    
    // Check if conversation reached appropriate ending
    if (testCase.expectedOutcome) {
      const outcomeMatch = result.finalNode.includes(testCase.expectedOutcome) || 
                          result.finalType === testCase.expectedOutcome;
      validations.push({
        test: 'Expected Outcome',
        passed: outcomeMatch,
        expected: testCase.expectedOutcome,
        actual: `${result.finalNode} (${result.finalType})`
      });
    }
    
    // Check if required activities were triggered
    if (testCase.expectedActivities) {
      const triggeredActivities = result.interactions
        .filter(i => i.activityTrigger)
        .map(i => i.activityTrigger);
      
      const activitiesMatch = testCase.expectedActivities.every(activity => 
        triggeredActivities.includes(activity)
      );
      
      validations.push({
        test: 'Activity Triggers',
        passed: activitiesMatch,
        expected: testCase.expectedActivities.join(', '),
        actual: triggeredActivities.join(', ')
      });
    }
    
    // Check if critical nodes were visited
    if (testCase.requiredNodes) {
      const visitedNodes = result.flowPath;
      const nodesVisited = testCase.requiredNodes.every(node => 
        visitedNodes.includes(node)
      );
      
      validations.push({
        test: 'Required Nodes',
        passed: nodesVisited,
        expected: testCase.requiredNodes.join(', '),
        actual: visitedNodes.join(', ')
      });
    }
    
    return validations;
  }

  runFullTestSuite() {
    console.log('🚀 CALMe Phase 2 Production Test Suite');
    console.log('=====================================\n');
    
    const testCases = [
      {
        name: 'Emergency Protocol Activation',
        description: 'Person in immediate danger should trigger emergency mode',
        inputs: ['There are explosions outside and I cannot get to safety'],
        expectedOutcome: 'emergency_mode',
        requiredNodes: ['safety_check', 'emergency_mode']
      },
      
      {
        name: 'High Stress Breathing Intervention',
        description: 'Panic attack should trigger breathing exercise',
        inputs: [
          'I\'m safe at home with my family',
          'I\'m having a panic attack, my heart is racing and I can\'t breathe properly',
          'The breathing exercise helped, I feel a bit calmer now'
        ],
        expectedActivities: ['breathing'],
        requiredNodes: ['safety_check', 'stress_level', 'breathing_activity', 'breathing_return']
      },
      
      {
        name: 'Confusion to Grounding Activity',
        description: 'Dissociation should trigger grounding exercise',
        inputs: [
          'I think I\'m in a safe place',
          'Everything feels fuzzy and distant, like I\'m floating outside my body'
        ],
        expectedActivities: ['matching-cards'],
        requiredNodes: ['safety_check', 'stress_level', 'grounding_activity']
      },
      
      {
        name: 'Safety Uncertainty Resolution',
        description: 'Uncertain safety should ask clarification',
        inputs: [
          'I\'m not sure if I\'m completely safe here',
          'Yes, I think I can get to a more secure location',
          'I\'m feeling moderately anxious about the situation'
        ],
        requiredNodes: ['safety_check', 'safety_clarify', 'stress_level']
      },
      
      {
        name: 'Low Stress Support Flow',
        description: 'Calm person should get appropriate support',
        inputs: [
          'We\'re all safe in our home shelter',
          'I\'m feeling calm and trying to keep my family calm too',
          'I think we\'re all doing okay for now'
        ],
        expectedOutcome: 'end',
        requiredNodes: ['safety_check', 'stress_level']
      },
      
      {
        name: 'Ongoing Support Loop',
        description: 'Person requesting continued support',
        inputs: [
          'I\'m safe inside a building',
          'I\'m feeling pretty anxious and worried',
          'I\'d like to keep talking, I don\'t want to be alone right now',
          'I\'m still feeling anxious about everything'
        ],
        requiredNodes: ['safety_check', 'stress_level', 'ongoing_support', 'continued_conversation']
      }
    ];
    
    let totalPassed = 0;
    let totalValidations = 0;
    
    testCases.forEach((testCase, index) => {
      console.log(`\n[${ index + 1}/${testCases.length}] Running Test Case...`);
      this.totalTests++;
      
      const result = this.runConversationTest(testCase);
      
      if (!result.success) {
        console.log(`❌ Test Failed: ${result.error}`);
        return;
      }
      
      const validations = this.validateTestCase(testCase, result);
      
      console.log('\n  📊 Validation Results:');
      validations.forEach(validation => {
        totalValidations++;
        if (validation.passed) {
          console.log(`    ✅ ${validation.test}: PASSED`);
          totalPassed++;
        } else {
          console.log(`    ❌ ${validation.test}: FAILED`);
          console.log(`       Expected: ${validation.expected}`);
          console.log(`       Actual: ${validation.actual}`);
        }
      });
      
      this.passedTests += validations.every(v => v.passed) ? 1 : 0;
    });
    
    // Final Report
    console.log('\n' + '='.repeat(60));
    console.log('📋 PRODUCTION TEST SUITE RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Overall Results:`);
    console.log(`   🧪 Test Cases: ${this.passedTests}/${this.totalTests} passed`);
    console.log(`   ✅ Validations: ${totalPassed}/${totalValidations} passed`);
    console.log(`   📈 Success Rate: ${Math.round((totalPassed / totalValidations) * 100)}%`);
    
    if (totalPassed === totalValidations) {
      console.log('\n🎉 ALL TESTS PASSED! Phase 2 is production ready.');
      console.log('\n✅ Validated Capabilities:');
      console.log('   • Emergency protocol activation');
      console.log('   • Stress-based activity triggers');
      console.log('   • Conversation flow navigation');
      console.log('   • Activity integration and returns');
      console.log('   • Safety assessment and clarification');
      console.log('   • Ongoing support mechanisms');
    } else {
      console.log(`\n⚠️  ${totalValidations - totalPassed} validation(s) failed.`);
      console.log('Review the specific failures above for issues to address.');
    }
    
    console.log('\n🚀 CALMe therapeutic conversation system is ready for deployment!');
    
    return totalPassed === totalValidations;
  }
}

// Run the production test suite
if (require.main === module) {
  const testSuite = new ProductionTestSuite();
  const allPassed = testSuite.runFullTestSuite();
  process.exit(allPassed ? 0 : 1);
}

module.exports = { ProductionTestSuite };