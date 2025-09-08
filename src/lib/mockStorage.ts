// Mock Storage Service for Development
// Simulates Supabase database operations using localStorage

import { 
  DiscoverySession, 
  DiscoveryArea, 
  ProspectDiscovery, 
  DISCOVERY_AREAS 
} from '@/types/discovery';

const STORAGE_KEYS = {
  SESSIONS: 'sep_discovery_sessions',
  AREAS: 'sep_discovery_areas',
  PROSPECTS: 'sep_prospect_discovery'
};

export class MockStorageService {
  
  // Discovery Sessions
  static async createSession(sessionData: Omit<DiscoverySession, 'id' | 'created_at' | 'updated_at'>): Promise<DiscoverySession> {
    const sessions = this.getSessions();
    const newSession: DiscoverySession = {
      ...sessionData,
      id: crypto.randomUUID(),
      status: 'in_progress',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return newSession;
  }

  static async getSession(sessionId: string): Promise<DiscoverySession | null> {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  static async updateSession(sessionId: string, updates: Partial<DiscoverySession>): Promise<DiscoverySession | null> {
    const sessions = this.getSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return null;
    
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      updated_at: new Date()
    };
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return sessions[sessionIndex];
  }

  private static getSessions(): DiscoverySession[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored).map((s: any) => ({
        ...s,
        created_at: new Date(s.created_at),
        updated_at: new Date(s.updated_at)
      }));
    } catch {
      return [];
    }
  }

  // Discovery Areas
  static async initializeDiscoveryAreas(sessionId: string): Promise<DiscoveryArea[]> {
    const areas = DISCOVERY_AREAS.map((areaName, index) => ({
      id: crypto.randomUUID(),
      session_id: sessionId,
      area_name: areaName,
      completion_percentage: 0,
      conversation_data: [],
      is_active: index === 0, // First area starts active
      created_at: new Date(),
      updated_at: new Date()
    }));

    const existingAreas = this.getAreas();
    // Remove any existing areas for this session
    const filteredAreas = existingAreas.filter(a => a.session_id !== sessionId);
    const allAreas = [...filteredAreas, ...areas];
    
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(allAreas));
    return areas;
  }

  static async getDiscoveryAreas(sessionId: string): Promise<DiscoveryArea[]> {
    const areas = this.getAreas();
    return areas.filter(a => a.session_id === sessionId);
  }

  static async updateDiscoveryArea(areaId: string, updates: Partial<DiscoveryArea>): Promise<DiscoveryArea | null> {
    const areas = this.getAreas();
    const areaIndex = areas.findIndex(a => a.id === areaId);
    
    if (areaIndex === -1) return null;
    
    areas[areaIndex] = {
      ...areas[areaIndex],
      ...updates,
      updated_at: new Date()
    };
    
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(areas));
    return areas[areaIndex];
  }

  static async setActiveArea(sessionId: string, areaId: string): Promise<void> {
    const areas = this.getAreas();
    const updatedAreas = areas.map(area => {
      if (area.session_id === sessionId) {
        return { ...area, is_active: area.id === areaId };
      }
      return area;
    });
    
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(updatedAreas));
  }

  private static getAreas(): DiscoveryArea[] {
    const stored = localStorage.getItem(STORAGE_KEYS.AREAS);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored).map((a: any) => ({
        ...a,
        created_at: new Date(a.created_at),
        updated_at: new Date(a.updated_at)
      }));
    } catch {
      return [];
    }
  }

  // Utility methods for development
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.AREAS);
    localStorage.removeItem(STORAGE_KEYS.PROSPECTS);
  }

  static getAllSessions(): DiscoverySession[] {
    return this.getSessions();
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const sessions = this.getSessions();
    const areas = this.getAreas();
    
    // Remove session and related areas
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    const filteredAreas = areas.filter(a => a.session_id !== sessionId);
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filteredSessions));
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(filteredAreas));
  }
}

// Mock Supabase interface for development
export const mockSupabaseDB = {
  from: (table: string) => ({
    insert: async (data: any) => {
      if (table === 'discovery_sessions') {
        const session = await MockStorageService.createSession(data);
        return { data: session, error: null };
      }
      return { data: null, error: { message: 'Not implemented' } };
    },
    
    select: (fields?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'discovery_sessions') {
            const session = await MockStorageService.getSession(value);
            return { data: session, error: session ? null : { message: 'Not found' } };
          }
          if (table === 'discovery_areas') {
            const areas = await MockStorageService.getDiscoveryAreas(value);
            return { data: areas, error: null };
          }
          return { data: null, error: { message: 'Not implemented' } };
        }
      }),
      
      order: (column: string, options?: any) => {
        return this;
      }
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'discovery_sessions') {
            const session = await MockStorageService.updateSession(value, data);
            return { data: session, error: session ? null : { message: 'Not found' } };
          }
          if (table === 'discovery_areas') {
            const area = await MockStorageService.updateDiscoveryArea(value, data);
            return { data: area, error: area ? null : { message: 'Not found' } };
          }
          return { data: null, error: { message: 'Not implemented' } };
        }
      })
    }),

    upsert: async (data: any, options?: any) => {
      if (table === 'discovery_areas') {
        // For development, just create new areas
        return { data: data, error: null };
      }
      return { data: null, error: { message: 'Not implemented' } };
    }
  })
};