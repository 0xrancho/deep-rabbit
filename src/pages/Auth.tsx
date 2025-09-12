import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { signUp, signIn, signInWithGoogle, getCurrentUser } from '@/lib/supabase-auth';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    company: '',
    role: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign up with 7-day trial
        const { data, error } = await signUp(
          formData.email,
          formData.password,
          {
            fullName: formData.fullName,
            company: formData.company,
            role: formData.role
          }
        );
        
        if (error) throw error;
        
        // Show success message and redirect to onboarding immediately
        setError(null);
        // Auto-sign in the new user and redirect to onboarding
        navigate('/onboarding');
      } else {
        // Sign in
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) throw error;
        
        console.log('Sign in successful, checking user status...');
        
        // Check if user needs onboarding
        try {
          const user = await getCurrentUser();
          console.log('Current user:', user);
          
          if (!user) {
            console.log('No user data found, redirecting to dashboard...');
            navigate('/dashboard');
          } else if (!localStorage.getItem(`custom_icps_${user.id}`)) {
            // New user - redirect to onboarding
            console.log('New user detected, redirecting to onboarding...');
            navigate('/onboarding');
          } else {
            // Existing user - redirect to dashboard
            console.log('Existing user, redirecting to dashboard...');
            navigate('/dashboard');
          }
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback to dashboard
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Google will redirect to dashboard automatically
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" className="text-white">
              {/* Clean rabbit silhouette */}
              <g fill="white" opacity="0.95">
                {/* Left ear */}
                <ellipse cx="18" cy="12" rx="4" ry="10" transform="rotate(-10 18 12)"/>
                {/* Right ear */}
                <ellipse cx="30" cy="12" rx="4" ry="10" transform="rotate(10 30 12)"/>
                {/* Head */}
                <ellipse cx="24" cy="20" rx="9" ry="8"/>
                {/* Body */}
                <ellipse cx="24" cy="32" rx="10" ry="11"/>
                {/* Tail */}
                <circle cx="35" cy="35" r="3"/>
                {/* Eye dots */}
                <circle cx="20" cy="19" r="1.5" fill="black"/>
                <circle cx="28" cy="19" r="1.5" fill="black"/>
              </g>
            </svg>
            <h1 className="text-3xl font-bold text-white">DeepRabbit</h1>
          </div>
          <p className="text-text-secondary">
            {isSignUp 
              ? 'Start your 7-day free trial - No email confirmation required'
              : 'Deep elicitation intelligence for B2B discovery'}
          </p>
        </div>

        <Card className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Sign up fields */}
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-text-primary">
                    Full Name <span className="text-error">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Smith"
                    className="input-field"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-text-primary">
                    Company URL <span className="text-error">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-sm z-10">
                      https://
                    </span>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="acmeconsulting.com"
                      className="input-field pl-20"
                      required
                    />
                  </div>
                  <p className="text-xs text-text-muted">
                    Your company website URL (used for business intelligence analysis)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-text-primary">
                    Role
                  </Label>
                  <Input
                    id="role"
                    type="text"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="Senior Consultant"
                    className="input-field"
                  />
                </div>
              </>
            )}

            {/* Email & Password */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text-primary">
                Email <span className="text-error">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-text-primary">
                  Password <span className="text-error">*</span>
                </Label>
                {isSignUp && (
                  <Button
                    type="button"
                    onClick={generatePassword}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs border-sep-primary/30 hover:bg-sep-primary/10"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-text-muted">
                  Minimum 6 characters or use the generate button for a secure password
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-sep w-full py-4 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                <>
                  {isSignUp ? 'Start Free Trial' : 'Sign In'}
                  <span className="ml-2">→</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-glass-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-glass-bg px-2 text-text-muted">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full py-4 border-glass-border hover:bg-glass-highlight"
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            {/* Toggle sign up / sign in */}
            <div className="text-center text-sm">
              <span className="text-text-secondary">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="ml-2 text-sep-primary hover:text-sep-secondary transition-colors font-medium"
              >
                {isSignUp ? 'Sign In' : 'Start Free Trial'}
              </button>
            </div>

            {/* Trial info */}
            {isSignUp && (
              <div className="mt-6 p-4 bg-sep-primary/10 border border-sep-primary/30 rounded-lg">
                <h3 className="text-sm font-semibold text-sep-primary mb-2">
                  7-Day Free Trial Includes:
                </h3>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• Unlimited discovery sessions</li>
                  <li>• AI-powered elicitation intelligence</li>
                  <li>• Professional report generation</li>
                  <li>• No email confirmation needed</li>
                </ul>
              </div>
            )}
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-text-muted">
          By signing up, you agree to our{' '}
          <a href="#" className="hover:text-text-secondary">Terms of Service</a>
          {' and '}
          <a href="#" className="hover:text-text-secondary">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default Auth;