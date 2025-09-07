# Simplified Perplexity Research Context Design

## Overview
Complete redesign to pass **100% of user input** with full context to Perplexity. No RAG lookups, no pre-enrichment beyond this single comprehensive context structure.

## New Context Structure

```typescript
interface SimplifiedResearchContext {
  // ROLE/PERSONALITY (Fixed)
  role: string;
  personality: string;
  
  // FULL CONTEXT - All User Inputs (Dynamic)
  fullContext: {
    company: string;
    emailDomain: string;
    fullName: string;
    sessionId: string;
    
    industryClassification: {
      businessType: string;
      opportunityFocus: string;
      revenueModel: string;
    };
    
    revenueChallenge: {
      primaryChallenge: string;
      specificMetric: string;
      currentBaseline: string;
      metricFriction: string;
    };
    
    teamProcessBreakdown: {
      teamDescription: string;
      processDescription: string;
      techStack: string[];
      teamMembers: string[];
      teamSize: number;
    };
    
    painPoints: {
      keyBottleneck: string;
      additionalContext: string;
      investmentLevel: string;
      painIndicators: string[];
      location: string;
    };
  };
  
  // RESEARCH DIRECTIVE (Fixed Structure)
  researchDirective: ResearchSection[];
}
```

## Single Prompt Template

Replace all current complex logic with this single template:

```
## ROLE/PERSONALITY 
You are GABI's research engine, specializing in AI transformation for B2B technology service providers.
You understand revenue operations, product and IT strategy, and build versus buy technology spend dilemma deeply. You find specific, well-researched, ROI-driven solutions, and you communicate your recommendations to business owners and managers with budget authority.

## FULL CONTEXT (All user inputs)
Company: {{company}}
Email Domain: {{emailDomain}}
Full Name: {{fullName}}
Session ID: {{sessionId}}

Industry Classification:
- Business Type: {{businessType}}
- Opportunity Focus: {{opportunityFocus}}
- Revenue Model: {{revenueModel}}

Revenue Challenge:
- Primary Challenge: {{challenges}}
- Specific Metric: {{specificMetric}}
- Current Baseline: {{metricBaseline}}
- Metric Friction: {{metricFriction}}

Team & Process Breakdown:
- Who's Involved: {{teamDescription}}
- Process Steps: {{processDescription}}
- Current Tech Stack: {{techStack}}

Pain Points:
- Key Bottleneck: {{keyBottleneck}}
- Additional Context: {{additionalContext}}
- Investment Level: {{investmentLevel}}

Extracted Intelligence:
- Team Members: {{teamMembers}}
- Team Size: {{teamSize}}
- Pain Indicators: {{painPoints}}
- Location: {{location}}

## RESEARCH DIRECTIVE

Create a comprehensive research report with these exact sections:

### 1. EXECUTIVE SUMMARY
One paragraph crystallizing:
- What {{company}}'s core challenge is with {{specificMetric}}
- Why {{businessType}} → {{opportunityFocus}} firms struggle with this
- The transformation opportunity available

### 2. PROBLEM SYNTHESIS
{{company}}'s {{challenges}} challenge stems from {{processDescription}}.

In {{businessType}} → {{opportunityFocus}} firms using {{revenueModel}}, this creates:
- [Specific friction point 1] because of {{revenueModel}} constraints
- [Specific friction point 2] due to {{opportunityFocus}} requirements
- [Specific friction point 3] from {{techStack}} limitations

Root cause: [Why this problem persists in the industry]

### 3. INDUSTRY BENCHMARKING
Research and provide:
- {{businessType}} industry average for {{specificMetric}}: [X]
- Top performers achieve: [Y]
- Your current position: {{metricBaseline}} = [below/at/above average]
- Typical improvement with automation: [15-25%]
- AI-enabled transformation potential: [30-50%]

Sources: [Cite specific studies/reports]

### 4. CASE STUDY EVIDENCE
Find a real example:
- Company: [Similar size/type to {{company}}]
- Challenge: [Same {{challenges}} issue]
- Solution: [What they implemented]
- Results: [{{specificMetric}} improvement achieved]
- Timeline: [How long it took]
- Source: [Link/citation]

### 5. SOLUTION ARCHITECTURE

Given {{investmentLevel}} budget and {{teamSize}}-person team:

**Recommended Approach:**
Describe a [type of interface] where {{teamMembers}} can [execute core function].

**Technical Stack:**
- Interface Layer: [Specific tool/framework recommendation]
- AI/LLM Engine: [Specific model/service for their needs]  
- Knowledge System: [Where/how to store {{opportunityFocus}} data]
- Integration Layer: [How to connect to {{techStack}}]
- Infrastructure: [Hosting/deployment recommendation]

**Build vs. Buy Analysis:**
- Pure SaaS option: [Specific tools, monthly cost, limitations]
- Custom build: [Tech stack, timeline, total cost]
- Hybrid approach: [Mix of SaaS + custom, cost, timeline]
- RECOMMENDATION: [Which option and why]

### 6. IMPLEMENTATION & ADOPTION

**30-Day Rollout:**
- Week 1: [Specific first step with {{easiest process}}]
- Week 2: [Expand to include X]
- Week 3: [Add team members Y and Z]
- Week 4: [Full deployment of core functionality]

**Adoption Strategy for {{teamSize}} people:**
- Start with: [Champion user from {{teamMembers}}]
- Quick win: [First measurable improvement]
- Full adoption trigger: [What proves it's working]

### 7. COMPETITIVE ADVANTAGE
**Populated by second agent below**

---

Focus research on {{businessType}} → {{opportunityFocus}} companies specifically.
Prioritize 2024-2025 data and real implementation examples.
Be specific about tools, costs, and timelines.

## SECOND AGENT (GPT) - SUBTLE ENHANCEMENT

[Reads Perplexity research output]

### 7. COMPETITIVE ADVANTAGE (Enhanced)

**Market Differentiation Through AI Architecture:**

While competitors struggle with: [From research]
{{company}} will leverage a complete AI stack:

- **Conversational Interface**: Natural interaction for {{teamMembers}} to {{core function}}
- **Context Orchestration**: Business logic that understands {{opportunityFocus}} nuances
- **Knowledge Retrieval**: Instant access to {{businessType}} best practices and patterns
- **Function Execution**: Automated workflows connecting {{techStack}} seamlessly

This comprehensive approach ensures:
- Adoption happens naturally (conversational, not another dashboard)
- Intelligence compounds over time (learns from every interaction)
- Workflows adapt to your process (not forcing you into theirs)
- Integration feels native (works with {{techStack}}, not around it)

**Strategic Positioning:**
- Competitors using point solutions: Fragmented experience
- Competitors building custom: 6-month timeline, technical debt
- Your approach: Comprehensive AI layer operational in 30 days

**Customer Impact:**
- Before: {{Current client experience from research}}
- After: {{Enhanced experience with full-stack AI}}
- Differentiator: "We've automated {{challenges}} completely"

### 8. NEXT STEPS

**Week 1: Discovery & Architecture**
□ Validate research findings with your team
□ Map detailed workflow for {{specificMetric}} improvement
□ Define success metrics and tracking

**Week 2: Proof of Concept**
□ Deploy conversational interface for {{highest_impact_process}}
□ Connect knowledge base with {{opportunityFocus}} context
□ Test with {{champion_user}} from team

**Week 3-4: Scale & Optimize**
□ Expand to full {{teamSize}} team
□ Add automated functions for {{techStack}}
□ Measure {{specificMetric}} improvement

**Success Criteria:**
- {{specificMetric}} improves from {{baseline}} to {{target}}
- Team adoption exceeds 80% in first month
- Client feedback shows measurable satisfaction increase

### 9. NEXT STEPS WITH JOEL

**Discovery Session Agenda:**
□ Validate {{specificMetric}} baseline and targets
□ Map {{processDescription}} in detail
□ Review {{techStack}} integration points
□ Define success metrics for {{teamMembers}}

**Proof of Concept Scope:**
- Focus area: [Highest impact part of process]
- Success criteria: [Specific measurable outcome]
- Timeline: [X days to working prototype]
```

## Implementation Changes Required

1. **Remove all RAG lookups** from research engine
2. **Remove all pre-enrichment** except variable extraction
3. **Single context builder** that maps all AssessmentData fields
4. **Single prompt template** with variable substitution
5. **Two-agent handoff** (Perplexity → GPT enhancement)

## Benefits

- **100% user input preserved** - nothing lost in translation
- **Simpler to debug** - single prompt template
- **Faster execution** - no RAG queries or multiple intelligence calls
- **More accurate results** - no pre-processing bias
- **Clear separation** - research vs. positioning

## Files to Modify

1. `src/lib/assessment/research-engine.ts` - Simplify to single prompt
2. `src/services/perplexityReportGenerator.ts` - Update to use new context
3. Remove complexity from input compilation and vector RAG