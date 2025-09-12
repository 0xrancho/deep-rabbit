import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/supabase-auth';
import { MockStorageService } from '@/lib/mockStorage';
import AppHeader from '@/components/AppHeader';

const DiscoverySetup = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
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
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      navigate('/auth');
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


  return (
    <div className="min-h-screen bg-black">
      <AppHeader 
        title="Launch New Discovery"
        user={user}
      />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Launch New Discovery
          </h2>
          <p className="text-text-secondary text-lg">
            Set up your new client discovery session for deep elicitation intelligence and reporting
          </p>
        </div>

        <Card className="glass-card p-8">
          <div className="space-y-6">
            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="accountName" className="text-text-primary font-medium">
                Account Name <span className="text-error">*</span>
              </Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                placeholder="e.g., Acme Corporation"
                className="input-field"
              />
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-text-primary font-medium">
                Client Name <span className="text-error">*</span>
              </Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder="e.g., Jane Doe"
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