// Mock Authentication for Development
// This provides a development-friendly auth system that can be replaced with real Supabase Auth

import { User, Organization } from '@/types/discovery';

const MOCK_ORGANIZATION: Organization = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Discovery Wizard Consulting',
  domain: 'discoverywizard.com',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01')
};

const MOCK_USERS: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'john.consultant@sep.com',
    name: 'John Smith',
    role: 'Senior Consultant',
    organization_id: MOCK_ORGANIZATION.id,
    organization: MOCK_ORGANIZATION,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'sarah.principal@sep.com',
    name: 'Sarah Johnson',
    role: 'Principal',
    organization_id: MOCK_ORGANIZATION.id,
    organization: MOCK_ORGANIZATION,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'mike.manager@sep.com',
    name: 'Mike Davis',
    role: 'Manager',
    organization_id: MOCK_ORGANIZATION.id,
    organization: MOCK_ORGANIZATION,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

// Local storage keys
const AUTH_USER_KEY = 'sep_discovery_user';
const AUTH_SESSION_KEY = 'sep_discovery_session';

export class MockAuthService {
  
  // Get current user
  static getCurrentUser(): User | null {
    const userData = localStorage.getItem(AUTH_USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    
    // Auto-login with first user for development
    const defaultUser = MOCK_USERS[0];
    this.setCurrentUser(defaultUser);
    return defaultUser;
  }

  // Set current user
  static setCurrentUser(user: User): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
      access_token: 'mock_token_' + user.id,
      user: { id: user.id, email: user.email }
    }));
  }

  // Mock login
  static async login(email: string): Promise<User | null> {
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }

  // Mock logout
  static logout(): void {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  // Mock auth check
  static isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  // Get all users (for switching during development)
  static getAllUsers(): User[] {
    return MOCK_USERS;
  }

  // Switch user (for development)
  static switchUser(userId: string): User | null {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      this.setCurrentUser(user);
      return user;
    }
    return null;
  }
}

// Mock Supabase-like interface for seamless replacement
export const mockSupabase = {
  auth: {
    getUser: async () => {
      const user = MockAuthService.getCurrentUser();
      return {
        data: { user: user ? { id: user.id, email: user.email } : null },
        error: null
      };
    },
    
    signIn: async (credentials: { email: string; password: string }) => {
      const user = await MockAuthService.login(credentials.email);
      return {
        data: { user: user ? { id: user.id, email: user.email } : null },
        error: user ? null : { message: 'User not found' }
      };
    },
    
    signOut: async () => {
      MockAuthService.logout();
      return { error: null };
    }
  }
};

// Export for easy switching to real auth later
export const authService = MockAuthService;