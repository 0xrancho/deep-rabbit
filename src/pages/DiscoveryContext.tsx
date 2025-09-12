import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCurrentUser } from '@/lib/supabase-auth';
import { MockStorageService } from '@/lib/mockStorage';
import { SolutionScope, NextStepGoal, DiscoverySession, ICP_CONFIGS } from '@/types/discovery';
import AppHeader from '@/components/AppHeader';

const DiscoveryContext = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    discoveryContext: '',
    solutionScope: '' as SolutionScope | '',
    nextStepGoal: '' as NextStepGoal | ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/auth');
    }
  };

  const handleAbandonSession = async () => {
    // During pre-knowledge phase, don't save anything - just go back
    navigate('/dashboard');
  };

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      if (!sessionId) {
        navigate('/discovery/setup');
        return;
      }

      const sessionData = await MockStorageService.getSession(sessionId);

      if (!sessionData) {
        navigate('/discovery/setup');
        return;
      }

      setSession(sessionData);
      
      // Pre-fill form if data exists
      setFormData({
        discoveryContext: sessionData.discovery_context || '',
        solutionScope: sessionData.solution_scope || '',
        nextStepGoal: sessionData.next_step_goal || ''
      });
    } catch (error) {
      console.error('Error loading session:', error);
      navigate('/discovery/setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = async () => {
    if (!isFormValid() || !sessionId) return;

    try {
      // Update the session with context information
      const updatedSession = await MockStorageService.updateSession(sessionId, {
        discovery_context: formData.discoveryContext,
        solution_scope: formData.solutionScope as SolutionScope,
        next_step_goal: formData.nextStepGoal as NextStepGoal
      });

      if (!updatedSession) {
        console.error('Error updating session');
        return;
      }

      // Initialize discovery areas
      await initializeDiscoveryAreas();

      console.log('Session updated, navigating to discovery interface');

      // Navigate to discovery interface
      navigate(`/discovery/session/${sessionId}`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const initializeDiscoveryAreas = async () => {
    if (!sessionId) return;

    try {
      const areas = await MockStorageService.initializeDiscoveryAreas(sessionId);
      console.log('Initialized discovery areas:', areas);
    } catch (error) {
      console.error('Error initializing discovery areas:', error);
    }
  };

  const handleBack = () => {
    navigate(`/discovery/icp/${sessionId}`);
  };

  const isFormValid = () => {
    return formData.discoveryContext.trim() && 
           formData.solutionScope && 
           formData.nextStepGoal;
  };

  const solutionScopes: SolutionScope[] = [
    'Software consultation ($10K-$50K)',
    'Custom development project ($50K-$200K)',
    'Enterprise system integration ($200K-$1M+)',
    'Long-term development partnership ($1M+)'
  ];

  const nextStepGoals: NextStepGoal[] = [
    'Technical deep-dive meeting',
    'Architecture assessment',
    'Proposal development',
    'Proof of concept discussion'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sep-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedICP = session?.client_icp ? ICP_CONFIGS[session.client_icp as keyof typeof ICP_CONFIGS] : null;

  return (
    <div className="min-h-screen bg-black">
      <AppHeader 
        title={session ? `${session.account_name} - ${session.contact_name}` : "Discovery Context"}
        user={user}
      />

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">✓</span>
            </div>
            <span className="text-success text-sm font-medium">Setup</span>
          </div>
          <div className="flex-1 h-0.5 bg-success"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">✓</span>
            </div>
            <span className="text-success text-sm font-medium">Client Profile</span>
          </div>
          <div className="flex-1 h-0.5 bg-glass-border"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sep-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">3</span>
            </div>
            <span className="text-sep-primary text-sm font-medium">Context & Scope</span>
          </div>
          <div className="flex-1 h-0.5 bg-glass-border"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-glass-bg border-2 border-glass-border rounded-full flex items-center justify-center">
              <span className="text-text-muted text-sm font-medium">4</span>
            </div>
            <span className="text-text-muted text-sm font-medium">Discovery</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Discovery Context & Scope
          </h2>
          <p className="text-text-secondary text-lg">
            Provide context about this discovery call to help GABI ask more intelligent questions
          </p>
        </div>

        <Card className="glass-card p-8">
          <div className="space-y-8">
            {/* Client Discovery Context */}
            <div className="space-y-3">
              <Label htmlFor="discoveryContext" className="text-text-primary font-medium text-lg">
                Client Discovery Context <span className="text-error">*</span>
              </Label>
              <p className="text-text-secondary text-sm mb-3">
                What context can you provide for this call with {session?.contact_name}?
              </p>
              <Textarea
                id="discoveryContext"
                value={formData.discoveryContext}
                onChange={(e) => handleInputChange('discoveryContext', e.target.value)}
                placeholder="e.g., They reached out after seeing our work with similar companies. They mentioned challenges with their current system's scalability and are evaluating options for modernization..."
                className="input-field min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Solution Scope */}
            <div className="space-y-4">
              <Label className="text-text-primary font-medium text-lg">
                Expected Solution Scope <span className="text-error">*</span>
              </Label>
              <p className="text-text-secondary text-sm">
                What type of engagement do you expect this to become?
              </p>
              <RadioGroup
                value={formData.solutionScope}
                onValueChange={(value) => handleInputChange('solutionScope', value)}
                className="space-y-3"
              >
                {solutionScopes.map((scope) => (
                  <div key={scope} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-glass-bg/30 transition-colors">
                    <RadioGroupItem value={scope} id={scope} />
                    <Label htmlFor={scope} className="text-text-primary cursor-pointer flex-1">
                      {scope}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Next Step Goal */}
            <div className="space-y-4">
              <Label className="text-text-primary font-medium text-lg">
                Next Step Goal <span className="text-error">*</span>
              </Label>
              <p className="text-text-secondary text-sm">
                What's your goal for the next step after this discovery call?
              </p>
              <RadioGroup
                value={formData.nextStepGoal}
                onValueChange={(value) => handleInputChange('nextStepGoal', value)}
                className="space-y-3"
              >
                {nextStepGoals.map((goal) => (
                  <div key={goal} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-glass-bg/30 transition-colors">
                    <RadioGroupItem value={goal} id={goal} />
                    <Label htmlFor={goal} className="text-text-primary cursor-pointer flex-1">
                      {goal}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Button
            onClick={handleBack}
            variant="outline"
            className="px-8 py-3"
          >
            ← Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isFormValid()}
            className="btn-sep px-8 py-3"
          >
            Start Discovery Session
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryContext;