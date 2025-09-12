import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, LogOut } from 'lucide-react';
import { signOut } from '@/lib/supabase-auth';
import deepRabbitLogo from '@/assets/bunny-logo.png';

interface AppHeaderProps {
  title?: string;
  user?: {
    full_name?: string;
    role?: string;
    company?: string;
  } | null;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  user 
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="border-b border-glass-border bg-glass-bg/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img 
              src={deepRabbitLogo} 
              alt="DeepRabbit Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white">DeepRabbit</h1>
              {title && (
                <p className="text-sm text-text-secondary">{title}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/settings')}
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-text-primary"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Settings</span>
            </Button>
            
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-text-primary"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;