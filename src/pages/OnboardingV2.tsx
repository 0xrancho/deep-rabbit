import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Check, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/supabase-auth';
import { 
  extractBusinessIntelligence, 
  validateICPs, 
  validateCTAs,
  type BusinessContext,
  type DetailedICP,
  type PostDiscoveryCTA
} from '@/services/business-intelligence-v2';

type OnboardingStep = 'loading' | 'service' | 'icps' | 'ctas' | 'complete';

const OnboardingV2 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('loading');
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Editable states
  const [serviceDescription, setServiceDescription] = useState('');
  const [editingService, setEditingService] = useState(false);
  const [icps, setICPs] = useState<DetailedICP[]>([]);
  const [editingICPs, setEditingICPs] = useState(false);
  const [ctas, setCTAs] = useState<PostDiscoveryCTA[]>([]);
  const [editingCTAs, setEditingCTAs] = useState(false);

  useEffect(() => {
    initializeOnboarding();
  }, []);

  const initializeOnboarding = async () => {
    try {
      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);

      // Check if already onboarded
      const savedContext = localStorage.getItem(`business_context_${currentUser.id}`);
      if (savedContext) {
        // User already onboarded, go to dashboard
        navigate('/dashboard');
        return;
      }

      // Start extracting business intelligence
      await extractBusinessData(currentUser.company);
    } catch (error) {
      console.error('Onboarding initialization error:', error);
      setIsProcessing(false);
    }
  };

  const extractBusinessData = async (companyUrl: string) => {
    setCurrentStep('loading');
    setIsProcessing(true);

    try {
      // Extract business intelligence
      const context = await extractBusinessIntelligence(companyUrl);
      
      setBusinessContext(context);
      setServiceDescription(context.service.primaryService);
      setICPs(validateICPs(context.icps));
      setCTAs(validateCTAs(context.ctas));
      
      // Move to first confirmation step
      setCurrentStep('service');
    } catch (error) {
      console.error('Business extraction error:', error);
      // Use defaults on error
      setServiceDescription('Professional consulting services');
      setICPs(validateICPs([]));
      setCTAs(validateCTAs([]));
      setCurrentStep('service');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleServiceConfirm = () => {
    if (businessContext) {
      setBusinessContext({
        ...businessContext,
        service: {
          ...businessContext.service,
          primaryService: serviceDescription
        }
      });
    }
    setEditingService(false);
    setCurrentStep('icps');
  };

  const handleAddICP = () => {
    const newICP: DetailedICP = {
      id: `icp_${icps.length + 1}`,
      name: 'New ICP',
      industry: '',
      subSegment: '',
      typicalProblem: '',
      budgetRange: '',
      decisionMaker: '',
      salesCycle: '',
      indicators: []
    };
    setICPs([...icps, newICP]);
  };

  const handleUpdateICP = (index: number, field: keyof DetailedICP, value: string | string[]) => {
    const updated = [...icps];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setICPs(updated);
  };

  const handleDeleteICP = (index: number) => {
    if (icps.length > 1) { // Minimum 1 ICP
      setICPs(icps.filter((_, i) => i !== index));
    }
  };

  const handleICPsConfirm = () => {
    setEditingICPs(false);
    setCurrentStep('ctas');
  };

  const handleAddCTA = () => {
    const newCTA: PostDiscoveryCTA = {
      id: `cta_${ctas.length + 1}`,
      label: 'New CTA',
      description: '',
      triggerCriteria: '',
      intentLevel: 'medium',
      buyerType: 'business'
    };
    setCTAs([...ctas, newCTA]);
  };

  const handleUpdateCTA = (index: number, field: keyof PostDiscoveryCTA, value: any) => {
    const updated = [...ctas];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setCTAs(updated);
  };

  const handleDeleteCTA = (index: number) => {
    if (ctas.length > 1) { // Minimum 1 CTA
      setCTAs(ctas.filter((_, i) => i !== index));
    }
  };

  const handleCTAsConfirm = async () => {
    setEditingCTAs(false);
    await saveConfiguration();
    setCurrentStep('complete');
  };

  const saveConfiguration = async () => {
    if (!user || !businessContext) return;

    const finalContext: BusinessContext = {
      ...businessContext,
      service: {
        ...businessContext.service,
        primaryService: serviceDescription
      },
      icps: validateICPs(icps),
      ctas: validateCTAs(ctas)
    };

    // Save to localStorage (will be saved to Supabase in production)
    localStorage.setItem(`business_context_${user.id}`, JSON.stringify(finalContext));
    
    // Save individual pieces for quick access
    localStorage.setItem(`custom_icps_${user.id}`, JSON.stringify(icps));
    localStorage.setItem(`custom_ctas_${user.id}`, JSON.stringify(ctas));
    localStorage.setItem(`service_definition_${user.id}`, JSON.stringify(finalContext.service));
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  // Loading Screen
  if (currentStep === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <svg width="64" height="64" viewBox="0 0 48 48" className="text-white mx-auto animate-pulse">
              <g fill="white" opacity="0.95">
                <ellipse cx="18" cy="12" rx="4" ry="10" transform="rotate(-10 18 12)"/>
                <ellipse cx="30" cy="12" rx="4" ry="10" transform="rotate(10 30 12)"/>
                <ellipse cx="24" cy="20" rx="9" ry="8"/>
                <ellipse cx="24" cy="32" rx="10" ry="11"/>
                <circle cx="35" cy="35" r="3"/>
              </g>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Setting up your account...
          </h2>
          
          <p className="text-text-secondary mb-8">
            We're analyzing your company website to personalize DeepRabbit for your business
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting business context...</span>
            </div>
            <Progress value={33} className="w-full" />
          </div>
          
          <p className="text-text-muted text-sm mt-8">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    );
  }

  // Service Confirmation
  if (currentStep === 'service') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Hello {user?.full_name?.split(' ')[0]}!
            </h2>
            <p className="text-text-secondary text-lg">
              Let's confirm what we learned about your business
            </p>
          </div>

          <Card className="glass-card p-8">
            <div className="space-y-6">
              <div>
                <Label className="text-text-primary text-lg mb-4 block">
                  It looks like you're in the business of:
                </Label>
                
                {editingService ? (
                  <div className="space-y-4">
                    <Input
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      className="input-field"
                      placeholder="Describe your service in one sentence"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleServiceConfirm}
                        className="btn-sep"
                      >
                        Confirm
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingService(false);
                          setServiceDescription(businessContext?.service.primaryService || '');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-glass-bg rounded-lg">
                    <p className="text-text-primary">{serviceDescription}</p>
                    <Button
                      onClick={() => setEditingService(true)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {businessContext && (
                <div className="pt-4 border-t border-glass-border">
                  <h3 className="text-text-secondary text-sm font-medium mb-3">Additional Context</h3>
                  <div className="space-y-2 text-sm text-text-muted">
                    <p>• Service Type: {businessContext.service.serviceType}</p>
                    <p>• Typical Engagement: {businessContext.service.typicalEngagementSize}</p>
                    <p>• Specializations: {businessContext.service.specializations.join(', ')}</p>
                  </div>
                </div>
              )}

              {!editingService && (
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={() => setEditingService(true)}
                    variant="outline"
                  >
                    No, let me correct this
                  </Button>
                  <Button
                    onClick={handleServiceConfirm}
                    className="btn-sep"
                  >
                    Yes, that's correct →
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ICP Configuration
  if (currentStep === 'icps') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Your Target Industries
            </h2>
            <p className="text-text-secondary text-lg">
              Are these your ideal client profiles?
            </p>
          </div>

          <Card className="glass-card p-8">
            {editingICPs ? (
              <div className="space-y-6">
                {icps.map((icp, index) => (
                  <div key={icp.id} className="p-4 border border-glass-border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <Input
                        value={icp.name}
                        onChange={(e) => handleUpdateICP(index, 'name', e.target.value)}
                        className="input-field text-lg font-medium"
                        placeholder="ICP Name"
                      />
                      <Button
                        onClick={() => handleDeleteICP(index)}
                        variant="ghost"
                        size="sm"
                        disabled={icps.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-text-muted">Industry</Label>
                        <Input
                          value={icp.industry}
                          onChange={(e) => handleUpdateICP(index, 'industry', e.target.value)}
                          className="input-field text-sm"
                          placeholder="e.g., Healthcare"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-text-muted">Sub-segment</Label>
                        <Input
                          value={icp.subSegment}
                          onChange={(e) => handleUpdateICP(index, 'subSegment', e.target.value)}
                          className="input-field text-sm"
                          placeholder="e.g., Regional Hospitals"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-text-muted">Budget Range</Label>
                        <Input
                          value={icp.budgetRange}
                          onChange={(e) => handleUpdateICP(index, 'budgetRange', e.target.value)}
                          className="input-field text-sm"
                          placeholder="e.g., $50K-$200K"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-text-muted">Decision Maker</Label>
                        <Input
                          value={icp.decisionMaker}
                          onChange={(e) => handleUpdateICP(index, 'decisionMaker', e.target.value)}
                          className="input-field text-sm"
                          placeholder="e.g., VP Engineering"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-text-muted">Typical Problem</Label>
                      <Input
                        value={icp.typicalProblem}
                        onChange={(e) => handleUpdateICP(index, 'typicalProblem', e.target.value)}
                        className="input-field text-sm"
                        placeholder="What problem do they typically face?"
                      />
                    </div>
                  </div>
                ))}
                
                {icps.length < 6 && (
                  <Button
                    onClick={handleAddICP}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another ICP
                  </Button>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setEditingICPs(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleICPsConfirm}
                    className="btn-sep"
                  >
                    Save ICPs
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {icps.map((icp) => (
                  <div key={icp.id} className="p-4 bg-glass-bg rounded-lg">
                    <h3 className="font-medium text-text-primary mb-2">{icp.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary">
                      <p>• {icp.industry} - {icp.subSegment}</p>
                      <p>• Budget: {icp.budgetRange}</p>
                      <p>• Decision Maker: {icp.decisionMaker}</p>
                      <p>• Sales Cycle: {icp.salesCycle}</p>
                    </div>
                    <p className="text-sm text-text-muted mt-2">
                      Problem: {icp.typicalProblem}
                    </p>
                  </div>
                ))}
                
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={() => setEditingICPs(true)}
                    variant="outline"
                  >
                    No, let me edit these
                  </Button>
                  <Button
                    onClick={handleICPsConfirm}
                    className="btn-sep"
                  >
                    Yes, continue →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // CTA Configuration
  if (currentStep === 'ctas') {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Post-Discovery Actions
            </h2>
            <p className="text-text-secondary text-lg">
              What are your typical next steps after a DeepRabbit discovery?
            </p>
          </div>

          <Card className="glass-card p-8">
            {editingCTAs ? (
              <div className="space-y-4">
                {ctas.map((cta, index) => (
                  <div key={cta.id} className="p-4 border border-glass-border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <Input
                        value={cta.label}
                        onChange={(e) => handleUpdateCTA(index, 'label', e.target.value)}
                        className="input-field font-medium"
                        placeholder="CTA Label"
                      />
                      <Button
                        onClick={() => handleDeleteCTA(index)}
                        variant="ghost"
                        size="sm"
                        disabled={ctas.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Input
                      value={cta.triggerCriteria}
                      onChange={(e) => handleUpdateCTA(index, 'triggerCriteria', e.target.value)}
                      className="input-field text-sm"
                      placeholder="When to use this CTA?"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={cta.intentLevel}
                        onChange={(e) => handleUpdateCTA(index, 'intentLevel', e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="high">High Intent</option>
                        <option value="medium">Medium Intent</option>
                        <option value="low">Low Intent</option>
                      </select>
                      <select
                        value={cta.buyerType}
                        onChange={(e) => handleUpdateCTA(index, 'buyerType', e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="technical">Technical Buyer</option>
                        <option value="business">Business Buyer</option>
                        <option value="executive">Executive Buyer</option>
                      </select>
                    </div>
                  </div>
                ))}
                
                {ctas.length < 6 && (
                  <Button
                    onClick={handleAddCTA}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another CTA
                  </Button>
                )}
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setEditingCTAs(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCTAsConfirm}
                    className="btn-sep"
                  >
                    Save & Complete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {ctas.map((cta) => (
                  <div key={cta.id} className="p-4 bg-glass-bg rounded-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-text-primary">{cta.label}</h3>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          cta.intentLevel === 'high' ? 'bg-success/20 text-success' :
                          cta.intentLevel === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-error/20 text-error'
                        }`}>
                          {cta.intentLevel} intent
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-glass-bg text-text-secondary">
                          {cta.buyerType}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary mt-2">
                      {cta.triggerCriteria}
                    </p>
                  </div>
                ))}
                
                <div className="flex justify-between pt-6">
                  <Button
                    onClick={() => setEditingCTAs(true)}
                    variant="outline"
                  >
                    Edit CTAs
                  </Button>
                  <Button
                    onClick={handleCTAsConfirm}
                    className="btn-sep"
                  >
                    Continue →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Complete
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-success" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Your account is all set up!
          </h2>
          
          <p className="text-text-secondary mb-8">
            DeepRabbit is now personalized for your business. You can update these settings anytime from your account settings.
          </p>
          
          <Button
            onClick={handleComplete}
            className="btn-sep px-8 py-3"
          >
            Go to Dashboard →
          </Button>
          
          <p className="text-text-muted text-sm mt-8">
            Confidence score: {businessContext?.confidence ? `${(businessContext.confidence * 100).toFixed(0)}%` : 'N/A'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default OnboardingV2;