import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MockStorageService } from '@/lib/mockStorage';
import { 
  DiscoverySession as SessionType, 
  DiscoveryArea,
  DiscoveryNote,
  QuestionBlock,
  ProgressTracking,
  DISCOVERY_AREAS,
  DISCOVERY_AREA_PROMPTS,
  ICP_CONFIGS
} from '@/types/discovery';

const DiscoverySessionV2 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionType | null>(null);
  const [discoveryAreas, setDiscoveryAreas] = useState<DiscoveryArea[]>([]);
  const [activeArea, setActiveArea] = useState<DiscoveryArea | null>(null);
  const [discoveryNotes, setDiscoveryNotes] = useState<Map<string, DiscoveryNote>>(new Map());
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [progressTracking, setProgressTracking] = useState<ProgressTracking>({
    totalAssessments: 16,
    completedAssessments: 0,
    areaBreakdown: {},
    isComplete: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (sessionId) {
      loadSession();
      loadDiscoveryAreas();
    }
  }, [sessionId]);

  // Auto-save notes when typing
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (activeArea && currentNotes) {
        saveCurrentAreaNotes();
      }
    }, 3000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [currentNotes, activeArea]);

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
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadDiscoveryAreas = async () => {
    try {
      if (!sessionId) return;

      const areas = await MockStorageService.getDiscoveryAreas(sessionId);
      setDiscoveryAreas(areas);
      
      // Initialize progress tracking
      const areaBreakdown: ProgressTracking['areaBreakdown'] = {};
      let totalAssessments = 0;
      
      areas.forEach(area => {
        // Load any existing notes
        const existingNote = loadAreaNote(area.id);
        if (existingNote) {
          discoveryNotes.set(area.id, existingNote);
          totalAssessments += existingNote.questions.length;
        }
        
        areaBreakdown[area.area_name] = {
          questionsAsked: existingNote?.questions.length || 0,
          hasNotes: !!existingNote?.currentNotes || !!existingNote?.questions.length,
          lastUpdated: existingNote?.lastUpdated || new Date()
        };
      });
      
      setProgressTracking(prev => ({
        ...prev,
        completedAssessments: totalAssessments,
        areaBreakdown,
        isComplete: totalAssessments >= 16
      }));
      
      // Set first area as active
      if (areas.length > 0) {
        setActiveArea(areas[0]);
        loadAreaData(areas[0]);
      }
    } catch (error) {
      console.error('Error loading discovery areas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAreaNote = (areaId: string): DiscoveryNote | null => {
    // In production, this would load from database
    const stored = localStorage.getItem(`discovery_note_${areaId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const saveAreaNote = (areaId: string, note: DiscoveryNote) => {
    // In production, save to database
    localStorage.setItem(`discovery_note_${areaId}`, JSON.stringify(note));
    discoveryNotes.set(areaId, note);
    setDiscoveryNotes(new Map(discoveryNotes));
  };

  const loadAreaData = (area: DiscoveryArea) => {
    const existingNote = discoveryNotes.get(area.id);
    
    if (existingNote) {
      // Load existing notes and question
      setCurrentNotes(existingNote.currentNotes);
      const lastQuestion = existingNote.questions.length > 0 
        ? existingNote.questions[existingNote.questions.length - 1].questionText
        : getInitialQuestion(area.area_name);
      setCurrentQuestion(lastQuestion);
    } else {
      // New area - set initial question
      setCurrentNotes('');
      setCurrentQuestion(getInitialQuestion(area.area_name));
    }
  };

  const getInitialQuestion = (areaName: string): string => {
    const areaConfig = DISCOVERY_AREA_PROMPTS[areaName as keyof typeof DISCOVERY_AREA_PROMPTS];
    if (areaConfig && areaConfig.initialQuestions.length > 0) {
      let question = areaConfig.initialQuestions[0];
      if (session?.contact_name) {
        question = question.replace('[Contact Name]', session.contact_name);
      }
      return question;
    }
    return `Tell me about your ${areaName.toLowerCase()}.`;
  };

  const handleAreaSelect = (area: DiscoveryArea) => {
    if (area.id === activeArea?.id) return;
    
    // Save current area notes before switching
    if (activeArea) {
      saveCurrentAreaNotes();
    }
    
    setActiveArea(area);
    loadAreaData(area);
  };

  const saveCurrentAreaNotes = () => {
    if (!activeArea) return;
    
    const existingNote = discoveryNotes.get(activeArea.id) || {
      areaId: activeArea.id,
      areaName: activeArea.area_name,
      questions: [],
      currentNotes: '',
      lastUpdated: new Date()
    };
    
    const updatedNote: DiscoveryNote = {
      ...existingNote,
      currentNotes,
      lastUpdated: new Date()
    };
    
    saveAreaNote(activeArea.id, updatedNote);
  };

  const handleAssess = async () => {
    if (!activeArea || !session) return;
    
    setIsGeneratingQuestion(true);
    
    try {
      // Save current notes with citation
      const existingNote = discoveryNotes.get(activeArea.id) || {
        areaId: activeArea.id,
        areaName: activeArea.area_name,
        questions: [],
        currentNotes: '',
        lastUpdated: new Date()
      };
      
      // Create question block for current notes
      const questionBlock: QuestionBlock = {
        id: crypto.randomUUID(),
        questionText: currentQuestion,
        questionNumber: existingNote.questions.length + 1,
        notes: currentNotes,
        isCollapsed: existingNote.questions.length > 0, // Collapse previous questions
        timestamp: new Date()
      };
      
      // Update the note with new question block
      const updatedNote: DiscoveryNote = {
        ...existingNote,
        questions: [...existingNote.questions, questionBlock],
        currentNotes: '', // Clear current notes for new question
        lastUpdated: new Date()
      };
      
      saveAreaNote(activeArea.id, updatedNote);
      
      // Generate new question based on all context
      const newQuestion = await generateNextQuestion(activeArea, updatedNote);
      setCurrentQuestion(newQuestion);
      setCurrentNotes(''); // Clear notes area for new question
      
      // Update progress tracking
      updateProgress(activeArea.area_name);
      
    } catch (error) {
      console.error('Error generating assessment:', error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const generateNextQuestion = async (area: DiscoveryArea, note: DiscoveryNote): Promise<string> => {
    // In production, this would call Claude API
    // For now, use contextual questions based on area and progress
    
    const questionCount = note.questions.length;
    const areaConfig = DISCOVERY_AREA_PROMPTS[area.area_name as keyof typeof DISCOVERY_AREA_PROMPTS];
    const icpConfig = session?.client_icp ? ICP_CONFIGS[session.client_icp as keyof typeof ICP_CONFIGS] : null;
    
    // Use deeper questions as we progress
    if (questionCount === 0 && areaConfig?.initialQuestions[1]) {
      return areaConfig.initialQuestions[1];
    } else if (questionCount === 1 && areaConfig?.initialQuestions[2]) {
      return areaConfig.initialQuestions[2];
    }
    
    // Generate industry-specific follow-ups
    if (icpConfig && area.area_name === 'Current Technology Stack') {
      const industryQuestions = Object.values(icpConfig.questions);
      if (industryQuestions[questionCount % industryQuestions.length]) {
        return industryQuestions[questionCount % industryQuestions.length];
      }
    }
    
    // Generic follow-up based on area
    const followUps: Record<string, string[]> = {
      'Current Technology Stack': [
        'How do these systems integrate with each other?',
        'What are the main pain points with your current technology?',
        'How much time does your team spend on manual processes?'
      ],
      'Pain Points & Challenges': [
        'How is this challenge impacting your business metrics?',
        'What workarounds are you currently using?',
        'How much is this costing you in terms of time and resources?'
      ],
      'Business Impact & Urgency': [
        'What happens if this problem isn\'t solved in the next 6 months?',
        'How is this affecting your competitive position?',
        'What\'s the opportunity cost of not addressing this now?'
      ]
    };
    
    const areaFollowUps = followUps[area.area_name] || ['Can you elaborate on that?'];
    return areaFollowUps[questionCount % areaFollowUps.length];
  };

  const updateProgress = (areaName: string) => {
    setProgressTracking(prev => {
      const updatedBreakdown = { ...prev.areaBreakdown };
      const currentArea = updatedBreakdown[areaName] || {
        questionsAsked: 0,
        hasNotes: false,
        lastUpdated: new Date()
      };
      
      updatedBreakdown[areaName] = {
        questionsAsked: currentArea.questionsAsked + 1,
        hasNotes: true,
        lastUpdated: new Date()
      };
      
      const newTotal = prev.completedAssessments + 1;
      
      return {
        ...prev,
        completedAssessments: newTotal,
        areaBreakdown: updatedBreakdown,
        isComplete: newTotal >= 16
      };
    });
  };

  const toggleQuestionBlock = (areaId: string, questionId: string) => {
    const note = discoveryNotes.get(areaId);
    if (!note) return;
    
    const updatedQuestions = note.questions.map(q => 
      q.id === questionId ? { ...q, isCollapsed: !q.isCollapsed } : q
    );
    
    const updatedNote = { ...note, questions: updatedQuestions };
    saveAreaNote(areaId, updatedNote);
  };

  const handleSubmit = async () => {
    if (!progressTracking.isComplete) return;
    
    // Save all current notes
    saveCurrentAreaNotes();
    
    // In production, this would:
    // 1. Generate Perplexity analysis
    // 2. Save to Airtable
    // 3. Send email to consultant
    
    console.log('Submitting discovery with notes:', Array.from(discoveryNotes.values()));
    alert('Discovery submitted! Analysis will be sent to your email.');
    
    // Navigate to a summary page
    navigate(`/discovery/summary/${sessionId}`);
  };

  const progressPercentage = (progressTracking.completedAssessments / progressTracking.totalAssessments) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sep-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading discovery session...</p>
        </div>
      </div>
    );
  }

  const selectedICP = session?.client_icp ? ICP_CONFIGS[session.client_icp as keyof typeof ICP_CONFIGS] : null;
  const currentAreaNote = activeArea ? discoveryNotes.get(activeArea.id) : null;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold sep-text">Discovery Session</h1>
              {session && (
                <div className="text-sm text-text-secondary mt-1">
                  {session.account_name} • {session.contact_name} • {selectedICP?.label}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-text-secondary mb-1">
                Discovery Progress: {progressTracking.completedAssessments}/{progressTracking.totalAssessments} Assessments
              </div>
              <div className="flex items-center space-x-3">
                <Progress value={progressPercentage} className="w-48" />
                <span className="text-text-primary font-medium">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar - Discovery Areas */}
        <div className="w-80 border-r border-glass-border bg-glass-bg/30 flex-shrink-0 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Discovery Areas</h3>
            <div className="space-y-3">
              {discoveryAreas.map((area) => {
                const areaProgress = progressTracking.areaBreakdown[area.area_name];
                const questionsAsked = areaProgress?.questionsAsked || 0;
                const hasNotes = areaProgress?.hasNotes || false;
                const areaProgressPercent = Math.min((questionsAsked / 2) * 100, 100);
                
                return (
                  <Card
                    key={area.id}
                    className={`p-4 cursor-pointer transition-all duration-300 ${
                      activeArea?.id === area.id
                        ? 'border-2 border-sep-primary sep-glow bg-glass-bg'
                        : 'border border-glass-border hover:border-sep-secondary/50'
                    }`}
                    onClick={() => handleAreaSelect(area)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${
                        activeArea?.id === area.id ? 'sep-text' : 'text-text-primary'
                      }`}>
                        {area.area_name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {hasNotes && <span className="text-xs text-success">✓</span>}
                        <span className="text-xs text-text-secondary">
                          {questionsAsked}/2
                        </span>
                      </div>
                    </div>
                    <Progress value={areaProgressPercent} className="mb-2 h-1" />
                    <p className="text-xs text-text-muted">
                      {DISCOVERY_AREA_PROMPTS[area.area_name as keyof typeof DISCOVERY_AREA_PROMPTS]?.description}
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Area Breakdown */}
            <div className="mt-6 p-4 bg-glass-bg rounded-lg">
              <h4 className="text-sm font-medium text-text-primary mb-3">Area Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(progressTracking.areaBreakdown).map(([areaName, data]) => {
                  const progress = Math.min((data.questionsAsked / 2) * 100, 100);
                  const icon = progress === 100 ? '✅' : progress > 0 ? '⚡' : '⭕';
                  
                  return (
                    <div key={areaName} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-text-secondary flex items-center">
                          <span className="mr-2">{icon}</span>
                          {areaName}
                        </span>
                        <span className="text-text-muted">({data.questionsAsked}/2)</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Note Taking Interface */}
        <div className="flex-1 flex flex-col">
          {activeArea ? (
            <>
              {/* ASSESS Button */}
              <div className="p-6 border-b border-glass-border">
                <Button
                  onClick={handleAssess}
                  disabled={!currentNotes.trim() || isGeneratingQuestion}
                  className="w-full py-6 text-lg font-bold bg-gradient-to-r from-sep-accent to-sep-primary hover:from-sep-accent/90 hover:to-sep-primary/90 text-white"
                >
                  {isGeneratingQuestion ? 'Generating Question...' : 'ASSESS'}
                </Button>
              </div>

              {/* Current Question */}
              <div className="p-6 bg-glass-bg/50">
                <h3 className="text-sm font-medium text-text-secondary mb-2">Current Question:</h3>
                <p className="text-lg text-text-primary font-medium">
                  {currentQuestion}
                </p>
              </div>

              {/* Discovery Notes */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-sm font-medium text-text-secondary mb-4">Discovery Notes:</h3>
                
                {/* Previous Question Blocks */}
                {currentAreaNote?.questions.map((question, index) => (
                  <div key={question.id} className="mb-4">
                    <div
                      className={`border-l-4 border-sep-primary bg-sep-light rounded-lg overflow-hidden ${
                        question.isCollapsed ? 'h-12' : ''
                      }`}
                    >
                      <div
                        className="flex items-center px-4 py-3 bg-sep-light/50 cursor-pointer hover:bg-sep-light/70 transition-colors"
                        onClick={() => toggleQuestionBlock(activeArea.id, question.id)}
                      >
                        {question.isCollapsed ? (
                          <ChevronRight className="w-4 h-4 mr-2 text-text-secondary" />
                        ) : (
                          <ChevronDown className="w-4 h-4 mr-2 text-text-secondary" />
                        )}
                        <span className="text-sm text-text-secondary italic">
                          (Answers to: {question.questionText.slice(0, 60)}...)
                        </span>
                      </div>
                      {!question.isCollapsed && (
                        <div className="px-4 py-3 bg-white whitespace-pre-wrap">
                          {question.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Current Notes Area */}
                <div className="border-2 border-sep-secondary rounded-lg bg-white">
                  <Textarea
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    placeholder={`Take notes about ${activeArea.area_name.toLowerCase()}...\n\nPress Enter to add new lines. Click ASSESS when ready for the next question.`}
                    className="w-full min-h-[300px] p-4 border-0 focus:ring-0 resize-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              {progressTracking.isComplete && (
                <div className="p-6 border-t border-glass-border bg-glass-bg/50">
                  <Button
                    onClick={handleSubmit}
                    className="w-full py-4 bg-gradient-to-r from-success to-sep-secondary hover:from-success/90 hover:to-sep-secondary/90 text-white font-semibold"
                  >
                    Complete Discovery & Generate Analysis
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-text-muted">
                Select a discovery area to begin taking notes
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverySessionV2;