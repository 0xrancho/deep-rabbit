import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { DiscoverySession } from '@/types/discovery';

export interface ScopingReview {
  budgetScope: 'Under $50K' | '$50-150K' | '$150-500K' | 'Over $500K' | 'Unknown';
  recommendedNextStep: 
    | 'Technical Architecture Review'
    | 'Stakeholder Alignment Meeting'  
    | 'Proof of Concept'
    | 'Proposal Presentation'
    | 'Executive Briefing';
  confidenceLevel: 'High' | 'Medium' | 'Low';
  additionalContext?: string;
}

interface ScopingReviewProps {
  session: DiscoverySession;
  onComplete: (scoping: ScopingReview) => void;
  onBack: () => void;
  isGenerating?: boolean;
}

const ScopingReviewComponent: React.FC<ScopingReviewProps> = ({
  session,
  onComplete,
  onBack,
  isGenerating = false
}) => {
  // Initialize with session data
  const [budgetScope, setBudgetScope] = useState<ScopingReview['budgetScope']>(
    session.solution_scope.includes('$10K-$50K') ? 'Under $50K' :
    session.solution_scope.includes('$50K-$200K') ? '$50-150K' :
    session.solution_scope.includes('$200K-$1M+') ? '$150-500K' :
    session.solution_scope.includes('$1M+') ? 'Over $500K' : 'Unknown'
  );
  
  const [recommendedNextStep, setRecommendedNextStep] = useState<ScopingReview['recommendedNextStep']>(
    session.next_step_goal.includes('Technical') ? 'Technical Architecture Review' :
    session.next_step_goal.includes('Architecture') ? 'Technical Architecture Review' :
    session.next_step_goal.includes('Proof') ? 'Proof of Concept' :
    'Proposal Presentation' as ScopingReview['recommendedNextStep']
  );
  
  const [confidenceLevel, setConfidenceLevel] = useState<ScopingReview['confidenceLevel']>('Medium');
  const [additionalContext, setAdditionalContext] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const handleSubmit = () => {
    const scoping: ScopingReview = {
      budgetScope,
      recommendedNextStep,
      confidenceLevel,
      additionalContext: additionalContext.trim() || undefined
    };
    
    onComplete(scoping);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold sep-text">Pre-Report Scoping Review</h1>
            <div className="flex items-center space-x-2 text-text-secondary">
              <CheckCircle className="w-5 h-5" />
              <span>Discovery Complete • Ready for Analysis</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Session Context Review */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-warning" />
            Confirm Pre-Knowledge Context
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-text-secondary text-sm">Prospect</div>
              <div className="text-text-primary font-medium font-mono">{session.contact_name}, {session.contact_role}</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Company & Industry</div>
              <div className="text-text-primary font-medium font-mono">{session.account_name} ({session.client_icp})</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Business Area</div>
              <div className="text-text-primary font-medium font-mono">{session.business_area}</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm">Discovery Catalyst</div>
              <div className="text-text-primary font-medium font-mono">{session.discovery_context}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-glass-bg/30 rounded-lg">
            <input 
              type="checkbox" 
              checked={hasReviewed} 
              onChange={(e) => setHasReviewed(e.target.checked)}
              className="w-4 h-4 text-sep-primary"
            />
            <label className="text-text-primary text-sm">
              I confirm this context is accurate and reflects our discovery session
            </label>
          </div>
        </Card>

        {/* Budget Scope Assessment */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Budget Scope Assessment</h2>
          <p className="text-text-secondary mb-6">
            Based on the discovery, what budget range best reflects the solution scope?
          </p>
          
          <RadioGroup 
            value={budgetScope} 
            onValueChange={(value) => setBudgetScope(value as ScopingReview['budgetScope'])}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Under $50K" id="budget1" />
              <Label htmlFor="budget1" className="font-mono">Under $50K - Quick fixes, process optimization</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="$50-150K" id="budget2" />
              <Label htmlFor="budget2" className="font-mono">$50-150K - Targeted solution, limited scope</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="$150-500K" id="budget3" />
              <Label htmlFor="budget3" className="font-mono">$150-500K - Comprehensive solution, multiple areas</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Over $500K" id="budget4" />
              <Label htmlFor="budget4" className="font-mono">Over $500K - Enterprise transformation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Unknown" id="budget5" />
              <Label htmlFor="budget5" className="font-mono">Unknown - Insufficient discovery</Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Recommended Next Step */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Recommended Next Step</h2>
          <p className="text-text-secondary mb-6">
            What's the most appropriate next engagement with this prospect?
          </p>
          
          <RadioGroup 
            value={recommendedNextStep} 
            onValueChange={(value) => setRecommendedNextStep(value as ScopingReview['recommendedNextStep'])}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Technical Architecture Review" id="next1" />
              <Label htmlFor="next1" className="font-mono">Technical Architecture Review - Deep technical assessment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Stakeholder Alignment Meeting" id="next2" />
              <Label htmlFor="next2" className="font-mono">Stakeholder Alignment Meeting - Expand decision circle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Proof of Concept" id="next3" />
              <Label htmlFor="next3" className="font-mono">Proof of Concept - Demonstrate capability</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Proposal Presentation" id="next4" />
              <Label htmlFor="next4" className="font-mono">Proposal Presentation - Present solution</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Executive Briefing" id="next5" />
              <Label htmlFor="next5" className="font-mono">Executive Briefing - Strategic overview</Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Confidence Level */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Discovery Confidence Level</h2>
          <p className="text-text-secondary mb-6">
            How confident are you in the completeness of this discovery?
          </p>
          
          <RadioGroup 
            value={confidenceLevel} 
            onValueChange={(value) => setConfidenceLevel(value as ScopingReview['confidenceLevel'])}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="High" id="conf1" />
              <Label htmlFor="conf1" className="font-mono">High - Complete picture, ready to proceed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Medium" id="conf2" />
              <Label htmlFor="conf2" className="font-mono">Medium - Good foundation, some gaps remain</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Low" id="conf3" />
              <Label htmlFor="conf3" className="font-mono">Low - Initial understanding, needs follow-up</Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Additional Context */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Additional Context</h2>
          <p className="text-text-secondary mb-4">
            Any additional insights or concerns for the report generation?
          </p>
          
          <Textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Optional: Key insights, concerns, or context for report framing..."
            className="min-h-[120px] font-mono"
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            disabled={isGenerating}
          >
            Back to Discovery
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!hasReviewed || isGenerating}
            className="btn-sep px-8"
          >
            {isGenerating ? 'Generating Report...' : 'Generate Analysis Report'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScopingReviewComponent;