// Enhanced Assessment Flow Component with Progressive Narrowing
// Implements the refined 7-tier assessment for surgical precision

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { enhancedAssessmentOrchestrator, type AssessmentContext } from '../lib/assessment/enhanced-assessment-orchestrator';
import { type ICPDefinition, type OpportunityArea } from '../lib/assessment/enhanced-icp-definitions';
import { type ChallengeArea, type MetricDefinition, type ProcessStep } from '../lib/assessment/metric-definitions';

interface EnhancedAssessmentFlowProps {
  initialData?: {
    fullName: string;
    company: string;
    email: string;
  };
  onComplete: (context: AssessmentContext) => void;
  onProgress?: (progress: number, tier?: number) => void;
}

export function EnhancedAssessmentFlow({ initialData, onComplete, onProgress }: EnhancedAssessmentFlowProps) {
  const [context, setContext] = useState<AssessmentContext>({
    currentTier: 1,
    progressPercentage: 0
  });

  // Calculate progress based on tier completion
  const calculateProgress = (tier: number) => {
    const tierProgress = {
      1: 14,     // ICP Selection
      2: 28,     // Opportunity Area  
      2.5: 42,   // Revenue Model
      3: 56,     // Challenge Area
      3.5: 70,   // Metric Selection
      4: 84,     // Quantification
      5: 92,     // Process Mapping
      6: 100     // Validation
    };
    return tierProgress[tier as keyof typeof tierProgress] || 0;
  };

  const [availableICPs, setAvailableICPs] = useState<ICPDefinition[]>([]);
  const [availableOpportunityAreas, setAvailableOpportunityAreas] = useState<OpportunityArea[]>([]);
  const [availableChallengeAreas, setAvailableChallengeAreas] = useState<ChallengeArea[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<MetricDefinition[]>([]);
  
  const [revenueModelSuggestions, setRevenueModelSuggestions] = useState<string[]>([]);
  const [quantificationPrompts, setQuantificationPrompts] = useState<{ baseline: string; friction: string } | null>(null);
  
  const [processValidationSummary, setProcessValidationSummary] = useState<string>('');
  
  // Form state
  const [baselineInput, setBaselineInput] = useState('');
  const [frictionInput, setFrictionInput] = useState('');
  const [customRevenueModel, setCustomRevenueModel] = useState('');
  const [newProcessStep, setNewProcessStep] = useState<Partial<ProcessStep>>({
    role: '',
    action: '',
    tools: [],
    output: ''
  });
  const [breakdownInput, setBreakdownInput] = useState('');
  const [processRefinementInput, setProcessRefinementInput] = useState('');

  useEffect(() => {
    // Load initial ICPs
    setAvailableICPs(enhancedAssessmentOrchestrator.getICPOptions());
  }, []);

  useEffect(() => {
    const progress = calculateProgress(context.currentTier);
    onProgress?.(progress, context.currentTier);
  }, [context.currentTier, onProgress]);

  // Tier 1: ICP Selection
  const handleICPSelection = (icpId: string) => {
    const newContext = enhancedAssessmentOrchestrator.selectICP(icpId, context);
    setContext(newContext);
    setAvailableOpportunityAreas(enhancedAssessmentOrchestrator.getOpportunityAreas(newContext));
  };

  // Tier 2: Opportunity Area Selection
  const handleOpportunityAreaSelection = (areaId: string) => {
    const newContext = enhancedAssessmentOrchestrator.selectOpportunityArea(areaId, context);
    setContext(newContext);
    setRevenueModelSuggestions(enhancedAssessmentOrchestrator.getRevenueModelSuggestions(newContext));
  };

  // Tier 2.5: Revenue Model Selection
  const handleRevenueModelSelection = (model: string) => {
    const newContext = enhancedAssessmentOrchestrator.selectRevenueModel(
      model,
      model === 'custom' ? customRevenueModel : undefined,
      context
    );
    setContext(newContext);
    setAvailableChallengeAreas(enhancedAssessmentOrchestrator.getRelevantChallengeAreas(newContext));
  };

  // Tier 3: Challenge Area Selection
  const handleChallengeAreaSelection = (challengeId: string) => {
    const newContext = enhancedAssessmentOrchestrator.selectChallengeArea(challengeId, context);
    setContext(newContext);
    setAvailableMetrics(enhancedAssessmentOrchestrator.getMetricsForChallengeArea(newContext));
  };

  // Tier 3.5: Metric Selection
  const handleMetricSelection = (metricId: string) => {
    const newContext = enhancedAssessmentOrchestrator.selectMetric(metricId, context);
    setContext(newContext);
    setQuantificationPrompts(enhancedAssessmentOrchestrator.getQuantificationPrompts(newContext));
  };

  // Tier 4: Quantification Submission
  const handleQuantificationSubmit = () => {
    if (!baselineInput || !frictionInput) return;
    
    const newContext = enhancedAssessmentOrchestrator.submitQuantification(
      baselineInput,
      frictionInput,
      context
    );
    setContext(newContext);
  };

  // Tier 5: Simple Process Submission
  const handleSimpleProcessSubmit = () => {
    if (!processRefinementInput || processRefinementInput.trim().length < 50) return;
    
    // Move to completion step with Generate Assessment button
    const newContext = {
      ...context,
      currentTier: 7, // Go to completion step
      processDescription: processRefinementInput
    };
    setContext(newContext as AssessmentContext);
  };

  // Handle Generate Assessment button click
  const handleGenerateAssessment = () => {
    onComplete(context as AssessmentContext);
  };

  // Tier 5: Process Step Addition
  const handleAddProcessStep = () => {
    if (!newProcessStep.role || !newProcessStep.action || !newProcessStep.output) return;
    
    const completeStep: ProcessStep = {
      sequence: 0, // Will be set by orchestrator
      description: `${newProcessStep.role} ${newProcessStep.action}`,
      role: newProcessStep.role,
      action: newProcessStep.action,
      tools: typeof newProcessStep.tools === 'string' 
        ? newProcessStep.tools.split(',').map(t => t.trim())
        : newProcessStep.tools || [],
      output: newProcessStep.output,
      timeInvested: newProcessStep.timeInvested
    };

    const newContext = enhancedAssessmentOrchestrator.addProcessStep(completeStep, context);
    setContext(newContext);
    
    // Reset form
    setNewProcessStep({ role: '', action: '', tools: [], output: '' });
  };

  // Tier 5: Process Breakdown Submission
  const handleProcessBreakdownSubmit = () => {
    if (!breakdownInput) return;
    
    const newContext = enhancedAssessmentOrchestrator.submitProcessBreakdown(breakdownInput, context);
    setContext(newContext);
    setProcessValidationSummary(enhancedAssessmentOrchestrator.generateProcessValidationSummary(newContext));
  };

  // Tier 6: Process Validation
  const handleProcessValidation = (isAccurate: boolean) => {
    const newContext = enhancedAssessmentOrchestrator.validateProcess(
      isAccurate,
      !isAccurate ? processRefinementInput : undefined,
      context
    );
    setContext(newContext);
    
    if (enhancedAssessmentOrchestrator.isAssessmentComplete(newContext)) {
      onComplete(newContext);
    }
  };

  // Handle going back to previous tier
  const handleBack = () => {
    const tierMap: Record<number, number> = {
      2: 1,      // From Opportunity Area back to ICP
      2.5: 2,    // From Revenue Model back to Opportunity Area
      3: 2.5,    // From Challenge back to Revenue Model
      3.5: 3,    // From Metric back to Challenge
      4: 3.5,    // From Quantification back to Metric
      5: 4,      // From Friction back to Quantification
      6: 5,      // From Process Validation back to Friction
      6.5: 6,    // From Process Refinement back to Process Validation
      7: 6.5     // From Complete back to Process Refinement
    };
    
    const prevTier = tierMap[context.currentTier];
    if (prevTier) {
      setContext({ ...context, currentTier: prevTier });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      {/* Back button - show on all tiers except the first */}
      {context.currentTier > 1 && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to previous step
        </button>
      )}

      {/* Tier 1: ICP Selection */}
      {context.currentTier === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              What best describes your business?
            </h2>
            <p className="text-text-secondary mb-6">
              Select the category that most closely matches your primary service offering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableICPs.map((icp) => (
              <button
                key={icp.id}
                onClick={() => handleICPSelection(icp.id)}
                className={`selection-card text-left ${
                  context.selectedICP?.id === icp.id ? 'selected' : ''
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{icp.icon}</span>
                  <h3 className="text-lg font-semibold text-text-primary">{icp.label}</h3>
                </div>
                <p className="text-text-secondary text-sm">{icp.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Opportunity Area Selection */}
      {context.currentTier === 2 && context.selectedICP && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              Which opportunity area drives most of your revenue?
            </h2>
            <p className="text-text-secondary mb-6">
              As a <strong>{context.selectedICP.label}</strong>, select your primary focus area.
            </p>
          </div>

          <div className="space-y-4">
            {availableOpportunityAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleOpportunityAreaSelection(area.id)}
                className={`selection-card text-left w-full ${
                  context.selectedOpportunityArea?.id === area.id ? 'selected' : ''
                }`}
              >
                <h3 className="text-lg font-semibold text-text-primary mb-2">{area.label}</h3>
                <p className="text-text-secondary text-sm mb-3">{area.description}</p>
                <div className="text-xs text-text-secondary">
                  Common projects: {area.commonProjects.join(', ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2.5: Revenue Model Selection */}
      {context.currentTier === 2.5 && context.selectedOpportunityArea && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              How does your {context.selectedOpportunityArea.label} typically generate revenue?
            </h2>
            <p className="text-text-secondary mb-6">
              Select the model that best describes how you price and deliver {context.selectedOpportunityArea.label} services.
            </p>
          </div>

          <div className="space-y-3">
            {revenueModelSuggestions.map((model, index) => (
              <button
                key={index}
                onClick={() => handleRevenueModelSelection(model)}
                className={`selection-card text-left w-full ${
                  context.selectedRevenueModel === model ? 'selected' : ''
                }`}
              >
                <span className="text-text-primary font-medium">{model}</span>
              </button>
            ))}
            
            <div className="border-2 border-interactive-border rounded-lg p-4 bg-gray-900">
              <button
                onClick={() => handleRevenueModelSelection('custom')}
                className="w-full text-left text-text-primary font-medium mb-2"
              >
                ✏️ Custom model (describe below)
              </button>
              <input
                type="text"
                value={customRevenueModel}
                onChange={(e) => setCustomRevenueModel(e.target.value)}
                placeholder="Describe your unique revenue model..."
                className="w-full p-2 border border-interactive-border rounded bg-gray-800 text-white placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tier 3: Challenge Area Selection */}
      {context.currentTier === 3 && availableChallengeAreas.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              What's your biggest revenue challenge in {context.selectedOpportunityArea?.label}?
            </h2>
            <p className="text-text-secondary mb-6">
              Select the <strong>ONE</strong> primary challenge that most limits your revenue growth.
            </p>
          </div>

          <div className="space-y-4">
            {availableChallengeAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleChallengeAreaSelection(area.id)}
                className={`selection-card text-left w-full ${
                  context.selectedChallengeArea?.id === area.id ? 'selected' : ''
                }`}
              >
                <h3 className="text-lg font-semibold text-text-primary mb-2">{area.label}</h3>
                <p className="text-text-secondary text-sm">{area.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tier 3.5: Metric Selection */}
      {context.currentTier === 3.5 && availableMetrics.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              Within {context.selectedChallengeArea?.label}, which specific metric needs the most improvement?
            </h2>
            <p className="text-text-secondary mb-6">
              Select the <strong>ONE</strong> metric that, if improved, would have the biggest revenue impact.
            </p>
          </div>

          <div className="space-y-4">
            {availableMetrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => handleMetricSelection(metric.id)}
                className={`selection-card text-left w-full ${
                  context.selectedMetric?.id === metric.id ? 'selected' : ''
                }`}
              >
                <h3 className="text-lg font-semibold text-text-primary mb-2">{metric.label}</h3>
                <p className="text-text-secondary text-sm mb-3">{metric.description}</p>
                {metric.exampleValues && (
                  <div className="text-xs text-text-secondary">
                    Examples: {metric.exampleValues.join(', ')}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tier 4: Metric Quantification */}
      {context.currentTier === 4 && quantificationPrompts && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              Help us understand your current {context.selectedMetric?.label}
            </h2>
            <p className="text-text-secondary mb-6">
              Let's get specific about your baseline and what creates friction.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {quantificationPrompts.baseline}
              </label>
              <Input
                type="text"
                value={baselineInput}
                onChange={(e) => setBaselineInput(e.target.value)}
                className="w-full bg-gray-800 text-white border-interactive-border placeholder:text-gray-400"
                placeholder="e.g., 3 weeks, 25%, $50K average..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {quantificationPrompts.friction}
              </label>
              <Textarea
                value={frictionInput}
                onChange={(e) => setFrictionInput(e.target.value)}
                className="w-full h-24 bg-gray-800 text-white border-interactive-border placeholder:text-gray-400"
                placeholder="Describe the main sources of friction or delay..."
              />
            </div>

            <Button
              onClick={handleQuantificationSubmit}
              disabled={!baselineInput || !frictionInput}
              className="btn-gabi px-8"
            >
              Continue to Process Mapping
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      )}

      {/* Tier 5: Process Breakdown */}
      {context.currentTier === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              Let's map the specific process affecting your {context.selectedMetric?.label}
            </h2>
            <p className="text-text-secondary mb-6">
              Break down the workflow into steps including who's involved, what tools are used, and what events or triggers move the process forward.
            </p>
          </div>

          {/* Simple Process Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Describe your current process:
              </label>
              <Textarea
                value={processRefinementInput}
                onChange={(e) => setProcessRefinementInput(e.target.value)}
                className="w-full h-32 bg-gray-800 text-white"
                placeholder="Walk us through how this currently works, step by step. Include who does what, when they do it, what tools they use, and what triggers the next step..."
              />
            </div>

            <Button
              onClick={handleSimpleProcessSubmit}
              disabled={!processRefinementInput || processRefinementInput.trim().length < 50}
              className="btn-gabi px-8"
            >
              Continue
              <span className="ml-2">→</span>
            </Button>
          </div>

        </div>
      )}

      {/* TODO: Tier 6: Process Validation - COMMENTED OUT FOR LATER
      
      This step would show AI-parsed understanding of the user's process description
      and allow them to either confirm "Spot On!" or provide clarifications.
      
      Features to implement later:
      - AI parsing of free-form process description 
      - Structured summary generation
      - Validation workflow with refinement option
      - Integration with report generation
      
      {context.currentTier === 6 && processValidationSummary && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-muted font-mono mb-4">
              Let's validate our understanding
            </h2>
            <p className="text-text-secondary mb-6">
              Based on what you've shared, here's how we understand your process:
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-interactive-border">
            <pre className="whitespace-pre-wrap text-sm text-gray-200">
              {processValidationSummary}
            </pre>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => handleProcessValidation(true)}
              className="px-6 py-3 btn-gabi px-8"
            >
              ✅ Spot On!
            </button>
            
            <button
              onClick={() => setContext({ ...context, currentTier: 6.5 })}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              🔄 Close, but let me clarify
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                What would you adjust about this workflow?
              </label>
              <textarea
                value={processRefinementInput}
                onChange={(e) => setProcessRefinementInput(e.target.value)}
                className="w-full p-3 border border-interactive-border rounded-lg h-24 bg-gray-800 text-white placeholder:text-gray-400"
                placeholder="Explain what needs to be adjusted..."
              />
            </div>

            <button
              onClick={() => handleProcessValidation(false)}
              disabled={!processRefinementInput}
              className="btn-gabi px-8 disabled:opacity-50"
            >
              Update Analysis →
            </button>
          </div>
        </div>
      )}
      */}

      {/* Assessment Ready - Generate Button */}
      {context.currentTier === 7 && (
        <div className="text-center space-y-6">
          <div className="text-6xl">🎯</div>
          <h2 className="text-2xl font-bold text-text-muted font-mono">Assessment Ready!</h2>
          <p className="text-text-secondary">
            We have everything needed to research targeted AI solutions for your {context.selectedMetric?.label} challenge.
          </p>
          
          <div className="bg-gray-900 p-6 rounded-lg text-left border border-interactive-border">
            <h3 className="font-semibold text-text-primary mb-2">Research Focus:</h3>
            <p className="text-text-secondary">
              {context.selectedICP?.label} → {context.selectedOpportunityArea?.label} → {context.selectedMetric?.label}
            </p>
          </div>

          <Button
            onClick={handleGenerateAssessment}
            className="btn-gabi px-12 py-4 text-lg"
          >
            Generate Assessment
            <span className="ml-3">🚀</span>
          </Button>
        </div>
      )}
    </div>
  );
}