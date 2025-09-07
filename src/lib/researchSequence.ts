// Research Sequence with Dependency Chain and Cross-Sectional Analysis
import type { ContextInferences, ResearchResult, ResearchStep } from '@/types/assessment';
import { extractSuccessMetrics, extractBudgetRange, extractTeamInfo, enhanceAssessmentData, extractPainLevel, extractUrgency } from './dataHelpers';

// System prompt for all research calls
export const RESEARCH_SYSTEM_PROMPT = `You are a senior strategic consultant specializing in AI transformation. 
Generate specific, actionable insights based on the business context provided.
Use precise calculations, realistic timelines, and connect every recommendation back to their situation.
Be consultative, not salesy. Show deep understanding of their industry and challenges.
Always return detailed, professional analysis that feels like expensive consulting work.`;

// Research sequence with dependencies
export const RESEARCH_SEQUENCE: ResearchStep[] = [
  {
    name: 'ROI_ANALYSIS',
    displayName: 'Calculating value of solving your challenge',
    promptGenerator: generateROIPrompt
  },
  {
    name: 'BENCHMARKS',
    displayName: 'Researching how top performers in your industry operate',
    promptGenerator: generateBenchmarkPrompt
  },
  {
    name: 'CHALLENGE_DEEPDIVE',
    displayName: 'Analyzing root causes and hidden costs',
    promptGenerator: generateChallengePrompt
  },
  {
    name: 'SOLUTIONS',
    displayName: 'Designing your progressive AI transformation',
    promptGenerator: generateSolutionsPrompt
  },
  {
    name: 'INVESTMENT',
    displayName: 'Creating investment scenarios within your budget',
    promptGenerator: generateInvestmentPrompt
  },
  {
    name: 'ROADMAP',
    displayName: 'Building your 12-month implementation path',
    promptGenerator: generateRoadmapPrompt
  },
  {
    name: 'ADVANCED_OKR',
    displayName: 'Crafting your transformative growth objective',
    promptGenerator: generateOKRPrompt
  },
  {
    name: 'CONTEXT_INTELLIGENCE',
    displayName: 'Positioning GABI Intelligence for your future',
    promptGenerator: generateGABIPrompt
  }
];

// Prompt generator functions with cross-sectional analysis

export function generateROIPrompt(
  data: any, // Accept flexible data structure
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  // Extract data flexibly using helpers
  const enhanced = enhanceAssessmentData(data);
  const successMetrics = extractSuccessMetrics(data);
  const budgetRange = extractBudgetRange(data);
  const teamInfo = extractTeamInfo(data);
  
  return `
Analyze ROI for ${enhanced.businessName}, a ${inferences.maturityLevel} company in ${enhanced.icpType}.

CONTEXT INTERSECTION ANALYSIS:
• ICP + Revenue Model: ${enhanced.icpType} operating with ${data.revenueModel || 'service-based'} model
• Challenge + Process: "${enhanced.revenueChallenge}" where current process is "${enhanced.teamProcess}"
• Tools + Budget: Currently using ${enhanced.solutionStack} with $${budgetRange.min}-${budgetRange.max}/month capacity
• Team + Pain: ${teamInfo.affected} people in ${teamInfo.department} experiencing ${enhanced.painLevel}/10 pain level

SUCCESS FOCUS:
${successMetrics}

HIDDEN MULTIPLIERS (inferred): ${inferences.hiddenMultipliers.join(', ')}
COMPETITIVE PRESSURE: ${inferences.competitivePressure}
IMPLEMENTATION URGENCY: ${enhanced.urgency}

CALCULATE COMPREHENSIVE ROI:

1. CURRENT STATE TOTAL COST:
   • Direct labor cost (${teamInfo.affected} people × average salary × time spent on this process)
   • Current process inefficiencies: "${enhanced.teamProcess}"
   • Tool licensing and maintenance costs for: ${enhanced.solutionStack}
   • Opportunity cost (what else could team accomplish?)
   • Hidden costs from the multiplier effects listed above
   • Error correction and rework costs

2. VALUE OF SUCCESS FOCUS:
   • Calculate specific dollar value for: ${successMetrics}
   • Factor in realistic timeline and compounding effects
   • Consider both direct savings and revenue uplift
   • Make educated estimates where specific metrics aren't provided

3. BREAK-EVEN ANALYSIS:
   • At $${budgetRange.min}/month investment level
   • At $${budgetRange.max}/month investment level
   • Timeline to positive ROI at each level

4. PROJECTED ROI:
   • 12-month ROI projection with confidence intervals
   • 3-year cumulative ROI accounting for scale effects
   • Risk factors and sensitivity analysis

SPECIFIC REQUIREMENTS:
• Use actual numbers from their process description: "${enhanced.teamProcess}"
• Factor in ${inferences.maturityLevel} characteristics (adoption speed, risk factors)
• Account for ${inferences.competitivePressure} competitive pressure in urgency calculations
• Make intelligent inferences from the rich context provided
• Include both quantitative and strategic value components

Return detailed financial analysis with clear calculations and assumptions.
`;
}

export function generateBenchmarkPrompt(
  data: any,
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  const roiAnalysis = previousResults[0]?.content || '';
  const enhanced = enhanceAssessmentData(data);
  const successMetrics = extractSuccessMetrics(data);
  const budgetRange = extractBudgetRange(data);
  const teamInfo = extractTeamInfo(data);
  
  return `
Research industry benchmarks for ${enhanced.icpType} companies addressing ${enhanced.revenueChallenge}.

COMPANY CONTEXT:
• Maturity: ${inferences.maturityLevel}
• Team size: ${teamInfo.affected} in ${teamInfo.department}
• Current focus: ${successMetrics}
• Competitive pressure: ${inferences.competitivePressure}

ROI CONTEXT FROM PREVIOUS ANALYSIS:
${roiAnalysis}

BENCHMARK RESEARCH AREAS:

1. INDUSTRY PERFORMANCE STANDARDS:
   • What are typical performance levels for ${data.icpType} companies?
   • How do ${inferences.maturityLevel} companies typically perform vs. mature leaders?
   • What metrics separate top 25% performers from average?

2. AI ADOPTION PATTERNS:
   • How are similar companies solving ${data.revenueChallenge}?
   • What's the typical ROI timeline for AI implementations in this space?
   • Common failure patterns and success factors

3. INVESTMENT BENCHMARKS:
   • Typical budget ranges for ${data.icpType} AI transformations
   • What results do companies see at $${budgetRange.min}-${budgetRange.max}/month investment levels?
   • Resource allocation patterns (technology vs. change management vs. training)

4. COMPETITIVE DYNAMICS:
   • How is AI creating competitive advantages in ${data.icpType}?
   • What happens to companies that don't adopt (${inferences.competitivePressure} pressure environment)?
   • Emerging threats and opportunities

5. SUCCESS METRIC BENCHMARKING:
   • Industry averages for each of their defined success metrics
   • What improvement rates are realistic vs. aspirational?
   • Timeframe expectations for each type of improvement

CONNECT TO THEIR SPECIFIC SITUATION:
• How do they compare to industry averages currently?
• What does their target performance ranking mean competitively?
• Which of their success metrics offer the biggest competitive differentiation?

Provide specific, actionable benchmarks that directly relate to their success indicators and business context.
`;
}

export function generateChallengePrompt(
  data: any,
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  const roiAnalysis = previousResults[0]?.content || '';
  const benchmarks = previousResults[1]?.content || '';
  const enhanced = enhanceAssessmentData(data);
  const teamInfo = extractTeamInfo(data);
  
  return `
Deep dive analysis: Why is ${enhanced.businessName} stuck with ${enhanced.revenueChallenge}?

ANALYTICAL CONTEXT:
ROI Impact: ${roiAnalysis}
Industry Comparison: ${benchmarks}

THEIR CURRENT REALITY:
• Process: "${enhanced.teamProcess}"
• Tools creating friction: ${enhanced.solutionStack}
• Pain Level: ${enhanced.painLevel}/10 (${enhanced.urgency} urgency)
• Maturity stage: ${inferences.maturityLevel}
• Team context: ${teamInfo.affected} people in ${teamInfo.department}

SYSTEMATIC CHALLENGE ANALYSIS:

1. ROOT CAUSE ANALYSIS (Beyond Surface Symptoms):
   • Why does ${data.revenueChallenge} exist in a ${inferences.maturityLevel} ${data.icpType} company?
   • What decisions or constraints led to the current state?
   • How do their tools (${data.solutionStack}) contribute to the problem?
   • What organizational dynamics perpetuate this challenge?

2. CASCADING EFFECTS MAPPING:
   • How does this bottleneck affect other business areas?
   • Connect to the hidden multipliers: ${inferences.hiddenMultipliers.join(', ')}
   • Impact on team morale and productivity beyond direct costs
   • Customer experience implications

3. ORGANIZATIONAL INERTIA FACTORS:
   • What makes this hard to fix manually?
   • Why haven't they solved this already with existing tools?
   • Resource constraints vs. priority conflicts
   • Skills/knowledge gaps preventing resolution

4. COMPETITIVE DISADVANTAGE ANALYSIS:
   • How does this hurt them vs. industry leaders?
   • Given ${inferences.competitivePressure} competitive pressure, what's the urgency?
   • Market opportunities they're missing due to this constraint
   • Customer acquisition/retention impacts

5. FUTURE RISK ASSESSMENT:
   • What happens if they don't solve this in next 12 months?
   • How does the problem compound over time?
   • Scaling implications: what breaks first as they grow?

SPECIFIC TO THEIR CONTEXT:
• Factor in ${data.icpType} industry dynamics and ${data.revenueModel} model constraints
• Consider their maturity stage (${inferences.maturityLevel}) typical challenges
• Address their specific success focus: ${extractSuccessMetrics(data)}

Provide a consultant-level analysis that shows deep understanding of their business reality and creates urgency around solving this systematically.
`;
}

export function generateSolutionsPrompt(
  data: any,
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  // Extract data flexibly
  const enhanced = enhanceAssessmentData(data);
  const budgetRange = extractBudgetRange(data);
  const teamInfo = extractTeamInfo(data);
  const successMetrics = extractSuccessMetrics(data);
  const contextSummary = previousResults.map(r => r.content).join('\n\n---\n\n');
  
  return `
Design progressive AI solutions for ${enhanced.businessName} based on comprehensive analysis.

COMPLETE CONTEXT:
${contextSummary}

SOLUTION DESIGN FRAMEWORK:

Design THREE implementation levels based on their budget and risk preference:

CRAWL Level ($${budgetRange.min}/month - "Prove Value First"):
• Address immediate pain in ${enhanced.revenueChallenge}
• Minimal disruption to existing ${enhanced.solutionStack}
• Quick win targeting: ${successMetrics.split(',')[0] || 'primary efficiency metric'}
• 30-day implementation timeline
• Specific tools/approaches for ${inferences.maturityLevel} company
• Risk mitigation for ${inferences.competitivePressure} competitive environment

WALK Level ($${Math.round((budgetRange.min + budgetRange.max) / 2)}/month - "Balanced Transformation"):
• Expand to address hidden multiplier: ${inferences.hiddenMultipliers[0] || 'secondary challenge'}
• Strategic integration with existing ${enhanced.solutionStack}
• Progress toward success focus: ${successMetrics}
• 90-day implementation with measurable milestones
• Change management for ${teamInfo.affected} people in ${teamInfo.department}

RUN Level ($${budgetRange.max}/month - "Full Transformation"):
• Complete transformation of ${enhanced.revenueChallenge} process
• New capabilities that create ${enhanced.icpType} market leadership
• Achievement of all success targets with stretch goals
• 6-12 month comprehensive vision
• Platform for future AI initiatives beyond current scope

SOLUTION SPECIFICATIONS:
• Each tier must build on the previous (progressive enhancement)
• Show clear value progression and ROI improvement at each level
• Address ${data.urgency} timeline requirements
• Factor in ${inferences.maturityLevel} implementation capabilities
• Connect to their desired outcome: "${data.desiredOutcome || 'operational excellence'}"

INTEGRATION REQUIREMENTS:
• How solutions work with/replace current tools: ${data.solutionStack}
• Team training and adoption for ${teamInfo.affected} people
• Process changes required (given current: "${data.teamProcess}")
• Measurement against their specific success indicators

Return detailed solution architecture for each tier with specific technology recommendations, implementation steps, and expected outcomes.
`;
}

export function generateInvestmentPrompt(
  data: any,
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  const solutions = previousResults.find(r => r.name === 'SOLUTIONS')?.content || '';
  const roiAnalysis = previousResults.find(r => r.name === 'ROI_ANALYSIS')?.content || '';
  const budgetRange = extractBudgetRange(data);
  
  return `
Create detailed investment scenarios for ${data.businessName} within their $${budgetRange.min}-${budgetRange.max}/month budget range.

SOLUTION CONTEXT:
${solutions}

ROI FOUNDATION:
${roiAnalysis}

INVESTMENT SCENARIO MODELING:

SCENARIO 1: CONSERVATIVE ($${budgetRange.min}/month)
• Detailed cost breakdown (technology, implementation, ongoing)
• Resource allocation across 6 months
• Expected ROI timeline and confidence level
• Risk factors and mitigation strategies
• Success metrics achievable at this investment level

SCENARIO 2: BALANCED ($${Math.round((budgetRange.min + budgetRange.max) / 2)}/month)
• Enhanced capability additions
• Accelerated implementation timeline
• Additional success metrics addressed
• Team expansion or external expertise requirements
• Scaling benefits and compound returns

SCENARIO 3: AGGRESSIVE ($${budgetRange.max}/month)
• Full transformation capabilities
• Market leadership positioning benefits
• All success metrics plus stretch goals
• Strategic competitive advantages gained
• Long-term platform value (2-3 year outlook)

INVESTMENT ANALYSIS FRAMEWORK:

1. COST STRUCTURE BREAKDOWN:
   • Technology/software costs (% of budget)
   • Implementation services (% of budget)
   • Training and change management (% of budget)
   • Ongoing support and optimization (% of budget)

2. PAYBACK CALCULATIONS:
   • Month-by-month cash flow impact
   • Break-even timeline for each scenario
   • NPV calculations over 24 months
   • Sensitivity analysis (best case, worst case, likely case)

3. RISK-ADJUSTED RETURNS:
   • Probability weighting for different outcome scenarios
   • Risk factors specific to ${inferences.maturityLevel} companies
   • Market timing considerations (${inferences.competitivePressure} pressure)

4. RESOURCE REQUIREMENTS:
   • Internal team time commitment (for ${extractTeamInfo(data).affected} people)
   • External expertise needs
   • Infrastructure/integration requirements
   • Change management effort

STRATEGIC CONSIDERATIONS:
• How each investment level positions them competitively
• Alignment with ${data.urgency} timeline requirements
• Building blocks for future AI initiatives
• ${data.revenueModel} business model optimization opportunities

Provide specific, actionable investment recommendations with clear financial projections and risk assessments.
`;
}

export function generateRoadmapPrompt(
  data: any,
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  const solutions = previousResults.find(r => r.name === 'SOLUTIONS')?.content || '';
  const investment = previousResults.find(r => r.name === 'INVESTMENT')?.content || '';
  
  return `
Build a detailed 12-month implementation roadmap for ${data.businessName}.

FOUNDATION:
Solutions: ${solutions}
Investment: ${investment}

ROADMAP DESIGN CONSTRAINTS:
• Must achieve: ${extractSuccessMetrics(data)}
• Team capacity: ${extractTeamInfo(data).affected} people in ${extractTeamInfo(data).department}
• Implementation urgency: ${data.urgency}
• Maturity considerations: ${inferences.maturityLevel} company capabilities

DETAILED IMPLEMENTATION ROADMAP:

PHASE 1: FOUNDATION (Months 1-2)
• Week-by-week breakdown of initial setup
• Team preparation and training schedule
• Risk mitigation activities
• Early wins and proof points
• Success metrics for phase completion

PHASE 2: CORE IMPLEMENTATION (Months 3-6)
• Detailed project timeline with dependencies
• Resource allocation and milestone tracking
• Integration with existing ${data.solutionStack}
• Process changes and team adoption curve
• Mid-point success measurement

PHASE 3: OPTIMIZATION & SCALE (Months 7-12)
• Performance tuning and advanced features
• Full team adoption and process maturation
• Success metric achievement validation
• Preparation for next-level capabilities
• ROI measurement and reporting

CRITICAL SUCCESS FACTORS:
• Change management for ${inferences.maturityLevel} organization
• Technical integration challenges and solutions
• Team skills development requirements
• Stakeholder communication and buy-in strategies

RISK MANAGEMENT:
• Common implementation pitfalls in ${data.icpType} companies
• Contingency plans for technical/adoption challenges
• Budget variance management
• Timeline adjustment triggers

MEASUREMENT & GOVERNANCE:
• Weekly/monthly tracking metrics
• Go/no-go decision points
• Success metric progress tracking
• ROI validation milestones
• Stakeholder reporting cadence

FUTURE STATE PREPARATION:
• Platform readiness for additional AI capabilities
• Team skill development for ongoing innovation
• Process maturity for continuous improvement
• Market positioning advantages achieved

Provide a practical, detailed roadmap that feels achievable while ensuring all success metrics are reached within their specified timeframes.
`;
}

export function generateOKRPrompt(
  data: any,
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  const fullContext = previousResults.map(r => r.content).join('\n\n---\n\n');
  
  return `
Create an ADVANCED GROWTH OBJECTIVE that becomes possible ONLY after AI transformation.

COMPLETE TRANSFORMATION CONTEXT:
${fullContext}

COMPANY REALITY CHECK:
• Current stage: ${inferences.maturityLevel}
• Hidden opportunities: ${inferences.hiddenMultipliers.join(', ')}
• Competitive environment: ${inferences.competitivePressure} pressure
• Team capability: ${extractTeamInfo(data).affected} people in ${extractTeamInfo(data).department}
• Success trajectory: ${extractSuccessMetrics(data)}

TRANSFORMATIVE OKR FRAMEWORK:

"When ${extractSuccessMetrics(data).split(',')[0] || 'operational efficiency'} is achieved
AND process performance improves significantly
AND team productivity increases by [calculate based on analysis],
THEN ${data.businessName} can pursue [SPECIFIC TRANSFORMATIVE OBJECTIVE]
that would be impossible at current performance levels."

OBJECTIVE REQUIREMENTS:
• Must be specific to ${data.icpType} industry dynamics
• Should leverage the hidden multiplier opportunities: ${inferences.hiddenMultipliers[0] || 'process optimization'}
• Feel ambitious but achievable given transformation
• Create genuine excitement about the future
• Build on their desired outcome: "${data.desiredOutcome || 'market leadership'}"

TRANSFORMATIVE OBJECTIVE OPTIONS (choose most relevant):

For ${data.icpType} companies:
• "Enter enterprise market segment with 10x service capacity"
• "Launch AI-powered service offering generating new revenue stream"
• "Acquire smaller competitors using operational efficiency advantages"
• "Expand to new geographic markets with remote-first operations"
• "Transform into platform business model serving other ${data.icpType} companies"

SUPPORTING ANALYSIS:
1. WHY THIS BECOMES POSSIBLE:
   • Current constraints that prevent this objective
   • How AI transformation removes those constraints
   • Competitive advantages created by operational excellence

2. MARKET OPPORTUNITY SIZING:
   • Revenue potential of the transformative objective
   • Market timing and competitive positioning
   • Resource requirements vs. capabilities gained

3. STRATEGIC RATIONALE:
   • How this objective aligns with ${data.revenueModel} business model
   • Synergies with existing strengths
   • Platform for continued growth beyond 12 months

4. SUCCESS MEASUREMENT:
   • Specific KPIs for the transformative objective
   • Timeline for achievement
   • Risk factors and mitigation strategies

Craft an OKR that genuinely excites stakeholders about the post-transformation possibilities while being grounded in realistic capability development.
`;
}

export function generateGABIPrompt(
  data: any,
  inferences: ContextInferences,
  previousResults: ResearchResult[]
): string {
  const solutions = previousResults.find(r => r.name === 'SOLUTIONS')?.content || '';
  const advancedOKR = previousResults.find(r => r.name === 'ADVANCED_OKR')?.content || '';
  
  return `
Position GABI Intelligence as the strategic foundation for ${data.businessName}'s AI transformation journey.

TRANSFORMATION CONTEXT:
Solutions Path: ${solutions}
Future Vision: ${advancedOKR}

CONTEXT INTELLIGENCE VALUE PROPOSITION:

1. THE CONTEXT PROBLEM ${data.businessName} FACES:
• Every AI tool they adopt needs to understand ${data.icpType} industry nuances
• Their ${data.teamProcess} process knowledge is valuable intellectual property
• Teaching multiple AI tools vs. building one intelligent foundation
• Maintaining context consistency across growing AI capabilities

2. COMPOUND VALUE FOR THEIR SPECIFIC JOURNEY:
• How GABI learns from their ${data.revenueModel} business model patterns
• Why solving ${data.revenueChallenge} also improves ${inferences.hiddenMultipliers[0] || 'related processes'}
• Future use cases they haven't considered yet (based on analysis)
• Platform effects: each new AI capability becomes more valuable

3. STRATEGIC COMPETITIVE DIFFERENTIATION:
• What ${data.businessName} could accomplish that competitors cannot
• How Context Intelligence becomes their sustainable competitive moat
• Knowledge assets transformation: from tribal knowledge to AI-powered advantage
• Market positioning benefits specific to ${data.icpType} space

4. ARTHUR & ARCHIE AS STRATEGIC PARTNERS:
• Not just vendors, but transformation advisors
• Deep expertise in ${inferences.maturityLevel} company AI adoption
• Understanding of ${inferences.competitivePressure} competitive environments
• Proven methodology for ${data.urgency} implementation timelines

EDUCATIONAL POSITIONING (Not Sales Pitch):

CONTEXT INTELLIGENCE EXPLAINED:
• How this assessment report itself demonstrates GABI capabilities
• Cross-sectional analysis that created insights from data intersections
• Why generic AI tools miss the nuanced understanding shown here
• The compound intelligence effect: each interaction makes the system smarter

STRATEGIC IMPLICATIONS:
• Building AI capabilities vs. buying AI tools
• Platform thinking for long-term competitive advantage
• Knowledge architecture that scales with business growth
• Integration efficiency across all future AI initiatives

NATURAL EVOLUTION PATH:
• How their current transformation creates foundation for GABI deployment
• When in their roadmap Context Intelligence becomes most valuable
• Resource allocation between immediate solutions and platform building
• ROI multiplication effects on all future AI investments

PROOF POINTS:
• This assessment demonstrates Context Intelligence methodology
• Cross-sectional insights that created their transformation plan
• Personalization depth that shows understanding of their specific context
• Strategic thinking that connects immediate needs to long-term vision

Position GABI Intelligence as the natural evolution of their AI journey - not an additional tool, but the foundation that makes all other AI investments more valuable and aligned with their business reality.
`;
}

// Utility function to simplify prompts if initial generation fails
export function simplifyPrompt(originalPrompt: string): string {
  // Extract key elements and create a shorter, more focused prompt
  const lines = originalPrompt.split('\n').filter(line => line.trim());
  const keyLines = lines.slice(0, Math.min(20, lines.length)); // Take first 20 lines
  
  return keyLines.join('\n') + '\n\nProvide focused, actionable analysis based on the context above.';
}