import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import deepRabbitLogo from '@/assets/bunny-logo.png';
import orchestrationIcon from '@/assets/orchestration.png';
import enrichmentIcon from '@/assets/enrichment.png';
import extractionIcon from '@/assets/extraction.png';
import { conversationGenerator } from '@/services/conversationGenerator';
import { analyzeBusinessContext } from '@/services/websiteAnalyzer';
import { enhancedConversationGenerator } from '@/services/enhancedConversationGenerator';
import { saveWaitlistEntry, WaitlistRecord } from '@/lib/supabase';

const LandingDemo = () => {
  const [currentStage, setCurrentStage] = useState<'input' | 'loading' | 'results' | 'interactive'>('input');
  const [formData, setFormData] = useState({
    yourCompanyUrl: '',
    prospectUrl: ''
  });
  const [loadingMessage, setLoadingMessage] = useState('Analyzing client needs...');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({
    name: '',
    email: '',
    companyUrl: ''
  });
  const [prospectInput, setProspectInput] = useState('');
  const [conversation, setConversation] = useState<any[]>([]);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [businessContext, setBusinessContext] = useState<any>(null);
  const [results, setResults] = useState({
    service: '',
    clientName: '',
    clientType: '',
    painPoint: '',
    questions: {
      currentState: '',
      painDiscovery: '',
      futureState: '',
      constraints: '',
      decision: ''
    }
  });

  const loadingMessages = [
    'Analyzing your company website...',
    'Extracting prospect information...',
    'Generating business case...',
    'Creating conversation context...'
  ];

  const handleAnalyze = async () => {
    if (!formData.yourCompanyUrl.trim() || !formData.prospectUrl.trim()) return;

    // Automatically add https:// if not present
    let processedYourCompanyUrl = formData.yourCompanyUrl.trim();
    if (!processedYourCompanyUrl.match(/^https?:\/\//)) {
      processedYourCompanyUrl = `https://${processedYourCompanyUrl}`;
    }

    let processedProspectUrl = formData.prospectUrl.trim();
    if (!processedProspectUrl.match(/^https?:\/\//)) {
      processedProspectUrl = `https://${processedProspectUrl}`;
    }

    setCurrentStage('loading');
    
    // Cycle through loading messages
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 1500);

    try {
      // Step 1: Analyze business context from both websites
      const businessContext = await analyzeBusinessContext(processedYourCompanyUrl, processedProspectUrl);
      setBusinessContext(businessContext);
      
      // Step 2: Generate conversation based on business context
      const conversation = await enhancedConversationGenerator.generateConversation({
        businessContext
      });
      
      clearInterval(messageInterval);
      
      // Use extracted company names
      const clientName = businessContext.prospect.name;
      
      // Store conversation data for results display
      setResults({
        service: businessContext.businessCase,
        clientName: clientName,
        clientType: businessContext.prospect.industry,
        painPoint: conversation.metadata?.keyPainPoint || 'operational challenges',
        questions: {
          currentState: conversation.deepRabbitQuestion1,
          painDiscovery: conversation.userResponse,
          futureState: conversation.deepRabbitQuestion2,
          constraints: conversation.preHistoryContext,
          decision: ''
        }
      });
      
      // Store the full conversation for the results display
      (window as any).generatedConversation = conversation;
      
      // Set up initial conversation for interactive mode
      const initialConversation = [
        { role: 'context', content: conversation.preHistoryContext },
        { role: 'deeprabbit', content: conversation.deepRabbitQuestion1 },
        { role: 'prospect', content: conversation.userResponse },
        { role: 'deeprabbit', content: conversation.deepRabbitQuestion2 }
      ];
      console.log('Setting up initial conversation:', initialConversation);
      setConversation(initialConversation);
      
      setCurrentStage('interactive');
    } catch (error) {
      console.error('Error generating conversation:', error);
      clearInterval(messageInterval);
      
      // Show error message to user
      alert('Unable to analyze the provided websites. Please ensure both URLs are accessible and try again.');
      
      // Reset to input stage
      setCurrentStage('input');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetDemo = () => {
    setCurrentStage('input');
    setFormData({ yourCompanyUrl: '', prospectUrl: '' });
    setProspectInput('');
    setConversation([]);
    setIsGeneratingFollowUp(false);
    setShowAnimation(false);
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatically add https:// if not present
    let processedUrl = waitlistForm.companyUrl.trim();
    if (processedUrl && !processedUrl.match(/^https?:\/\//)) {
      processedUrl = `https://${processedUrl}`;
    }
    
    try {
      const waitlistEntry: WaitlistRecord = {
        name: waitlistForm.name.trim(),
        email: waitlistForm.email.trim(),
        company_url: processedUrl
      };
      
      const result = await saveWaitlistEntry(waitlistEntry);
      console.log('Waitlist entry saved:', result);
      
      setIsWaitlistOpen(false);
      setWaitlistForm({ name: '', email: '', companyUrl: '' });
      alert('Thanks! We\'ll be in touch soon.');
    } catch (error) {
      console.error('Error saving waitlist entry:', error);
      alert('Sorry, there was an error. Please try again.');
    }
  };

  const handleWaitlistInputChange = (field: string, value: string) => {
    setWaitlistForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProspectResponse = async () => {
    if (!prospectInput.trim() || isGeneratingFollowUp) return;

    // Add prospect's new response to conversation
    const newConversation = [...conversation, { role: 'prospect', content: prospectInput }];
    setConversation(newConversation);
    setIsGeneratingFollowUp(true);
    setProspectInput('');

    try {
      // Generate DeepRabbit's dynamic follow-up using enhanced generator
      const response = await enhancedConversationGenerator.generateFollowUp(
        newConversation,
        businessContext
      );

      // Add DeepRabbit's follow-up to conversation
      console.log('DeepRabbit response received:', response.followUpQuestion);
      setConversation(prev => {
        const newConv = [...prev, { role: 'deeprabbit', content: response.followUpQuestion }];
        console.log('Updated conversation:', newConv);
        return newConv;
      });
      
      // Show animation and disable further input
      setShowAnimation(true);
      setIsGeneratingFollowUp(false);
    } catch (error) {
      console.error('Error generating follow-up:', error);
      setIsGeneratingFollowUp(false);
      
      // Fallback response
      const fallbackResponse = "That's really insightful. Based on what you've shared, I can see there are some complex dynamics at play here that would benefit from a more detailed discovery session.";
      console.log('Using fallback response:', fallbackResponse);
      setConversation(prev => {
        const newConv = [...prev, { role: 'deeprabbit', content: fallbackResponse }];
        console.log('Updated conversation with fallback:', newConv);
        return newConv;
      });
      setShowAnimation(true);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Navigation */}
      <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <img 
                src={deepRabbitLogo} 
                alt="DeepRabbit Logo" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
              <h1 className="text-xl md:text-2xl font-bold text-white">DeepRabbit</h1>
              <span className="text-xs md:text-sm px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: '#8B5CF6', color: 'white' }}>
                COMING SOON
              </span>
            </div>
            
            {/* Hamburger Menu */}
            <div className="relative">
              <button 
                className="flex flex-col justify-center items-center w-6 md:w-7 h-5 md:h-6 cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="w-6 md:w-7 h-0.5 bg-white mb-1.5"></div>
                <div className="w-6 md:w-7 h-0.5 bg-white"></div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-8 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Products */}
                  <div className="relative">
                    <div 
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                      onClick={() => setIsProductsOpen(!isProductsOpen)}
                    >
                      <span className="text-gray-800 font-medium">Products</span>
                      <svg 
                        className={`w-4 h-4 text-gray-600 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {isProductsOpen && (
                      <div className="bg-gray-50 border-t border-gray-100">
                        <div 
                          className="px-6 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-600 relative group"
                          title="Coming Soon"
                        >
                          Consultant-led Discovery
                          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Coming Soon
                          </span>
                        </div>
                        <div 
                          className="px-6 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-600 relative group"
                          title="Coming Soon"
                        >
                          Client-led Assessments
                          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Coming Soon
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Pricing */}
                  <div 
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800"
                    onClick={() => {
                      setIsMenuOpen(false);
                      alert('Coming soon!');
                    }}
                  >
                    Pricing
                  </div>
                  
                  {/* GitHub */}
                  <div 
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800 flex items-center gap-2"
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.open('https://github.com/0xrancho/SEP-ASSESS', '_blank');
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
                    </svg>
                    GitHub
                  </div>
                  
                  {/* Sign Up */}
                  <div 
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-800 font-medium"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsWaitlistOpen(true);
                    }}
                  >
                    Sign Up
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
          Turn any employee into a <span style={{ color: '#6fed82' }}>client engagement</span> expert
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-8 md:mb-12" style={{ fontFamily: 'Inter, sans-serif' }}>
          AI-powered Elicitation Intelligence for B2B Professional Services
        </p>

        {/* Demo Container */}
        <Card className="text-black p-4 md:p-8 max-w-3xl mx-auto" style={{ backgroundColor: '#fffef2' }}>
          {/* Input Stage */}
          {currentStage === 'input' && (
            <div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Your Company Website</label>
                  <Input
                    value={formData.yourCompanyUrl}
                    onChange={(e) => handleInputChange('yourCompanyUrl', e.target.value)}
                    placeholder="accenture.com"
                    className="text-sm md:text-lg p-3 md:p-4 border-2 text-white bg-black border-gray-600 placeholder-gray-400"
                    style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                    onKeyPress={(e) => e.key === 'Enter' && document.getElementById('prospectUrl')?.focus()}
                  />
                </div>
                
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Prospect's Website</label>
                  <Input
                    id="prospectUrl"
                    value={formData.prospectUrl}
                    onChange={(e) => handleInputChange('prospectUrl', e.target.value)}
                    placeholder="nike.com"
                    className="text-sm md:text-lg p-3 md:p-4 border-2 text-white bg-black border-gray-600 placeholder-gray-400"
                    style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={!formData.yourCompanyUrl.trim() || !formData.prospectUrl.trim()}
                  className="px-6 md:px-8 py-3 md:py-4 text-xl md:text-2xl hover:opacity-80"
                  style={{ backgroundColor: '#8B5CF6' }}
                >
                  ⟶
                </Button>
              </div>
            </div>
          )}

          {/* Loading Stage */}
          {currentStage === 'loading' && (
            <div className="py-12 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-gray-700">{loadingMessage}</p>
            </div>
          )}

          {/* Results Stage */}
          {currentStage === 'results' && (() => {
            const conversation = (window as any).generatedConversation || {
              preHistoryContext: results.questions.constraints || "Inquiring about ITAR compliance solution for international presales systems",
              deepRabbitQuestion1: results.questions.currentState || "Given your international operations, how does your current system handle data residency requirements across different jurisdictions?",
              userResponse: results.questions.painDiscovery || "We segment by region but struggle with real-time compliance monitoring. EU data stays in Frankfurt, but we lack visibility into cross-border data flows during integrations.",
              deepRabbitQuestion2: results.questions.futureState || "When integration workflows inadvertently move EU data outside Frankfurt, what's your current process for detection and remediation - and how long does that typically take?"
            };
            
            return (
              <div className="flex gap-6">
                {/* Conversation Flow */}
                <div className="flex-1">
                  {/* Business Context Display */}
                  {businessContext && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 text-sm">
                      <div className="text-green-800 font-semibold mb-2">🎯 Business Context Identified:</div>
                      <div className="text-green-700 space-y-1">
                        <div><strong>Your Company:</strong> {businessContext.yourCompany.name} ({businessContext.yourCompany.subIndustry})</div>
                        <div><strong>Prospect:</strong> {businessContext.prospect.name} ({businessContext.prospect.industry})</div>
                        <div><strong>Business Case:</strong> {businessContext.businessCase}</div>
                        <div><strong>Catalyst:</strong> {businessContext.catalyst}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-sm">
                    <strong className="text-blue-800">Context:</strong> {conversation.preHistoryContext}
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 mb-6">
                    {/* DeepRabbit Question */}
                    <div className="flex justify-start">
                      <div className="max-w-full px-4 py-3 rounded-lg" style={{ backgroundColor: '#6fed82', color: '#000' }}>
                        <div className="text-xs font-semibold mb-1 text-left">DeepRabbit:</div>
                        <p className="text-left" style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem' }}>
                          {conversation.deepRabbitQuestion1}
                        </p>
                      </div>
                    </div>

                    {/* Prospect Response */}
                    <div className="flex justify-start">
                      <div className="max-w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-800">
                        <div className="text-xs font-semibold mb-1 text-left">Prospect:</div>
                        <p className="text-left" style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem' }}>
                          {conversation.userResponse}
                        </p>
                      </div>
                    </div>

                    {/* DeepRabbit Refined Question */}
                    <div className="flex justify-start">
                      <div className="max-w-full px-4 py-3 rounded-lg" style={{ backgroundColor: '#6fed82', color: '#000' }}>
                        <div className="text-xs font-semibold mb-1 text-left">DeepRabbit:</div>
                        <p className="text-left" style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem' }}>
                          {conversation.deepRabbitQuestion2}
                        </p>
                      </div>
                    </div>
                  </div>

                <div className="text-center py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-4">✨ Each answer deepens the next question</p>
                  
                  <div className="bg-black text-white p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Ready to see how deep the rabbit goes?</h3>
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-2 mb-2"
                      onClick={() => setIsWaitlistOpen(true)}
                    >
                      Join the Waitlist
                    </Button>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Button 
                    onClick={resetDemo}
                    variant="outline"
                    className="text-gray-300 border-gray-300 hover:bg-gray-50 hover:text-gray-600 text-sm"
                  >
                    Try Another Example
                  </Button>
                </div>
              </div>

              {/* Progress Sidebar */}
              <div className="w-56 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Discovery Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-xs text-gray-700">Pre-knowledge Context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-xs text-gray-700">Current State Assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Pain Points & Challenges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Desired Future State</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Constraints & Requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Decision Process & Timeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Budget & Resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Success Metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Stakeholders & Politics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Report Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Enrich CRM</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })()}

          {/* Interactive Stage */}
          {currentStage === 'interactive' && (
            <div className="flex gap-6">
              {/* Conversation Flow */}
              <div className="flex-1">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 text-sm">
                  <strong className="text-blue-800">Context:</strong> {conversation.find(msg => msg.role === 'context')?.content}
                </div>

                {/* Chat Messages */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {conversation.filter(msg => msg.role !== 'context').map((message, index) => (
                    <div key={index} className="flex justify-start">
                      <div className={`max-w-full px-4 py-3 rounded-lg ${
                        message.role === 'deeprabbit' 
                          ? 'text-black' 
                          : 'bg-gray-100 text-gray-800'
                      }`} style={message.role === 'deeprabbit' ? { backgroundColor: '#6fed82' } : {}}>
                        <div className="text-xs font-semibold mb-1 text-left">
                          {message.role === 'deeprabbit' ? 'DeepRabbit:' : 'Prospect:'}
                        </div>
                        <p className="text-left" style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem' }}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isGeneratingFollowUp && (
                    <div className="flex justify-start">
                      <div className="max-w-full px-4 py-3 rounded-lg" style={{ backgroundColor: '#6fed82', color: '#000' }}>
                        <div className="text-xs font-semibold mb-1 text-left">DeepRabbit:</div>
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                          <span className="text-xs">Analyzing your response...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Input Area */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    <Input
                      value={prospectInput}
                      onChange={(e) => setProspectInput(e.target.value)}
                      placeholder="Type your response as the prospect..."
                      className={`flex-1 text-sm p-3 border-2 text-gray-800 bg-white border-gray-300 ${showAnimation ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                      onKeyPress={(e) => e.key === 'Enter' && handleProspectResponse()}
                      disabled={isGeneratingFollowUp || showAnimation}
                    />
                    <Button
                      onClick={handleProspectResponse}
                      disabled={!prospectInput.trim() || isGeneratingFollowUp || showAnimation}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Send
                    </Button>
                  </div>
                  {!showAnimation && (
                    <p className="text-xs text-gray-500 mt-2">
                      ✨ Watch DeepRabbit dynamically respond to your input with an intelligent follow-up question
                    </p>
                  )}
                </div>

                {/* Join Waitlist CTA - Always visible */}
                <div className="text-center py-4 border-t border-gray-200">
                  {showAnimation && (
                    <p className="text-sm text-gray-600 mb-4">✨ DeepRabbit dynamically adapts to every response</p>
                  )}
                  
                  <div className="bg-black text-white p-4 rounded-lg relative overflow-hidden">
                    {/* Pixelated Flame Animation - Only appears after interaction */}
                    {showAnimation && (
                      <div className="absolute inset-0 opacity-30">
                        <div className="flame-pixel flame-1"></div>
                        <div className="flame-pixel flame-2"></div>
                        <div className="flame-pixel flame-3"></div>
                        <div className="flame-pixel flame-4"></div>
                        <div className="flame-pixel flame-5"></div>
                      </div>
                    )}
                    
                    <h3 className="text-lg font-semibold mb-3 relative z-10">Ready to see how deep the rabbit goes?</h3>
                    <Button 
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-2 mb-2 relative z-10"
                      onClick={() => setIsWaitlistOpen(true)}
                    >
                      Join the Waitlist
                    </Button>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Button 
                    onClick={resetDemo}
                    variant="outline"
                    className="text-gray-300 border-gray-300 hover:bg-gray-50 hover:text-gray-600 text-sm"
                  >
                    Try Another Example
                  </Button>
                </div>
              </div>

              {/* Progress Sidebar */}
              <div className="w-56 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Discovery Progress</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-xs text-gray-700">Pre-knowledge Context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-xs text-gray-700">Current State Assessment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Pain Points & Challenges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Desired Future State</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Constraints & Requirements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Decision Process & Timeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Budget & Resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Success Metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Stakeholders & Politics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Report Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    <span className="text-xs text-gray-400">Enrich CRM</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* How It Works Section */}
        <div className="how-it-works-section mt-16 mb-12 max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-14">
            What happens under the hood
          </h3>
          
          {/* Simple 3-panel illustration */}
          <div className="process-panels grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div className="panel text-center p-7 bg-glass-bg/30 border border-glass-border/30 rounded-xl backdrop-blur-sm">
              <div className="icon mb-5">
                <img src={orchestrationIcon} alt="Intelligent Orchestration" className="w-29 h-29 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">Intelligent Orchestration</h4>
              <p className="text-text-secondary text-base leading-relaxed">
                8 elicitation areas with context-aware progression tracking
              </p>
            </div>
            
            <div className="panel text-center p-7 bg-glass-bg/30 border border-glass-border/30 rounded-xl backdrop-blur-sm">
              <div className="icon mb-5">
                <img src={enrichmentIcon} alt="Real-time Enrichment" className="w-29 h-29 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">Real-time Enrichment</h4>
              <p className="text-text-secondary text-base leading-relaxed">
                Search, scrape, and validate answers as they emerge
              </p>
            </div>
            
            <div className="panel text-center p-7 bg-glass-bg/30 border border-glass-border/30 rounded-xl backdrop-blur-sm">
              <div className="icon mb-5">
                <img src={extractionIcon} alt="Structured Extraction" className="w-29 h-29 mx-auto" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-4">Structured Extraction</h4>
              <p className="text-text-secondary text-base leading-relaxed">
                Export to CRM via API • Full audit trail • Summary reports
              </p>
            </div>
          </div>
          
          <p className="coming-soon-note text-center text-text-muted text-sm">
            v1.0: Consultant-led Discovery (Fall 2025)<br/>
            v1.2: Client-led Assessments (Spring 2026)
          </p>
        </div>

        {/* Trust Markers */}
        <div className="trust-markers flex flex-wrap justify-center gap-6 mb-12 max-w-3xl mx-auto">
          <span className="flex items-center gap-2 text-text-secondary text-sm bg-glass-bg/20 px-4 py-2 rounded-full border border-glass-border/20">
            🔒 SOC2 Compliant
          </span>
          <span className="flex items-center gap-2 text-text-secondary text-sm bg-glass-bg/20 px-4 py-2 rounded-full border border-glass-border/20">
            🔐 Your data never trains our models
          </span>
          <span className="flex items-center gap-2 text-text-secondary text-sm bg-glass-bg/20 px-4 py-2 rounded-full border border-glass-border/20">
            🌐 API-first architecture
          </span>
        </div>

        {/* Waitlist Section */}
        {currentStage === 'input' && (
          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-4">or</p>
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-black px-8 py-3"
              onClick={() => setIsWaitlistOpen(true)}
            >
              Join the Waitlist 🚀
            </Button>
          </div>
        )}
      </div>

      {/* Waitlist Modal */}
      {isWaitlistOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Join the Waitlist</h3>
              <button 
                onClick={() => setIsWaitlistOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  type="text"
                  value={waitlistForm.name}
                  onChange={(e) => handleWaitlistInputChange('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={waitlistForm.email}
                  onChange={(e) => handleWaitlistInputChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Company URL</label>
                <Input
                  type="text"
                  value={waitlistForm.companyUrl}
                  onChange={(e) => handleWaitlistInputChange('companyUrl', e.target.value)}
                  placeholder="example.com"
                  className="w-full p-3 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                We'll pre-configure your account and get back to you soon!
              </p>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3"
              >
                Reserve My Spot →
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default LandingDemo;