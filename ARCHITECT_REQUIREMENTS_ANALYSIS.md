# Architect Requirements Analysis

## Requirements Status Check

### ✅ Already Implemented
1. **Pre-Knowledge Context Capture** - COMPLETE
   - `DiscoverySetup.tsx`: Captures account, contact details
   - `DiscoveryICP.tsx`: Industry vertical selection
   - `DiscoveryContext.tsx`: Business area, solution scope, next steps
   - All stored in session context

2. **Document-Style Note-Taking** - COMPLETE
   - Collapsible question blocks with citations
   - Previous questions preserved with answers
   - Clean note-taking interface

3. **Progress Tracking** - COMPLETE
   - 16-assessment minimum (2 per area)
   - Visual progress indicators
   - Completion detection

4. **8 Discovery Areas** - COMPLETE
   - All areas defined with initial questions
   - Area navigation and selection working

5. **Question Generation with Context** - PARTIAL
   - OpenAI integration ready (mock mode)
   - Basic context passing implemented
   - Needs depth algorithm enhancement

### ⚠️ Needs Enhancement

1. **Console Font for Conversation Text** - NEW
   - Add monospace/console font for Q&A blocks
   - Maintain Inter for UI elements

2. **Depth Algorithm** - ENHANCE
   - Currently: Simple progression
   - Needed: Quality-based depth decisions
   - Max 5, Min 2 questions per area

3. **Note Quality Assessment** - NEW
   - Analyze notes for complexity signals
   - Check for quantification
   - Identify technical details
   - Guide deeper questioning

4. **Question Intelligence** - ENHANCE
   - Better industry-specific prompting
   - Progressive deepening patterns
   - Connection to discovery context

5. **Scoping Review Step** - NEW
   - Pre-report consultant confirmation
   - Budget scope selection
   - Confidence level assessment
   - Next step confirmation

6. **Report Generation Pipeline** - ENHANCE
   - Structure discovery notes
   - Extract requirements
   - Generate executive summary
   - Enrich with Perplexity research

## Immediate Action Items

### 1. Typography Update (Quick Win)
```css
/* Add Console font for conversation windows */
.question-text, .notes-text {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
```

### 2. Enhanced Question Generation Prompt
```typescript
// Add to OpenAI service
const ELICITATION_PROMPT = `
You are a Certified Business Analysis Professional conducting discovery.

PRE-KNOWLEDGE CONTEXT:
- Prospect: ${session.contact_name}, ${session.contact_role}
- Industry: ${session.client_icp}
- Business Area: ${session.business_area}
- Discovery Catalyst: ${session.discovery_context}
- Expected Solution Scope: ${session.solution_scope}

[Rest of enhanced prompt...]
`;
```

### 3. Depth Manager Implementation
```typescript
class ElicitationDepthManager {
  assessNoteQuality(notes: string): NoteQuality {
    return {
      hasUncoveredComplexity: /critical|urgent|blocked|failed/i.test(notes),
      hasSpecificRequirements: /must have|need|require/i.test(notes),
      hasQuantification: /\d+|hours|days|dollars|percent/i.test(notes),
      hasTechnicalDetail: /system|API|database|workflow/i.test(notes)
    };
  }
}
```

### 4. Scoping Review Component
```typescript
// New component before report generation
interface ScopingReview {
  budgetScope: string;
  recommendedNextStep: string;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  additionalContext?: string;
}
```

## Implementation Priority

1. **Console Font** - 5 minutes ✅
2. **Enhance Question Prompts** - 30 minutes
3. **Depth Algorithm** - 1 hour
4. **Note Quality Assessment** - 1 hour
5. **Scoping Review UI** - 2 hours
6. **Report Pipeline Enhancement** - 2 hours

## Key Insight
The architect is emphasizing **CBAP-grade elicitation intelligence** - this means our questions need to be much more sophisticated, building progressive depth based on response quality rather than simple counting.

The pre-knowledge context we're already capturing needs to be woven into every question to make them feel industry-specific and contextual.