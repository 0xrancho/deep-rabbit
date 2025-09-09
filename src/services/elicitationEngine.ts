/**
 * Elicitation Engine - CBAP-grade discovery intelligence
 * Implements depth algorithms and note quality assessment
 */

export interface NoteQuality {
  hasUncoveredComplexity: boolean;
  hasSpecificRequirements: boolean;
  hasQuantification: boolean;
  hasTechnicalDetail: boolean;
  overallQuality: 'high' | 'medium' | 'low';
}

export interface ElicitationContext {
  prospect: string;
  clientIndustry: string;
  businessArea: string;
  discoveryContext: string;
  expectedSolutionScope: string;
  expectedNextStep: string;
}

export class ElicitationDepthManager {
  private readonly MAX_DEPTH = 5;
  private readonly MIN_DEPTH = 2;

  /**
   * Determines if we should continue deeper questioning
   */
  shouldContinueQuestioning(
    currentDepth: number,
    noteQuality: NoteQuality
  ): boolean {
    // Always allow at least 2 questions per area
    if (currentDepth < this.MIN_DEPTH) return true;
    
    // Stop at 5 to prevent rabbit holes
    if (currentDepth >= this.MAX_DEPTH) return false;
    
    // Intelligence: Continue if we've uncovered complexity but lack specifics
    return noteQuality.hasUncoveredComplexity && 
           !noteQuality.hasSpecificRequirements;
  }

  /**
   * Assess the quality of notes to determine questioning depth
   */
  assessNoteQuality(notes: string): NoteQuality {
    const complexity = /critical|urgent|blocked|failed|risk|challenge|issue|problem/i.test(notes);
    const requirements = /must have|need|require|essential|mandatory|critical/i.test(notes);
    const quantification = /\d+\s*(hours?|days?|weeks?|months?|dollars?|USD|\$|%|percent)/i.test(notes);
    const technical = /system|API|database|workflow|integration|platform|architecture|infrastructure/i.test(notes);
    
    // Calculate overall quality score
    const score = [complexity, requirements, quantification, technical].filter(Boolean).length;
    
    return {
      hasUncoveredComplexity: complexity,
      hasSpecificRequirements: requirements,
      hasQuantification: quantification,
      hasTechnicalDetail: technical,
      overallQuality: score >= 3 ? 'high' : score >= 2 ? 'medium' : 'low'
    };
  }

  /**
   * Generate depth guidance for the next question
   */
  getDepthGuidance(depth: number, quality: NoteQuality): string {
    if (depth === 0) {
      return "Initial exploration - broad but specific to their context";
    }
    
    if (!quality.hasQuantification) {
      return "Probe for specific metrics, numbers, timeframes";
    }
    
    if (!quality.hasTechnicalDetail) {
      return "Dig into technical specifics and system details";
    }
    
    if (!quality.hasSpecificRequirements) {
      return "Extract concrete requirements and must-haves";
    }
    
    if (quality.hasUncoveredComplexity) {
      return "Explore the complexity - what makes this challenging?";
    }
    
    return "Synthesize and confirm understanding";
  }
}

/**
 * Elicitation patterns for each discovery area
 */
