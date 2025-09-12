import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { MockStorageService } from '@/lib/mockStorage';
import { ClientICP, ICP_CONFIGS, DiscoverySession } from '@/types/discovery';
import { getUserCustomICPs } from '@/lib/business-intelligence';
import { getCurrentUser } from '@/lib/supabase-auth';
import AppHeader from '@/components/AppHeader';
import { Target, Users, Building, Zap } from 'lucide-react';

// Helper function to get appropriate icon for custom ICPs
const getICPIcon = (name: string) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('enterprise') || nameLower.includes('corporate')) return <Building className="w-12 h-12 text-sep-primary" />;
  if (nameLower.includes('technology') || nameLower.includes('tech') || nameLower.includes('software')) return <Zap className="w-12 h-12 text-sep-primary" />;
  if (nameLower.includes('healthcare') || nameLower.includes('medical') || nameLower.includes('health')) return <Target className="w-12 h-12 text-sep-primary" />;
  if (nameLower.includes('consulting') || nameLower.includes('service')) return <Users className="w-12 h-12 text-sep-primary" />;
  return <Target className="w-12 h-12 text-sep-primary" />;
};

const DiscoveryICP = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [selectedICP, setSelectedICP] = useState<any>(null);
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [customICPs, setCustomICPs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadSessionAndICPs();
    }
  }, [sessionId]);

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

  const loadSessionAndICPs = async () => {
    try {
      if (!sessionId) {
        navigate('/discovery/setup');
        return;
      }

      // Load session
      const sessionData = await MockStorageService.getSession(sessionId);
      if (!sessionData) {
        navigate('/discovery/setup');
        return;
      }
      setSession(sessionData);

      // Load custom ICPs
      const icps = await getUserCustomICPs();
      if (icps.length > 0) {
        setCustomICPs(icps);
        
        // If session has a custom ICP selected, find and set it
        if (sessionData.custom_icp_id) {
          const selectedCustomICP = icps.find(icp => icp.id === sessionData.custom_icp_id);
          if (selectedCustomICP) {
            setSelectedICP(selectedCustomICP);
          }
        }
      } else {
        // Fallback to hardcoded ICPs if no custom ICPs
        setCustomICPs([]);
        if (sessionData.client_icp) {
          setSelectedICP(sessionData.client_icp as ClientICP);
        }
      }
    } catch (error) {
      console.error('Error loading session and ICPs:', error);
      navigate('/discovery/setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleICPSelect = (icp: any) => {
    setSelectedICP(icp);
  };

  const handleNext = async () => {
    if (!selectedICP || !sessionId) return;

    try {
      // Update the session with selected ICP
      const updateData = customICPs.length > 0 
        ? { custom_icp_id: selectedICP.id, business_context: { selected_icp: selectedICP } }
        : { client_icp: selectedICP };

      const updatedSession = await MockStorageService.updateSession(sessionId, updateData);

      if (!updatedSession) {
        console.error('Error updating session');
        return;
      }

      console.log('Updated session with ICP:', selectedICP);

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
      <AppHeader 
        title={session ? `${session.account_name} - ${session.contact_name}` : "Client Profile"}
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
            {customICPs.length > 0 ? 'Select Discovery Profile' : 'Select Client Industry'}
          </h2>
          <p className="text-text-secondary text-lg">
            {customICPs.length > 0 
              ? `Choose the best discovery profile for ${session?.contact_name}'s business`
              : `Choose ${session?.contact_name}'s primary industry to customize the discovery experience`
            }
          </p>
        </div>

        {/* Custom ICPs Grid */}
        {customICPs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {customICPs.map((icp) => {
              const isSelected = selectedICP && selectedICP.id === icp.id;
              const icon = getICPIcon(icp.name);
              
              return (
                <Card
                  key={icp.id}
                  className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected 
                      ? 'border-2 border-sep-primary sep-glow' 
                      : 'border border-glass-border hover:border-sep-secondary/50'
                  }`}
                  onClick={() => handleICPSelect(icp)}
                >
                  <div className="text-center">
                    {/* Icon */}
                    <div className="text-4xl mb-4">{icon}</div>
                    
                    {/* Title */}
                    <h3 className={`text-lg font-bold mb-3 ${
                      isSelected ? 'sep-text' : 'text-text-primary'
                    }`}>
                      {icp.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                      {icp.description}
                    </p>
                    
                    {/* Industries */}
                    <div className="flex flex-wrap gap-1 justify-center">
                      {icp.target_industries.slice(0, 3).map((industry: string) => (
                        <span 
                          key={industry}
                          className="px-2 py-1 text-xs bg-glass-bg border border-glass-border rounded text-text-muted"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          // Fallback to hardcoded ICPs
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
        )}

        {/* Selected ICP Details */}
        {selectedICP && (
          <Card className="glass-card p-6 mb-8">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold sep-text mb-2">
                {customICPs.length > 0 ? selectedICP.name : ICP_CONFIGS[selectedICP].label} Discovery Focus
              </h3>
              <p className="text-text-secondary">
                Example questions DeepRabbit will ask based on this profile selection
              </p>
            </div>
            
            {customICPs.length > 0 && selectedICP.sample_questions ? (
              // Custom ICP questions
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedICP.sample_questions.slice(0, 6).map((question: string, index: number) => (
                  <div key={index} className="bg-glass-bg/50 p-4 rounded-lg">
                    <div className="text-xs text-sep-secondary uppercase font-medium mb-2 tracking-wide">
                      Discovery Question {index + 1}
                    </div>
                    <p className="text-text-primary text-sm leading-relaxed">
                      "{question}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              // Fallback to hardcoded questions
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
            )}

            {/* Additional ICP Details for Custom ICPs */}
            {customICPs.length > 0 && selectedICP.target_roles && (
              <div className="mt-6 pt-6 border-t border-glass-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Target Roles</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedICP.target_roles.slice(0, 3).map((role: string, index: number) => (
                        <span key={index} className="px-2 py-1 text-xs bg-sep-primary/10 text-sep-primary rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Company Size</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedICP.target_company_size.map((size: string, index: number) => (
                        <span key={index} className="px-2 py-1 text-xs bg-glass-highlight text-text-secondary rounded">
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedICP.discovery_focus_areas.slice(0, 3).map((area: string, index: number) => (
                        <span key={index} className="px-2 py-1 text-xs bg-user-accent/10 text-user-accent rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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