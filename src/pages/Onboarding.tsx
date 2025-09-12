import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Check, AlertCircle, Sparkles, Target, Users, Zap } from 'lucide-react';
import { getCurrentUser, logActivity } from '@/lib/supabase-auth';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [businessContext, setBusinessContext] = useState<any>(null);
  const [customICPs, setCustomICPs] = useState<any[]>([]);
  const [selectedICPs, setSelectedICPs] = useState<string[]>([]);

  useEffect(() => {
    loadUserAndContext();
  }, []);

  const loadUserAndContext = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
      
      // For demo purposes, simulate business context
      const domain = currentUser.email.split('@')[1];
      setBusinessContext({
        domain,
        company_name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
        industry: 'Technology',
        services: ['Software Development', 'Consulting', 'Digital Transformation'],
        target_markets: ['Enterprise', 'Mid-Market', 'Healthcare'],
        business_model: 'Consulting',
        company_size: '11-50',
        confidence_score: 85
      });
      
      // Simulate custom ICPs
      setCustomICPs([
        {
          name: 'Enterprise SaaS Companies',
          description: 'Large software companies needing strategic consulting',
          target_company_size: ['201-1000', '1000+'],
          target_industries: ['Technology', 'SaaS', 'Enterprise Software'],
          target_roles: ['CTO', 'VP Engineering', 'Head of Product']
        },
        {
          name: 'Healthcare Technology Leaders',
          description: 'Healthcare organizations adopting new technologies',
          target_company_size: ['51-200', '201-1000'],
          target_industries: ['Healthcare', 'HealthTech', 'MedTech'],
          target_roles: ['CIO', 'VP Technology', 'Digital Director']
        }
      ]);
      
      setCurrentStep(2);
    } catch (err) {
      console.error('Error loading user context:', err);
      setError('Failed to load your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateIntelligence = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the activity
      await logActivity('onboarding_intelligence_generated', {
        domain: user.email.split('@')[1],
        icps_count: 2
      });
      
      setCurrentStep(3);
    } catch (err: any) {
      console.error('Error generating intelligence:', err);
      setError(err.message || 'Failed to generate business intelligence. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleICPSelection = (icpName: string) => {
    setSelectedICPs(prev => 
      prev.includes(icpName) 
        ? prev.filter(name => name !== icpName)
        : [...prev, icpName]
    );
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsLoading(true);
      
      // Log completion
      await logActivity('onboarding_completed', {
        selected_icps: selectedICPs.length,
        total_icps: customICPs.length
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isPersonalEmail = (email: string): boolean => {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'icloud.com', 'protonmail.com', 'aol.com', 'live.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return personalDomains.includes(domain);
  };

  if (isLoading && currentStep === 1) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-sep-primary mx-auto mb-4" />
          <p className="text-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 48 48" className="text-white">
              <g fill="white" opacity="0.95">
                <ellipse cx="18" cy="12" rx="4" ry="10" transform="rotate(-10 18 12)"/>
                <ellipse cx="30" cy="12" rx="4" ry="10" transform="rotate(10 30 12)"/>
                <ellipse cx="24" cy="20" rx="9" ry="8"/>
                <ellipse cx="24" cy="32" rx="10" ry="11"/>
                <circle cx="35" cy="35" r="3"/>
              </g>
            </svg>
            <h1 className="text-2xl font-bold text-white">DeepRabbit</h1>
            <div className="ml-auto">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-sep-primary' : 'bg-glass-border'}`}></div>
                <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-sep-primary' : 'bg-glass-border'}`}></div>
                <div className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-sep-primary' : 'bg-glass-border'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-text-primary">
                Welcome to DeepRabbit
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                We'll analyze your business and create personalized discovery profiles to supercharge your client conversations
              </p>
            </div>

            <Card className="glass-card p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-sep-primary" />
                </div>
                
                <h3 className="text-2xl font-semibold text-text-primary text-center">
                  Let's set up your intelligence engine
                </h3>
                
                {user && isPersonalEmail(user.email) ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="text-sm text-text-primary font-medium">Personal Email Detected</p>
                        <p className="text-xs text-text-secondary">
                          You're using a personal email ({user.email}). We can't auto-generate business context from personal domains.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-text-primary font-medium">
                        Company Website (Optional)
                      </Label>
                      <Input
                        placeholder="e.g., yourcompany.com"
                        className="input-field"
                      />
                      <p className="text-xs text-text-muted">
                        If you provide your company website, we can generate personalized discovery profiles for you
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user && (
                      <div className="flex items-center gap-3 p-4 bg-sep-primary/10 border border-sep-primary/30 rounded-lg">
                        <Check className="h-5 w-5 text-sep-primary" />
                        <div>
                          <p className="text-sm text-text-primary font-medium">Business Email Detected</p>
                          <p className="text-xs text-text-secondary">
                            {user.email} - We'll analyze your company's domain to create personalized discovery profiles
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <Target className="h-8 w-8 text-sep-primary mx-auto" />
                    <p className="text-sm text-text-secondary">Custom ICPs</p>
                  </div>
                  <div className="space-y-2">
                    <Users className="h-8 w-8 text-sep-primary mx-auto" />
                    <p className="text-sm text-text-secondary">Smart Questions</p>
                  </div>
                  <div className="space-y-2">
                    <Zap className="h-8 w-8 text-sep-primary mx-auto" />
                    <p className="text-sm text-text-secondary">Auto Context</p>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateIntelligence}
                  disabled={isLoading}
                  className="btn-sep w-full py-4 text-lg font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Analyzing your business...
                    </>
                  ) : (
                    <>
                      Generate My Intelligence
                      <Sparkles className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-error" />
                    <p className="text-sm text-error">{error}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Business Context Review */}
        {currentStep === 2 && businessContext && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-text-primary">
                Your Business Intelligence
              </h2>
              <p className="text-lg text-text-secondary">
                We've analyzed your business context. Review and confirm the details below.
              </p>
            </div>

            <Card className="glass-card p-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-text-primary font-medium">Company</Label>
                  <p className="text-text-secondary mt-1">{businessContext.company_name}</p>
                </div>
                <div>
                  <Label className="text-text-primary font-medium">Industry</Label>
                  <p className="text-text-secondary mt-1">{businessContext.industry}</p>
                </div>
                <div>
                  <Label className="text-text-primary font-medium">Business Model</Label>
                  <p className="text-text-secondary mt-1">{businessContext.business_model}</p>
                </div>
                <div>
                  <Label className="text-text-primary font-medium">Company Size</Label>
                  <p className="text-text-secondary mt-1">{businessContext.company_size}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-text-primary font-medium">Key Services</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {businessContext.services.map((service: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-sep-primary/10 text-sep-primary text-sm rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-text-primary font-medium">Target Markets</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {businessContext.target_markets.map((market: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-user-accent/10 text-user-accent text-sm rounded-full">
                        {market}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${businessContext.confidence_score > 70 ? 'bg-success' : businessContext.confidence_score > 40 ? 'bg-warning' : 'bg-error'}`}></div>
                  <span className="text-sm text-text-secondary">
                    Confidence: {businessContext.confidence_score}%
                  </span>
                </div>
                
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="btn-sep"
                >
                  Continue to ICPs
                  <span className="ml-2">→</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: ICP Selection */}
        {currentStep === 3 && customICPs.length > 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-text-primary">
                Your Custom Discovery Profiles
              </h2>
              <p className="text-lg text-text-secondary">
                We've generated {customICPs.length} personalized discovery profiles. Select the ones most relevant to your business.
              </p>
            </div>

            <div className="grid gap-6">
              {customICPs.map((icp: any, index: number) => (
                <Card 
                  key={index}
                  className={`glass-card p-6 cursor-pointer transition-all border-2 ${
                    selectedICPs.includes(icp.name) 
                      ? 'border-sep-primary bg-sep-primary/5' 
                      : 'border-glass-border hover:border-sep-primary/50'
                  }`}
                  onClick={() => handleICPSelection(icp.name)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{icp.name}</h3>
                      <p className="text-text-secondary mt-1">{icp.description}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedICPs.includes(icp.name) 
                        ? 'border-sep-primary bg-sep-primary' 
                        : 'border-glass-border'
                    }`}>
                      {selectedICPs.includes(icp.name) && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-text-muted">Industries</Label>
                      <p className="text-text-secondary">{icp.target_industries.join(', ')}</p>
                    </div>
                    <div>
                      <Label className="text-text-muted">Company Size</Label>
                      <p className="text-text-secondary">{icp.target_company_size.join(', ')}</p>
                    </div>
                    <div>
                      <Label className="text-text-muted">Key Roles</Label>
                      <p className="text-text-secondary">{icp.target_roles.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-text-muted">
                Selected {selectedICPs.length} of {customICPs.length} profiles
              </div>
              
              <Button
                onClick={handleCompleteOnboarding}
                disabled={isLoading || selectedICPs.length === 0}
                className="btn-sep"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;