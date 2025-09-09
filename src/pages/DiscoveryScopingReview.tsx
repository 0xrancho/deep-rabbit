import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScopingReviewComponent, { type ScopingReview } from '@/components/ScopingReview';
import { MockStorageService } from '@/lib/mockStorage';
import type { DiscoverySession } from '@/types/discovery';

const DiscoveryScopingReview = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<DiscoverySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;
    
    const sessionData = await MockStorageService.getSession(sessionId);
    if (!sessionData) {
      navigate('/discovery/setup');
      return;
    }
    
    setSession(sessionData);
    setIsLoading(false);
  };

  const handleComplete = async (scoping: ScopingReview) => {
    if (!sessionId || !session) return;
    
    setIsGenerating(true);
    
    try {
      // Save scoping review with session
      const scopingData = {
        sessionId,
        session,
        scoping,
        reviewedAt: new Date()
      };
      
      localStorage.setItem(`discovery_scoping_${sessionId}`, JSON.stringify(scopingData));
      
      // Navigate to report generation
      navigate(`/discovery/summary/${sessionId}`);
    } catch (error) {
      console.error('Error saving scoping review:', error);
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (sessionId) {
      navigate(`/discovery/session/${sessionId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sep-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary">Session not found</p>
          <button 
            onClick={() => navigate('/discovery/setup')}
            className="mt-4 text-sep-primary hover:underline"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <ScopingReviewComponent
      session={session}
      onComplete={handleComplete}
      onBack={handleBack}
      isGenerating={isGenerating}
    />
  );
};

export default DiscoveryScopingReview;