export const ELICITATION_PATTERNS = {
  "Current Technology Stack": {
    depth0: "What systems currently handle [specific process from context]?",
    depth1: "Given [specific system mentioned], how does [compliance/integration concern] affect data flow?",
    depth2: "When [specific scenario from notes], what breaks down or requires manual intervention?",
    depth3: "Walk me through what happens when [edge case scenario] - who gets involved and what's the workaround?",
    depth4: "If we had to diagram the technical flow for [critical process], what are the hidden dependencies?",
  },
  
  "Pain Points & Challenges": {
    depth0: "What's the biggest bottleneck in [business area from context]?",
    depth1: "How many hours/dollars does [specific pain mentioned] cost monthly?",
    depth2: "When did this problem first surface, and what triggered it?",
    depth3: "What would happen to [business metric] if this wasn't fixed in 6 months?",
    depth4: "Who internally is most impacted when [specific pain point] occurs?",
  },
  
  "Business Impact & Urgency": {
    depth0: "What's driving the urgency to solve [discovery context]?",
    depth1: "What specific event or deadline creates the most pressure?",
    depth2: "What's at risk if you miss [specific deadline mentioned]?",
    depth3: "How does [specific risk] cascade to other business areas?",
    depth4: "What's the opportunity cost of maintaining status quo for another quarter?",
  },
  
  "Decision Process & Timeline": {
    depth0: "Who needs to approve a solution for [solution scope]?",
    depth1: "What criteria will [specific stakeholder mentioned] use to evaluate success?",
    depth2: "What happened the last time you evaluated similar solutions?",
    depth3: "What internal politics or competing priorities could affect this decision?",
    depth4: "If [key stakeholder] says no, what's the escalation path?",
  },
  
  "Budget & Resource Allocation": {
    depth0: "What's the cost of maintaining the current [problem state from context]?",
    depth1: "What budget range has been discussed for [solution scope]?",
    depth2: "How does [specific budget mentioned] compare to other initiatives' funding?",
    depth3: "Who controls budget approval for [specific amount range]?",
    depth4: "What would justify exceeding the initial budget by 20-30%?",
  },
  
  "Technical Requirements": {
    depth0: "What are the non-negotiable technical requirements for any solution?",
    depth1: "How does [specific requirement mentioned] relate to [compliance/security concern]?",
    depth2: "What happens if [specific technical requirement] can't be met?",
    depth3: "Which requirement would you sacrifice first if you had to choose?",
    depth4: "What technical debt are you willing to accept in the short term?",
  },
  
  "Integration & Infrastructure": {
    depth0: "What systems must any new solution integrate with?",
    depth1: "Describe the data flow between [system A] and [system B mentioned]?",
    depth2: "What integration has failed in the past and why?",
    depth3: "If [specific integration] breaks, what's the business impact?",
    depth4: "What's your disaster recovery plan for [critical integration]?",
  },
  
  "Success Metrics & Outcomes": {
    depth0: "How will you measure success in the first 90 days?",
    depth1: "What specific number/metric would indicate [outcome mentioned]?",
    depth2: "How do you track [specific metric] today, and what's the baseline?",
    depth3: "What would make this project a failure despite hitting metrics?",
    depth4: "How would [specific stakeholder] define wild success?",
  }
};

/**
 * Generate question progression guidance
 */
export function getQuestionProgression(
  area: string,
  depth: number,
  previousNotes: string[]
): string {
  const patterns = ELICITATION_PATTERNS[area as keyof typeof ELICITATION_PATTERNS];
  if (!patterns) return "Tell me more about this area.";
  
  const depthKey = `depth${depth}` as keyof typeof patterns;
  let template = patterns[depthKey] || patterns.depth0;
  
  // Replace placeholders with actual context from notes
  if (previousNotes.length > 0) {
    const lastNote = previousNotes[previousNotes.length - 1];
    
    // Extract key terms from previous notes
    const systemMatch = lastNote.match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/);
    const numberMatch = lastNote.match(/\d+\s*(?:hours?|days?|dollars?|\$|%)/);
    const painMatch = lastNote.match(/(?:challenge|issue|problem|bottleneck|pain):\s*([^.]+)/i);
    
    if (systemMatch) {
      template = template.replace(/\[specific system mentioned\]/, systemMatch[0]);
      template = template.replace(/\[system A\]/, systemMatch[0]);
    }
    
    if (numberMatch) {
      template = template.replace(/\[specific amount mentioned\]/, numberMatch[0]);
    }
    
    if (painMatch) {
      template = template.replace(/\[specific pain mentioned\]/, painMatch[1]);
    }
  }
  
  return template;
}

/**
 * Calculate discovery completeness
 */
export function calculateDiscoveryCompleteness(
  notesPerArea: Map<string, string[]>
): {
  percentage: number;
  quality: 'high' | 'medium' | 'low';
  gaps: string[];
} {
  const depthManager = new ElicitationDepthManager();
  let totalQuality = 0;
  let totalAreas = 0;
  const gaps: string[] = [];
  
  // Check each area
  for (const [area, notes] of notesPerArea) {
    totalAreas++;
    
    if (notes.length < 2) {
      gaps.push(`${area}: Needs more exploration (${notes.length}/2 minimum)`);
    } else {
      // Assess combined note quality
      const combinedNotes = notes.join(' ');
      const quality = depthManager.assessNoteQuality(combinedNotes);
      
      if (quality.overallQuality === 'high') totalQuality += 3;
      else if (quality.overallQuality === 'medium') totalQuality += 2;
      else totalQuality += 1;
      
      // Check for specific missing elements
      if (!quality.hasQuantification) {
        gaps.push(`${area}: Missing quantification/metrics`);
      }
      if (!quality.hasTechnicalDetail && area.includes('Tech')) {
        gaps.push(`${area}: Needs technical specifics`);
      }
    }
  }
  
  const maxQuality = totalAreas * 3;
  const percentage = Math.round((totalQuality / maxQuality) * 100);
  
  return {
    percentage,
    quality: percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low',
    gaps
  };
}

export default new ElicitationDepthManager();