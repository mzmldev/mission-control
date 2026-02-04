// Types for Mission Control Agent Skill

export interface MissionControlEnv {
  convex: {
    query: (endpoint: string, params?: any) => Promise<any>;
    mutation: (endpoint: string, params?: any) => Promise<any>;
  };
  // Add other environment variables as needed
}
