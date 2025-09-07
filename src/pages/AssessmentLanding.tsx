import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, CheckCircle, Shield, Activity } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { saveAssessment, trackAnalyticsEvent, type AssessmentRecord } from "@/lib/supabase";

const AssessmentLanding = () => {
  
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    subscribeUpdates: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Generate session ID and create assessment record
      const sessionId = uuidv4();
      const assessmentRecord: AssessmentRecord = {
        session_id: sessionId,
        email: formData.email,
        company: formData.company,
        full_name: formData.fullName,
        subscribe_updates: formData.subscribeUpdates,
        status: 'in_progress',
        current_step: 1,
        started_at: new Date().toISOString(),
      };

      // Save to Supabase (with localStorage fallback)
      await saveAssessment(assessmentRecord);

      // Track analytics event
      await trackAnalyticsEvent({
        session_id: sessionId,
        event_type: 'assessment_started',
        event_data: {
          company: formData.company,
          business_email: formData.email,
          source: 'landing_page'
        }
      });

      // Store in localStorage for session persistence (keeping existing behavior)
      const localData = {
        sessionId,
        ...formData,
        startedAt: new Date().toISOString(),
      };
      localStorage.setItem('assessment_session', JSON.stringify(localData));
      
      // Navigate to first step
      setTimeout(() => {
        window.location.href = '/assessment/step';
      }, 1500);

    } catch (error) {
      console.error('Failed to start assessment:', error);
      
      // Fallback: continue with localStorage only
      const sessionId = uuidv4();
      const localData = {
        sessionId,
        ...formData,
        startedAt: new Date().toISOString(),
      };
      localStorage.setItem('assessment_session', JSON.stringify(localData));
      
      setTimeout(() => {
        window.location.href = '/assessment/step';
      }, 1500);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isFormValid = formData.fullName && formData.company && formData.email;

  return (
    <div className="min-h-screen bg-background relative">
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-16">
            {/* Professional Header */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-gabi-pink" />
                <h1 className="text-5xl font-bold text-text-primary">
                  AI Readiness Assessment
                </h1>
              </div>
              <p className="text-lg text-text-secondary">
                Powered by GABI Intelligence
              </p>
            </div>

            <div className="mb-12">
              <p className="text-xl text-text-primary font-medium mb-2">
                Structured AI Readiness Evaluation
              </p>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                A comprehensive analysis of your organization's AI transformation potential
              </p>
            </div>

            {/* Professional trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-2 text-text-secondary">
                <Shield className="w-5 h-5 text-gabi-pink" />
                <span>Confidential Assessment</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Activity className="w-5 h-5 text-gabi-pink" />
                <span>Structured Methodology</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <CheckCircle className="w-5 h-5 text-gabi-pink" />
                <span>Professional Analysis</span>
              </div>
            </div>
          </div>

          {/* Professional Entry Form */}
          <Card className="max-w-md mx-auto border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-text-primary font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="bg-input border-border/50 focus:border-gabi-pink focus:ring-1 focus:ring-gabi-pink/20 transition-colors"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="text-error text-sm">{errors.fullName}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-text-primary font-medium">
                    Company *
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="bg-input border-border/50 focus:border-gabi-pink focus:ring-1 focus:ring-gabi-pink/20 transition-colors"
                    placeholder="Enter your company name"
                  />
                  {errors.company && (
                    <p className="text-error text-sm">{errors.company}</p>
                  )}
                </div>

                {/* Business Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-primary font-medium">
                    Business Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-input border-border/50 focus:border-gabi-pink focus:ring-1 focus:ring-gabi-pink/20 transition-colors"
                    placeholder="your.email@company.com"
                  />
                  {errors.email && (
                    <p className="text-error text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Newsletter Subscription */}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="subscribe"
                    checked={formData.subscribeUpdates}
                    onCheckedChange={(checked) => 
                      handleInputChange('subscribeUpdates', checked === true)
                    }
                    className="border-border/50 data-[state=checked]:bg-gabi-pink data-[state=checked]:border-gabi-pink"
                  />
                  <Label htmlFor="subscribe" className="text-text-secondary text-sm leading-relaxed">
                    Subscribe to strategic AI insights and updates
                  </Label>
                </div>

                {/* Begin Assessment Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`w-full text-lg py-6 gabi-gradient hover:opacity-90 text-white font-medium transition-all duration-200 ${
                    !isFormValid ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isLoading ? 'opacity-75' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <Brain className="w-5 h-5 mr-2 animate-pulse" />
                      Initializing Assessment...
                    </>
                  ) : (
                    <>
                      Begin Assessment
                      <Brain className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssessmentLanding;