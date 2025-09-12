import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  getCurrentUser, 
  getSubscriptionStatus, 
  signOut,
  type DeepRabbitUser 
} from '@/lib/supabase-auth';
import { getUserSessions, getUserUsageStats } from '@/lib/deeprabbit-api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<DeepRabbitUser | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get user info
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);

      // Get subscription status
      const status = await getSubscriptionStatus();
      setSubscriptionStatus(status);

      // Get usage stats
      const stats = await getUserUsageStats();
      setUsageStats(stats);

      // Get recent sessions
      const sessions = await getUserSessions();
      setRecentSessions(sessions.slice(0, 5)); // Show last 5
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNewDiscovery = () => {
    navigate('/discovery/setup');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
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
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 48 48" className="text-white">
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
                </g>
              </svg>
              <h1 className="text-2xl font-bold text-white">DeepRabbit</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">
                {user?.email}
              </span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-glass-border hover:bg-glass-highlight"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.full_name || 'there'}!
          </h2>
          <p className="text-text-secondary">
            {subscriptionStatus?.message}
          </p>
        </div>

        {/* Subscription Alert */}
        {subscriptionStatus?.isTrialing && (
          <Card className="glass-card p-4 mb-8 border-sep-primary/50 bg-sep-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sep-primary">Free Trial Active</h3>
                <p className="text-sm text-text-secondary">
                  {subscriptionStatus.trialDaysLeft} days remaining in your trial
                </p>
              </div>
              <Button
                onClick={() => navigate('/account')}
                className="bg-sep-primary hover:bg-sep-secondary"
              >
                Upgrade Now
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="glass-card p-6 cursor-pointer hover:border-sep-primary/50 transition-all"
            onClick={handleNewDiscovery}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                New Discovery
              </h3>
              <p className="text-sm text-text-secondary">
                Start a new discovery session
              </p>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {usageStats?.sessionsThisMonth || 0}
              </h3>
              <p className="text-sm text-text-secondary">
                Sessions this month
              </p>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {usageStats?.reportsThisMonth || 0}
              </h3>
              <p className="text-sm text-text-secondary">
                Reports generated
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="glass-card p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Recent Discovery Sessions
          </h3>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div 
                  key={session.id}
                  className="p-4 bg-glass-bg rounded-lg border border-glass-border hover:border-sep-primary/30 transition-all cursor-pointer"
                  onClick={() => navigate(`/discovery/session/${session.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {session.prospect_company}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {session.prospect_name} • {session.prospect_role || 'No role specified'}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(session.started_at).toLocaleDateString()} • 
                        {session.status === 'completed' ? ' Completed' : ' In Progress'}
                      </p>
                    </div>
                    <div className="text-right">
                      {session.report_generated ? (
                        <span className="text-xs bg-sep-primary/20 text-sep-primary px-2 py-1 rounded">
                          Report Ready
                        </span>
                      ) : (
                        <span className="text-xs bg-glass-highlight text-text-secondary px-2 py-1 rounded">
                          {session.total_questions_asked || 0} questions
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">No discovery sessions yet</p>
              <Button
                onClick={handleNewDiscovery}
                className="btn-sep"
              >
                Start Your First Discovery
              </Button>
            </div>
          )}
        </Card>

        {/* Footer Stats */}
        <div className="mt-8 flex justify-between text-sm text-text-muted">
          <div>
            Total Sessions: {usageStats?.totalSessions || 0}
          </div>
          <div>
            Total Reports: {usageStats?.totalReports || 0}
          </div>
          <div>
            Member Since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;