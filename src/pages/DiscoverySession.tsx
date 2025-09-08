import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { MockStorageService } from '@/lib/mockStorage';
import { 
  DiscoverySession as SessionType, 
  DiscoveryArea, 
  ConversationMessage, 
  DISCOVERY_AREAS,
  DISCOVERY_AREA_PROMPTS,
  ICP_CONFIGS
} from '@/types/discovery';

const DiscoverySession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionType | null>(null);
  const [discoveryAreas, setDiscoveryAreas] = useState<DiscoveryArea[]>([]);
  const [activeArea, setActiveArea] = useState<DiscoveryArea | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
      loadDiscoveryAreas();
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
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const loadDiscoveryAreas = async () => {
    try {
      if (!sessionId) return;

      const areas = await MockStorageService.getDiscoveryAreas(sessionId);
      setDiscoveryAreas(areas);
      
      // Set active area (first one that's not 100% complete, or first one)
      const activeAreaFromDB = areas.find(area => area.is_active);
      const firstIncomplete = areas.find(area => area.completion_percentage < 100);
      setActiveArea(activeAreaFromDB || firstIncomplete || areas[0] || null);
      
      console.log('Loaded discovery areas:', areas);
    } catch (error) {
      console.error('Error loading discovery areas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAreaSelect = async (area: DiscoveryArea) => {
    if (area.id === activeArea?.id) return;

    // Update active area
    if (sessionId) {
      await MockStorageService.setActiveArea(sessionId, area.id);
    }

    setActiveArea(area);
    
    // If this area has no messages, generate initial questions
    if (area.conversation_data.length === 0) {
      generateInitialQuestions(area);
    }
  };

  const generateInitialQuestions = async (area: DiscoveryArea) => {
    if (!session) return;

    setIsGeneratingQuestions(true);
    
    try {
      // Get initial questions from the prompt configuration
      const areaConfig = DISCOVERY_AREA_PROMPTS[area.area_name];
      const icpConfig = session.client_icp ? ICP_CONFIGS[session.client_icp as keyof typeof ICP_CONFIGS] : null;
      
      const contextualQuestions = areaConfig.initialQuestions.map(question => 
        question.replace('[Contact Name]', session.contact_name)
      );

      // Add industry-specific context if available
      let enhancedQuestions = contextualQuestions;
      if (icpConfig && area.area_name === 'Current Technology Stack') {
        enhancedQuestions = [
          `Given that you're in ${icpConfig.label}, ${contextualQuestions[0].toLowerCase()}`,
          ...contextualQuestions.slice(1)
        ];
      }

      const initialMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        sender: 'gabi',
        message: `Let's explore ${area.area_name.toLowerCase()}. Here are some questions to get us started:

${enhancedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

What would you like to discuss first?`,
        timestamp: new Date(),
        question_suggestions: enhancedQuestions
      };

      const updatedConversation = [initialMessage];
      
      // Update the area with initial questions
      await MockStorageService.updateDiscoveryArea(area.id, { 
        conversation_data: updatedConversation,
        completion_percentage: 10 // Starting progress
      });

      // Update local state
      setActiveArea(prev => prev ? {
        ...prev,
        conversation_data: updatedConversation,
        completion_percentage: 10
      } : null);

      // Update areas list
      setDiscoveryAreas(prev => prev.map(a => 
        a.id === area.id 
          ? { ...a, conversation_data: updatedConversation, completion_percentage: 10 }
          : a
      ));
    } catch (error) {
      console.error('Error generating initial questions:', error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !activeArea || !session) return;

    const userMessage: ConversationMessage = {
      id: crypto.randomUUID(),
      sender: 'consultant',
      message: currentMessage.trim(),
      timestamp: new Date()
    };

    const updatedConversation = [...activeArea.conversation_data, userMessage];
    
    // Update UI immediately
    setActiveArea(prev => prev ? {
      ...prev,
      conversation_data: updatedConversation
    } : null);
    
    setCurrentMessage('');
    setIsGeneratingQuestions(true);

    try {
      // Generate AI response based on conversation context
      const aiResponse = await generateAIResponse(updatedConversation);
      
      const aiMessage: ConversationMessage = {
        id: crypto.randomUUID(),
        sender: 'gabi',
        message: aiResponse.message,
        timestamp: new Date(),
        question_suggestions: aiResponse.suggestions
      };

      const finalConversation = [...updatedConversation, aiMessage];
      const newProgress = calculateProgress(finalConversation);

      // Update database
      await MockStorageService.updateDiscoveryArea(activeArea.id, { 
        conversation_data: finalConversation,
        completion_percentage: newProgress
      });

      // Update UI
      setActiveArea(prev => prev ? {
        ...prev,
        conversation_data: finalConversation,
        completion_percentage: newProgress
      } : null);

      setDiscoveryAreas(prev => prev.map(a => 
        a.id === activeArea.id 
          ? { ...a, conversation_data: finalConversation, completion_percentage: newProgress }
          : a
      ));
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const generateAIResponse = async (conversation: ConversationMessage[]) => {
    // This would integrate with Claude API in production
    // For now, return contextual responses based on the area
    
    const lastUserMessage = conversation[conversation.length - 1]?.message || '';
    const areaName = activeArea?.area_name || '';
    
    // Simple response generation based on area and user input
    let response = '';
    let suggestions: string[] = [];

    if (areaName === 'Current Technology Stack') {
      response = "That's helpful context about your current setup. ";
      if (lastUserMessage.toLowerCase().includes('legacy')) {
        response += "Legacy systems often present interesting modernization opportunities. What specific challenges are you facing with the current architecture?";
        suggestions = [
          "What's your biggest pain point with the legacy system?",
          "How do you handle integrations with newer systems?",
          "What's your strategy for modernization?"
        ];
      } else {
        response += "Can you tell me more about any integration challenges or performance bottlenecks you're experiencing?";
        suggestions = [
          "What integration challenges do you face?",
          "How does the current system handle peak loads?",
          "What monitoring and alerting do you have in place?"
        ];
      }
    } else if (areaName === 'Pain Points & Challenges') {
      response = "I understand. Those types of challenges can really impact operations. ";
      response += "Can you help me understand the business impact? How often does this issue occur, and what's the typical resolution time?";
      suggestions = [
        "How often does this problem occur?",
        "What's the typical time to resolve it?",
        "Who gets involved when this happens?"
      ];
    } else {
      response = "Thanks for that information. ";
      response += "Can you elaborate on any specific details or give me an example of how this impacts your day-to-day operations?";
      suggestions = [
        "Can you give me a specific example?",
        "How does this impact your team?",
        "What would an ideal solution look like?"
      ];
    }

    return {
      message: response,
      suggestions
    };
  };

  const calculateProgress = (conversation: ConversationMessage[]): number => {
    const userMessages = conversation.filter(msg => msg.sender === 'consultant').length;
    const baseProgress = Math.min(userMessages * 15, 90);
    
    // Add bonus progress for detailed responses
    const hasDetailedResponse = conversation.some(msg => 
      msg.sender === 'consultant' && msg.message.length > 100
    );
    
    return hasDetailedResponse ? Math.min(baseProgress + 10, 100) : baseProgress;
  };

  const handleRegenerateQuestions = () => {
    if (activeArea) {
      generateInitialQuestions(activeArea);
    }
  };

  const overallProgress = discoveryAreas.length > 0 
    ? Math.round(discoveryAreas.reduce((sum, area) => sum + area.completion_percentage, 0) / discoveryAreas.length)
    : 0;

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
              <div className="text-sm text-text-secondary mb-1">Overall Progress</div>
              <div className="flex items-center space-x-3">
                <Progress value={overallProgress} className="w-32" />
                <span className="text-text-primary font-medium">{overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar - Discovery Areas */}
        <div className="w-80 border-r border-glass-border bg-glass-bg/30 flex-shrink-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Discovery Areas</h3>
            <div className="space-y-3">
              {discoveryAreas.map((area) => (
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
                    <span className="text-xs text-text-secondary">
                      {area.completion_percentage}%
                    </span>
                  </div>
                  <Progress value={area.completion_percentage} className="mb-2" />
                  <p className="text-xs text-text-muted">
                    {DISCOVERY_AREA_PROMPTS[area.area_name]?.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {activeArea ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-glass-border bg-glass-bg/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">
                      {activeArea.area_name}
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">
                      {DISCOVERY_AREA_PROMPTS[activeArea.area_name]?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-text-secondary">Progress</div>
                      <div className="text-lg font-semibold text-text-primary">
                        {activeArea.completion_percentage}%
                      </div>
                    </div>
                    <Button
                      onClick={handleRegenerateQuestions}
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingQuestions}
                    >
                      {isGeneratingQuestions ? 'Generating...' : 'New Questions'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {activeArea.conversation_data.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'consultant' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-lg ${
                          message.sender === 'consultant'
                            ? 'bg-sep-primary text-white'
                            : 'bg-glass-bg border border-glass-border text-text-primary'
                        }`}
                      >
                        <div className="text-sm mb-1">
                          {message.sender === 'consultant' ? 'You' : 'GABI'}
                        </div>
                        <div className="whitespace-pre-wrap">{message.message}</div>
                        {message.question_suggestions && message.question_suggestions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-glass-border/30">
                            <div className="text-xs text-text-muted mb-2">Suggested follow-ups:</div>
                            <div className="space-y-1">
                              {message.question_suggestions.map((suggestion, i) => (
                                <div key={i} className="text-xs text-text-secondary">
                                  • {suggestion}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isGeneratingQuestions && (
                    <div className="flex justify-start">
                      <div className="bg-glass-bg border border-glass-border text-text-primary max-w-[70%] p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sep-primary"></div>
                          <span className="text-sm">GABI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-glass-border p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex space-x-4">
                    <Textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder={`Type ${session?.contact_name}'s response about ${activeArea.area_name.toLowerCase()}...`}
                      className="flex-1 input-field min-h-[60px] max-h-[200px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isGeneratingQuestions}
                      className="btn-sep px-8"
                    >
                      Send
                    </Button>
                  </div>
                  <div className="text-xs text-text-muted mt-2">
                    Ctrl/Cmd + Enter to send
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-text-muted">
                Select a discovery area to begin the conversation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverySession;