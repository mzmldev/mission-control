// Seed data for Mission Control agents
// Run with: npx convex run seed:seedAgents

import { v } from "convex/values";
import { mutation } from "./_generated/server.js";

// Agent definitions matching the OpenClaw multi-agent system
const AGENTS = [
  {
    name: "Jarvis",
    role: "Squad Lead",
    status: "idle" as const,
    sessionKey: "agent:main:main",
    metadata: {
      description: "The coordinator. Handles direct requests, delegates, monitors progress.",
      specialty: "Coordination and delegation",
      level: "Lead",
    },
  },
  {
    name: "Shuri",
    role: "Product Analyst",
    status: "idle" as const,
    sessionKey: "agent:product-analyst:main",
    metadata: {
      description: "Skeptical tester. Finds edge cases and UX issues. Tests competitors.",
      specialty: "Testing features from a user perspective, finding UX issues",
      level: "Specialist",
    },
  },
  {
    name: "Fury",
    role: "Customer Researcher",
    status: "idle" as const,
    sessionKey: "agent:customer-researcher:main",
    metadata: {
      description: "Deep researcher. Reads G2 reviews for fun. Every claim comes with receipts.",
      specialty: "Customer research, competitive analysis, evidence-based claims",
      level: "Specialist",
    },
  },
  {
    name: "Vision",
    role: "SEO Analyst",
    status: "idle" as const,
    sessionKey: "agent:seo-analyst:main",
    metadata: {
      description: "Thinks in keywords and search intent. Makes sure content can rank.",
      specialty: "SEO strategy, keyword research, search intent analysis",
      level: "Specialist",
    },
  },
  {
    name: "Loki",
    role: "Content Writer",
    status: "idle" as const,
    sessionKey: "agent:content-writer:main",
    metadata: {
      description: "Words are his craft. Pro-Oxford comma. Anti-passive voice.",
      specialty: "Long-form content, blog posts, copywriting",
      level: "Specialist",
    },
  },
  {
    name: "Quill",
    role: "Social Media Manager",
    status: "idle" as const,
    sessionKey: "agent:social-media-manager:main",
    metadata: {
      description: "Thinks in hooks and threads. Build-in-public mindset.",
      specialty: "Social content, hooks, engagement, threads",
      level: "Specialist",
    },
  },
  {
    name: "Wanda",
    role: "Designer",
    status: "idle" as const,
    sessionKey: "agent:designer:main",
    metadata: {
      description: "Visual thinker. Infographics, comparison graphics, UI mockups.",
      specialty: "Visual design, infographics, UI mockups",
      level: "Specialist",
    },
  },
  {
    name: "Pepper",
    role: "Email Marketing",
    status: "idle" as const,
    sessionKey: "agent:email-marketing:main",
    metadata: {
      description: "Drip sequences and lifecycle emails. Every email earns its place or gets cut.",
      specialty: "Email sequences, lifecycle marketing, drip campaigns",
      level: "Specialist",
    },
  },
  {
    name: "Friday",
    role: "Developer",
    status: "idle" as const,
    sessionKey: "agent:developer:main",
    metadata: {
      description: "Code is poetry. Clean, tested, documented.",
      specialty: "Full-stack development, code review, technical implementation",
      level: "Specialist",
    },
  },
  {
    name: "Wong",
    role: "Documentation Specialist",
    status: "idle" as const,
    sessionKey: "agent:documentation:main",
    metadata: {
      description: "Keeps docs organized. Makes sure nothing gets lost.",
      specialty: "Documentation, knowledge management, organization",
      level: "Specialist",
    },
  },
];

// Seed all agents into the database
export const seedAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const createdAgents = [];
    
    for (const agentData of AGENTS) {
      // Check if agent already exists by session key
      const existing = await ctx.db
        .query("agents")
        .withIndex("by_session_key", (q) => 
          q.eq("sessionKey", agentData.sessionKey)
        )
        .first();
      
      if (existing) {
        console.log(`Agent ${agentData.name} already exists, skipping...`);
        continue;
      }
      
      const agentId = await ctx.db.insert("agents", {
        ...agentData,
        lastSeen: Date.now(),
      });
      
      createdAgents.push({ id: agentId, name: agentData.name });
      
      // Create an activity for agent joining
      await ctx.db.insert("activities", {
        type: "agent_joined",
        agentId,
        message: `${agentData.name} (${agentData.role}) joined the squad`,
        metadata: { role: agentData.role },
      });
    }
    
    return {
      success: true,
      created: createdAgents,
      message: `Created ${createdAgents.length} agents`,
    };
  },
});

// Clear all agents (use with caution)
export const clearAgents = mutation({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    
    for (const agent of agents) {
      await ctx.db.delete(agent._id);
    }
    
    return {
      success: true,
      deleted: agents.length,
      message: `Deleted ${agents.length} agents`,
    };
  },
});

// Get seed info without modifying data
export const getSeedInfo = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAgents = await ctx.db.query("agents").collect();
    const existingSessionKeys = new Set(existingAgents.map(a => a.sessionKey));
    
    const toCreate = AGENTS.filter(a => !existingSessionKeys.has(a.sessionKey));
    const alreadyExist = AGENTS.filter(a => existingSessionKeys.has(a.sessionKey));
    
    return {
      totalInSeed: AGENTS.length,
      alreadyExist: alreadyExist.map(a => a.name),
      toCreate: toCreate.map(a => a.name),
    };
  },
});
