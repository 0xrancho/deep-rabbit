import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { ClientICP, ICP_CONFIGS, DiscoverySession } from '@/types/discovery';

const DiscoveryICP = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [selectedICP, setSelectedICP] = useState<ClientICP | null>(null);
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const { data: sessionData, error } = await supabase
        .from('discovery_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !sessionData) {
        navigate('/discovery/setup');
        return;
      }

      setSession(sessionData);
      if (sessionData.client_icp) {
        setSelectedICP(sessionData.client_icp as ClientICP);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      navigate('/discovery/setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleICPSelect = (icp: ClientICP) => {
    setSelectedICP(icp);
  };

  const handleNext = async () => {
    if (!selectedICP || !sessionId) return;

    try {
      // Update the session with selected ICP
      const { error } = await supabase
        .from('discovery_sessions')
        .update({ client_icp: selectedICP })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session:', error);
        return;
      }

      // Navigate to context page
      navigate(`/discovery/context/${sessionId}`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleBack = () => {
    navigate('/discovery/setup');
  };

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold sep-text">SEP Discovery Wizard</h1>
            {session && (
              <div className="text-sm text-text-secondary">
                {session.account_name} • {session.contact_name}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">✓</span>
            </div>
            <span className="text-success text-sm font-medium">Setup</span>
          </div>
          <div className="flex-1 h-0.5 bg-glass-border"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sep-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">2</span>
            </div>
            <span className="text-sep-primary text-sm font-medium">Client Profile</span>
          </div>
          <div className="flex-1 h-0.5 bg-glass-border"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-glass-bg border-2 border-glass-border rounded-full flex items-center justify-center">
              <span className="text-text-muted text-sm font-medium">3</span>
            </div>
            <span className="text-text-muted text-sm font-medium">Context & Scope</span>
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
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Select Client Industry
          </h2>
          <p className="text-text-secondary text-lg">
            Choose {session?.contact_name}'s primary industry to customize the discovery experience
          </p>
        </div>

        {/* ICP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(ICP_CONFIGS).map(([key, config]) => {
            const icp = key as ClientICP;
            const isSelected = selectedICP === icp;
            
            return (
              <Card
                key={icp}
                className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isSelected 
                    ? 'border-2 border-sep-primary sep-glow' 
                    : 'border border-glass-border hover:border-sep-secondary/50'
                }`}
                onClick={() => handleICPSelect(icp)}
              >
                <div className="text-center">
                  {/* Icon */}
                  <div className="text-4xl mb-4">{config.icon}</div>
                  
                  {/* Title */}
                  <h3 className={`text-lg font-bold mb-3 ${
                    isSelected ? 'sep-text' : 'text-text-primary'
                  }`}>
                    {config.label}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {config.description}
                  </p>
                  
                  {/* Keywords */}
                  <div className="mt-4 flex flex-wrap gap-1 justify-center">
                    {config.keywords.slice(0, 3).map((keyword) => (
                      <span 
                        key={keyword}
                        className="px-2 py-1 text-xs bg-glass-bg border border-glass-border rounded text-text-muted"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected ICP Details */}
        {selectedICP && (
          <Card className="glass-card p-6 mb-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold sep-text mb-2">
                {ICP_CONFIGS[selectedICP].label} Discovery Focus
              </h3>
              <p className="text-text-secondary">
                Example questions GABI will ask based on this industry selection
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(ICP_CONFIGS[selectedICP].questions).map(([category, question]) => (
                <div key={category} className="bg-glass-bg/50 p-4 rounded-lg">
                  <div className="text-xs text-sep-secondary uppercase font-medium mb-2 tracking-wide">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <p className="text-text-primary text-sm leading-relaxed">
                    "{question}"
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            className="px-8 py-3"
          >
            ← Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!selectedICP}
            className="btn-sep px-8 py-3"
          >
            Continue to Context
            <span className="ml-2">→</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryICP;