import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { MockAuthService } from '@/lib/mockAuth';
import { MockStorageService, mockSupabaseDB } from '@/lib/mockStorage';
import { User } from '@/types/discovery';

const DiscoverySetup = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    accountName: '',
    contactName: '',
    contactRole: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Use mock auth service for development
      const userData = MockAuthService.getCurrentUser();
      
      if (!userData) {
        // For development, auto-create a session with first user
        const defaultUser = MockAuthService.getAllUsers()[0];
        MockAuthService.setCurrentUser(defaultUser);
        setUser(defaultUser);
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error:', error);
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
    if (!formData.accountName || !formData.contactName || !user) return;

    try {
      // Use mock storage service for development
      const session = await MockStorageService.createSession({
        account_name: formData.accountName,
        contact_name: formData.contactName,
        contact_role: formData.contactRole,
        consultant_id: user.id,
        client_icp: 'Aerospace/Defense', // Will be updated on next page
        business_area: '',
        discovery_context: '',
        solution_scope: 'Software consultation ($10K-$50K)',
        next_step_goal: 'Technical deep-dive meeting'
      });

      console.log('Created session:', session);

      // Navigate to ICP selection with session ID
      navigate(`/discovery/icp/${session.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const isFormValid = formData.accountName && formData.contactName;

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

  const switchUser = (userId: string) => {
    const newUser = MockAuthService.switchUser(userId);
    if (newUser) {
      setUser(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Developer Toolbar */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-sep-accent text-white px-6 py-2 text-sm">
          <div className="flex items-center space-x-4">
            <span>Dev Mode - Switch User:</span>
            {MockAuthService.getAllUsers().map(u => (
              <button 
                key={u.id} 
                onClick={() => switchUser(u.id)}
                className={`px-2 py-1 rounded ${user?.id === u.id ? 'bg-white text-sep-accent' : 'hover:bg-white/20'}`}
              >
                {u.name} ({u.role})
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold sep-text">Discovery Wizard</h1>
            {user && (
              <div className="flex items-center space-x-4 text-sm text-text-secondary">
                <span>{user.name}</span>
                <span>•</span>
                <span>{user.role}</span>
                <span>•</span>
                <span>{user.organization?.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Start New Discovery Session
          </h2>
          <p className="text-text-secondary text-lg">
            Set up your client discovery session to begin intelligent prospect qualification
          </p>
        </div>

        <Card className="glass-card p-8">
          <div className="space-y-6">
            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-text-primary font-medium">
                Account <span className="text-error">*</span>
              </Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                placeholder="e.g., Acme Corporation"
                className="input-field"
              />
            </div>

            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-text-primary font-medium">
                Contact Name <span className="text-error">*</span>
              </Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="e.g., John Smith"
                className="input-field"
              />
            </div>

            {/* Contact Role */}
            <div className="space-y-2">
              <Label htmlFor="contactRole" className="text-text-primary font-medium">
                Role
              </Label>
              <Input
                id="contactRole"
                value={formData.contactRole}
                onChange={(e) => handleInputChange('contactRole', e.target.value)}
                placeholder="e.g., CTO, VP Engineering"
                className="input-field"
              />
            </div>

            {/* Consultant Info - Read Only */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-text-primary font-medium">
                  Consultant
                </Label>
                <Input
                  value={user?.name || ''}
                  readOnly
                  className="input-field bg-glass-bg/50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-text-primary font-medium">
                  Consultant Role
                </Label>
                <Input
                  value={user?.role || ''}
                  readOnly
                  className="input-field bg-glass-bg/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-6">
              <Button
                onClick={handleNext}
                disabled={!isFormValid}
                className="btn-sep w-full py-4 text-lg font-semibold"
              >
                Continue to Client Profile
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-text-muted text-sm">
            This information will be used to personalize the discovery experience and 
            generate contextual questions for your prospect
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiscoverySetup;