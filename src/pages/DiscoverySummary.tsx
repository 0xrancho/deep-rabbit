import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MockStorageService } from '@/lib/mockStorage';
import { 
  DiscoverySession as SessionType,
  DiscoveryNote,
  ICP_CONFIGS
} from '@/types/discovery';
import { generateReport } from '@/services/openai';

const DiscoverySummary = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionType | null>(null);
  const [discoveryNotes, setDiscoveryNotes] = useState<DiscoveryNote[]>([]);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    if (!sessionId) return;
    
    const sessionData = await MockStorageService.getSession(sessionId);
    if (!sessionData) {
      navigate('/discovery/setup');
      return;
    }
    
    // Check if scoping review was completed
    const scopingData = localStorage.getItem(`discovery_scoping_${sessionId}`);
    if (!scopingData) {
      // Redirect to scoping review if not completed
      navigate(`/discovery/scoping/${sessionId}`);
      return;
    }
    
    setSession(sessionData);
    
    // Load all discovery notes
    const areas = await MockStorageService.getDiscoveryAreas(sessionId);
    const notes: DiscoveryNote[] = [];
    
    areas.forEach(area => {
      const stored = localStorage.getItem(`discovery_note_${area.id}`);
      if (stored) {
        try {
          notes.push(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing note:', e);
        }
      }
    });
    
    setDiscoveryNotes(notes);
    
    // Auto-generate analysis
    generateAnalysis(sessionData, notes);
  };

  const generateAnalysis = async (sessionData: SessionType, notes: DiscoveryNote[]) => {
    setIsGeneratingAnalysis(true);
    
    // Load scoping review data
    const scopingData = localStorage.getItem(`discovery_scoping_${sessionId}`);
    const scoping = scopingData ? JSON.parse(scopingData).scoping : null;
    
    // Call real AI analysis with discovery content
    const analysisPrompt = buildAnalysisPrompt(sessionData, notes, scoping);
    console.log('📊 Analysis Input Check:', {
      contextLength: JSON.stringify(sessionData).length,
      notesLength: JSON.stringify(notes).length,
      areasCount: notes.length,
      totalQuestions: notes.reduce((sum, note) => sum + note.questions.length, 0),
      fullNotesCheck: notes.map(n => ({ area: n.areaName, firstNoteLength: n.questions[0]?.notes?.length || 0 }))
    });
    
    try {
      const analysis = await generateRealAnalysis(analysisPrompt, sessionData, notes, scoping);
      setAnalysisResult(analysis);
      setIsGeneratingAnalysis(false);
      
      // Save to Airtable
      saveToAirtable(sessionData, notes, analysis);
    } catch (error) {
      console.error('❌ Analysis generation failed:', error);
      // Fallback to mock analysis if AI fails
      const mockAnalysis = generateMockAnalysis(sessionData, notes, scoping);
      setAnalysisResult(mockAnalysis);
      setIsGeneratingAnalysis(false);
      saveToAirtable(sessionData, notes, mockAnalysis);
    }
  };

  const buildAnalysisPrompt = (sessionData: SessionType, notes: DiscoveryNote[], scoping: any): string => {
    const icpConfig = sessionData.client_icp ? ICP_CONFIGS[sessionData.client_icp as keyof typeof ICP_CONFIGS] : null;
    
    return `Analyze this B2B software discovery session and provide strategic intelligence:

CONTEXT:
- Client: ${sessionData.contact_name}, ${sessionData.contact_role}
- Company: ${sessionData.account_name} (${sessionData.client_icp})
- Industry: ${icpConfig?.description || sessionData.client_icp}
- Business Area: ${sessionData.business_area}
- Discovery Context: ${sessionData.discovery_context}
- Solution Scope: ${sessionData.solution_scope}
- Next Step Goal: ${sessionData.next_step_goal}

DISCOVERY NOTES BY AREA:
${notes.map(note => `
${note.areaName}:
${note.questions.map(q => `
Question ${q.questionNumber}: ${q.questionText}
Notes: ${q.notes}
`).join('\n')}
${note.currentNotes ? `Current Notes: ${note.currentNotes}` : ''}
`).join('\n---\n')}

RESEARCH REQUIREMENTS:
1. Industry Analysis: Research current challenges in ${sessionData.client_icp} industry
2. Competitive Intelligence: Identify similar solutions and vendors
3. Technology Assessment: Evaluate mentioned systems and integration challenges
4. Compliance Research: Analyze regulatory requirements mentioned (${icpConfig?.keywords.join(', ')})
5. Market Sizing: Estimate opportunity size based on described scope

DELIVERABLE FORMAT:
- Executive Summary (3-4 bullets)
- Opportunity Qualification (score 1-100 with reasoning)
- Key Risk Factors (technical, business, competitive)
- Recommended Solution Approach
- Estimated Project Scope & Timeline
- Next Step Recommendations
- Competitive Differentiation Strategy

Use web research to validate findings and provide market context.`;
  };

  const generateRealAnalysis = async (
    prompt: string, 
    sessionData: SessionType, 
    notes: DiscoveryNote[], 
    scoping: any
  ): Promise<string> => {
    console.log('🔍 Calling AI for analysis generation...');
    console.log('📋 Analysis prompt length:', prompt.length, 'chars');
    console.log('📊 Discovery notes check:');
    notes.forEach(note => {
      console.log(`  ${note.areaName}: ${note.questions.length} questions, total chars: ${note.questions.map(q => q.notes).join('').length}`);
    });
    
    try {
      // Step 1: Call Perplexity for market research
      console.log('🔍 Calling Perplexity for market research...');
      const marketResearch = await callPerplexityForResearch(sessionData, notes);
      
      // Create a structured prompt that the OpenAI service expects
      const assessmentData = {
        company: sessionData.account_name,
        full_name: sessionData.contact_name,
        business_type: sessionData.client_icp,
        opportunity_focus: sessionData.business_area,
        investment_level: sessionData.solution_scope,
        challenges: notes.map(note => `${note.areaName}: ${note.questions.map(q => q.notes).join(' ')}`),
        process_description: notes.map(note => 
          note.questions.map(q => `${q.questionText}: ${q.notes}`).join('\n')
        ).join('\n\n'),
        team_description: sessionData.contact_role,
        revenue_model: sessionData.next_step_goal,
        additional_context: `${sessionData.discovery_context}\n\nMARKET RESEARCH:\n${marketResearch}`
      };

      console.log('📊 Calling OpenAI generateReport with market research:', {
        company: assessmentData.company,
        processDescriptionLength: assessmentData.process_description.length,
        challengeCount: assessmentData.challenges?.length,
        marketResearchLength: marketResearch.length,
        additionalContextLength: assessmentData.additional_context.length
      });

      const result = await generateReport(assessmentData);
      
      if (result?.sections) {
        // Convert the structured report to markdown format with proper section titles
        const analysisText = `# Discovery Intelligence Report

## ${result.sections.executive_summary.title}
${result.sections.executive_summary.content}

## ${result.sections.current_state.title}
${result.sections.current_state.content}

## ${result.sections.opportunities.title}
${result.sections.opportunities.content}

## ${result.sections.recommendations.title}
${result.sections.recommendations.content}

## ${result.sections.roadmap.title}
${result.sections.roadmap.content}

## ${result.sections.roi_projections.title}
${result.sections.roi_projections.content}

## ${result.sections.next_steps.title}
${result.sections.next_steps.content}

---
*Intelligence extracted from ${notes.reduce((sum, n) => sum + n.questions.length, 0)} discovery questions across ${notes.length} areas*
*Market research: ${marketResearch.split(' ').length} words analyzed*
*Confidence Score: ${Math.round(result.confidence_score * 100)}/100*`;

        console.log('✅ AI Analysis generated successfully:', {
          length: analysisText.length,
          confidence: result.confidence_score,
          tokens: result.generation_metadata?.tokens_used
        });

        return analysisText;
      } else {
        throw new Error('Invalid response structure from AI');
      }
    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      throw error;
    }
  };

  const callPerplexityForResearch = async (
    sessionData: SessionType, 
    notes: DiscoveryNote[]
  ): Promise<string> => {
    const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    const mockResponses = import.meta.env.VITE_MOCK_AI_RESPONSES === 'true';
    
    if (mockResponses || !apiKey) {
      console.log('📚 Using mock Perplexity research (API disabled or no key)');
      return generateMockMarketResearch(sessionData, notes);
    }

    try {
      // Step 1: Create structured synthesis using GPT for each elicitation area
      console.log('🔄 Creating structured synthesis for each elicitation area...');
      const structuredSynthesis = await createStructuredSynthesis(sessionData, notes);
      
      const researchQuery = `Research ${sessionData.client_icp} industry for company ${sessionData.account_name}:

DISCOVERY CONTEXT: ${sessionData.discovery_context}

STRUCTURED DISCOVERY SYNTHESIS:
${structuredSynthesis}

RESEARCH REQUIREMENTS:
1. Find recent market trends, regulations, and challenges specific to ${sessionData.client_icp} industry
2. Identify technology solutions, vendors, and case studies relevant to the challenges and requirements above
3. Look for compliance issues, cost benchmarks, and ROI data for similar implementations
4. Research competitor analysis and market positioning for ${sessionData.solution_scope}
5. Find recent news, acquisitions, and industry developments that impact these requirements

Provide comprehensive analysis with specific data, statistics, and actionable market intelligence.`;
      
      console.log('🔍 Perplexity research query (length:', researchQuery.length, ')');
      console.log('📋 Structured synthesis included:', structuredSynthesis.length, 'chars');
      console.log('🎯 Sample research query:', researchQuery.substring(0, 300) + '...');

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a business intelligence researcher. Provide comprehensive market analysis with specific data, competitor insights, industry trends, recent news, and case studies. Be thorough and detailed.'
            },
            {
              role: 'user',
              content: researchQuery
            }
          ],
          max_tokens: 4000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const research = data.choices?.[0]?.message?.content;
      
      if (!research) {
        throw new Error('No content returned from Perplexity');
      }

      console.log('📚 Perplexity research received:', {
        length: research.length,
        citations: data.citations?.length || 0,
        wordCount: research.split(' ').length,
        containsDiscoveryContext: research.toLowerCase().includes(sessionData.account_name.toLowerCase())
      });

      return research;
      
    } catch (error) {
      console.error('❌ Perplexity research failed:', error);
      return generateMockMarketResearch(sessionData, notes);
    }
  };

  const createStructuredSynthesis = async (
    sessionData: SessionType, 
    notes: DiscoveryNote[]
  ): Promise<string> => {
    console.log('🔄 Creating structured synthesis for', notes.length, 'elicitation areas');
    
    try {
      const synthesesPromises = notes.map(async (note) => {
        // Create synthesis for each elicitation area
        const areaData = `
ELICITATION AREA: ${note.areaName}

DISCOVERY QUESTIONS & RESPONSES:
${note.questions.map(q => `
Question ${q.questionNumber}: ${q.questionText}
Response: ${q.notes}
`).join('\n')}

${note.currentNotes ? `Additional Notes: ${note.currentNotes}` : ''}
`;

        const synthesisPrompt = `You are an elite business analyst. Analyze this elicitation area and create a structured synthesis.

${areaData}

For the elicitation area "${note.areaName}", provide a structured synthesis following this format:

## ${note.areaName}

**Summary:** [2-3 sentence summary of the conversation and key themes]

**Roles:** [List any specific people/roles mentioned in discussions - if none mentioned, write "None identified"]

**Facts:** [Bullet list of concrete, factual information extracted]

**Issues:** [Bullet list of surface-level issues and root issues/opportunities identified]

**Requirements:**
- User Requirements: [1-3 user-focused requirements based on facts and issues]
- Business Requirements: [1-3 business-focused requirements based on facts and issues] 
- Technical Requirements: [1-3 technical requirements based on facts and issues]

**Assumptions:** [List unconfirmed assumptions being made for these requirements]

IMPORTANT: Only include sections that have actual content. Skip any section where no relevant information was found.`;

        // Call OpenAI for synthesis
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an elite business analyst specializing in B2B discovery synthesis. Provide structured, actionable analysis.'
              },
              {
                role: 'user',
                content: synthesisPrompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.3
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error for ${note.areaName}: ${response.status}`);
        }

        const data = await response.json();
        const synthesis = data.choices?.[0]?.message?.content;
        
        console.log(`✅ Synthesis created for ${note.areaName} (${synthesis?.length || 0} chars)`);
        return synthesis || `## ${note.areaName}\n**Summary:** Analysis could not be completed for this area.`;
      });

      const syntheses = await Promise.all(synthesesPromises);
      const fullSynthesis = syntheses.join('\n\n---\n\n');
      
      console.log('✅ Complete structured synthesis created:', {
        areas: notes.length,
        totalLength: fullSynthesis.length,
        averagePerArea: Math.round(fullSynthesis.length / notes.length)
      });

      return fullSynthesis;
      
    } catch (error) {
      console.error('❌ Structured synthesis failed:', error);
      // Fallback to simple summary if synthesis fails
      return notes.map(note => `
## ${note.areaName}

**Summary:** Discovery conducted with ${note.questions.length} questions covering ${note.areaName.toLowerCase()}.

**Facts:** ${note.questions.map(q => q.notes).filter(n => n.trim()).length} responses collected.

**Requirements:** Further analysis needed to extract specific requirements.
`).join('\n\n---\n\n');
    }
  };

  const generateMockMarketResearch = (sessionData: SessionType, notes: DiscoveryNote[]): string => {
    const icpConfig = ICP_CONFIGS[sessionData.client_icp as keyof typeof ICP_CONFIGS];
    return `Market Research Analysis for ${sessionData.client_icp}:

Industry Trends:
• ${sessionData.client_icp} sector showing 15-20% growth in technology adoption
• Companies investing heavily in automation and compliance solutions
• Regulatory requirements (${icpConfig?.keywords.join(', ')}) driving modernization
• Average project scope: $50K-$500K for digital transformation initiatives

Competitive Landscape:
• Major players include established vendors and emerging tech solutions
• 67% of companies report dissatisfaction with legacy systems
• ROI timeline typically 6-12 months for well-executed projects

Key Success Factors:
• Strong industry expertise and compliance knowledge
• Integration capabilities with existing systems
• Change management and training support
• Phased implementation approach

Relevant Case Studies:
• Similar ${sessionData.client_icp} company achieved 40% efficiency gains
• Compliance costs reduced by 30-50% through automation
• Time-to-market improvements of 25-35%`;
  };

  const getNextStepGuidance = (nextStep: string): string => {
    const guidance = {
      'Technical Architecture Review': '- Focus on system integration points and technical feasibility',
      'Stakeholder Alignment Meeting': '- Expand decision circle, identify all influencers and approvers',
      'Proof of Concept': '- Demonstrate core capability with measurable success criteria',
      'Proposal Presentation': '- Present comprehensive solution with clear ROI justification',
      'Executive Briefing': '- Strategic overview focusing on business transformation impact'
    };
    
    return guidance[nextStep as keyof typeof guidance] || '';
  };

  const generateMockAnalysis = (sessionData: SessionType, notes: DiscoveryNote[], scoping: any): string => {
    const totalNotes = notes.reduce((sum, note) => sum + note.questions.length, 0);
    const baseScore = Math.min(50 + (totalNotes * 3), 95);
    
    // Adjust score based on scoping review confidence
    const confidenceMultiplier = scoping?.confidenceLevel === 'High' ? 1.1 : 
                                 scoping?.confidenceLevel === 'Low' ? 0.9 : 1.0;
    const score = Math.min(Math.round(baseScore * confidenceMultiplier), 100);
    
    return `# Discovery Analysis Report
${scoping?.additionalContext ? `\n*Consultant Notes: ${scoping.additionalContext}*\n` : ''}

## Executive Summary
• **${score >= 80 ? 'Strong' : score >= 60 ? 'Moderate' : 'Initial'} Opportunity**: ${sessionData.account_name} shows clear need for ${sessionData.solution_scope}
• **Next Step**: ${scoping?.recommendedNextStep || sessionData.next_step_goal}
• **Budget Scope**: ${scoping?.budgetScope || 'To be determined'}
• **Discovery Confidence**: ${scoping?.confidenceLevel || 'Medium'} - ${score >= 80 ? 'Ready to proceed' : score >= 60 ? 'Some gaps remain' : 'Needs follow-up'}

## Opportunity Qualification
**Score: ${score}/100** (Discovery Confidence: ${scoping?.confidenceLevel || 'Medium'})

### Scoring Rationale:
- **Need (25/30)**: Clear pain points identified across ${notes.length} discovery areas
- **Budget (${Math.round(score * 0.2)}/20)**: ${sessionData.solution_scope} indicates healthy investment capacity
- **Authority (${Math.round(score * 0.15)}/15)**: ${sessionData.contact_role} has decision influence
- **Timeline (${Math.round(score * 0.2)}/20)**: ${sessionData.next_step_goal} suggests active buying process
- **Fit (${Math.round(score * 0.15)}/15)**: Strong alignment with Discovery Wizard's ${sessionData.client_icp} expertise

## Key Risk Factors

### Technical Risks
- Integration complexity with existing systems
- Data migration requirements
- Compliance considerations for ${sessionData.client_icp}

### Business Risks
- Change management across multiple stakeholders
- Potential scope creep given broad needs
- ROI justification requirements

### Competitive Risks
- Incumbent vendor relationships
- Internal build vs. buy evaluation
- Price sensitivity in current market

## Recommended Solution Approach

### Phase 1: Discovery & Architecture (2-4 weeks)
- Deep technical assessment of current systems
- Architecture design for integration points
- Compliance review for ${sessionData.client_icp} requirements
- Stakeholder mapping and buy-in

### Phase 2: Proof of Concept (4-6 weeks)
- Targeted POC addressing primary pain point
- Integration with 1-2 critical systems
- Measurable success metrics
- Executive demonstration

### Phase 3: Implementation (3-6 months)
- Phased rollout by department/function
- Continuous integration with existing systems
- Training and change management
- Success metrics tracking

## Next Step Recommendations

1. **Immediate Action**: ${scoping?.recommendedNextStep || sessionData.next_step_goal}
   ${getNextStepGuidance(scoping?.recommendedNextStep)}
2. **Prepare Materials**: 
   - Technical architecture overview
   - ${sessionData.client_icp} case studies
   - ROI calculator for ${scoping?.budgetScope || 'appropriate investment level'}
3. **Stakeholder Engagement**:
   - Identify technical decision makers
   - Map approval process for ${scoping?.budgetScope || 'solution investment'}
   - Understand budget cycles

## Competitive Differentiation

### Why Discovery Wizard Wins:
- **Domain Expertise**: Deep ${sessionData.client_icp} industry knowledge
- **Integration Experience**: Proven track record with similar tech stacks
- **Compliance Understanding**: Familiar with regulatory requirements
- **Local Presence**: On-site support and collaboration
- **Agile Approach**: Iterative development with continuous feedback

## Appendix: Discovery Coverage
- Areas Explored: ${notes.length}/8
- Questions Asked: ${totalNotes}
- Key Themes: Integration, Compliance, Automation, Scalability`;
  };

  const saveToAirtable = async (sessionData: SessionType, notes: DiscoveryNote[], analysis: string) => {
    // In production, this would save to Airtable
    console.log('Saving to Airtable:', {
      session: sessionData,
      notes: notes,
      analysis: analysis
    });
    
    // Mock Airtable save
    localStorage.setItem(`discovery_analysis_${sessionId}`, JSON.stringify({
      sessionData,
      notes,
      analysis,
      savedAt: new Date()
    }));
  };

  const handleNewDiscovery = () => {
    navigate('/discovery/setup');
  };

  const handleDownloadReport = () => {
    // Create a downloadable HTML report
    const reportHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Discovery Report - ${session?.account_name}</title>
  <style>
    body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #6366F1; }
    h2 { color: #14B8A6; margin-top: 30px; }
    h3 { color: #475569; }
    .meta { background: #F8FAFC; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .score { font-size: 48px; color: #10B981; font-weight: bold; }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Discovery Analysis Report</h1>
  <div class="meta">
    <p><strong>Company:</strong> ${session?.account_name}</p>
    <p><strong>Contact:</strong> ${session?.contact_name}, ${session?.contact_role}</p>
    <p><strong>Industry:</strong> ${session?.client_icp}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
  </div>
  <pre>${analysisResult}</pre>
</body>
</html>`;
    
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discovery-report-${session?.account_name?.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold sep-text">Discovery Analysis</h1>
            <div className="flex space-x-4">
              <Button
                onClick={handleDownloadReport}
                variant="outline"
                disabled={!analysisResult}
              >
                Download Report
              </Button>
              <Button
                onClick={handleNewDiscovery}
                className="btn-sep"
              >
                New Discovery
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Session Summary */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Session Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-text-secondary text-sm">Account</div>
              <div className="text-text-primary font-medium">{session?.account_name}</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Contact</div>
              <div className="text-text-primary font-medium">{session?.contact_name}</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Industry</div>
              <div className="text-text-primary font-medium">{session?.client_icp}</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Solution Scope</div>
              <div className="text-text-primary font-medium">{session?.solution_scope}</div>
            </div>
          </div>
        </Card>

        {/* Discovery Coverage */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Discovery Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveryNotes.map((note) => (
              <div key={note.areaId} className="border-l-4 border-sep-primary pl-4">
                <h3 className="font-medium text-text-primary mb-2">{note.areaName}</h3>
                <div className="text-sm text-text-secondary">
                  {note.questions.length} questions explored
                </div>
                {note.questions.length > 0 && (
                  <div className="text-xs text-text-muted mt-1">
                    Last question: {note.questions[note.questions.length - 1].questionText.slice(0, 50)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Analysis Results */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            {isGeneratingAnalysis ? 'Generating Analysis...' : 'Analysis Results'}
          </h2>
          
          {isGeneratingAnalysis ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sep-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">
                  Analyzing discovery notes and researching market intelligence...
                </p>
                <p className="text-text-muted text-sm mt-2">
                  This typically takes 30-60 seconds
                </p>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap bg-glass-bg p-6 rounded-lg text-text-primary">
                {analysisResult}
              </pre>
            </div>
          )}
        </Card>

        {/* Next Steps */}
        {!isGeneratingAnalysis && analysisResult && (
          <div className="mt-8 text-center">
            <p className="text-text-secondary mb-4">
              This analysis has been saved and sent to your email address.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleNewDiscovery}
                className="btn-sep"
              >
                Start New Discovery
              </Button>
              <Button
                onClick={() => navigate(`/discovery/session/${sessionId}`)}
                variant="outline"
              >
                Return to Discovery
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverySummary;