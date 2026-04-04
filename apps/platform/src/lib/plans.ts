/**
 * Plan Limits and Feature Gating
 *
 * Plan hierarchy: free < pro < team < enterprise
 *
 * MVP Launch: Only Free tier is active. Pro, Team, and Enterprise are "Coming Soon".
 * All users default to 'free' plan.
 */

export type Plan = 'free' | 'pro' | 'team' | 'enterprise';

export const planHierarchy: Record<Plan, number> = {
  free: 0,
  pro: 1,
  team: 2,
  enterprise: 3,
};

/**
 * MVP Mode: Only Free tier is active
 * Set to false when ready to launch paid tiers
 */
export const MVP_FREE_ONLY = false;

/**
 * Coming soon message for premium features
 */
export const COMING_SOON_MESSAGE =
  'This feature is coming soon. Join the waitlist: team@getaiready.dev';

export interface PlanLimits {
  maxRepos: number;
  maxMembers: number;
  maxRunsPerMonth: number;
  dataRetentionDays: number;
  features: {
    historicalTrends: boolean;
    teamBenchmarking: boolean;
    aiRefactoringPlans: number; // per month, -1 = unlimited
    ciCdIntegration: boolean;
    prGatekeeper: boolean;
    customRules: boolean;
    apiAccess: boolean;
    sso: boolean;
  };
  support: {
    sla: string;
    channels: string[];
  };
}

export const planLimits: Record<Plan, PlanLimits> = {
  free: {
    maxRepos: 3,
    maxMembers: 1,
    maxRunsPerMonth: 10,
    dataRetentionDays: 7,
    features: {
      historicalTrends: false,
      teamBenchmarking: false,
      aiRefactoringPlans: 0,
      ciCdIntegration: false,
      prGatekeeper: false,
      customRules: false,
      apiAccess: false,
      sso: false,
    },
    support: {
      sla: 'None',
      channels: ['community'],
    },
  },
  pro: {
    maxRepos: 10,
    maxMembers: 1,
    maxRunsPerMonth: -1, // unlimited
    dataRetentionDays: 90,
    features: {
      historicalTrends: true,
      teamBenchmarking: false,
      aiRefactoringPlans: 5,
      ciCdIntegration: false,
      prGatekeeper: false,
      customRules: false,
      apiAccess: false,
      sso: false,
    },
    support: {
      sla: 'None',
      channels: ['email'],
    },
  },
  team: {
    maxRepos: -1, // unlimited
    maxMembers: -1, // unlimited
    maxRunsPerMonth: -1,
    dataRetentionDays: 90,
    features: {
      historicalTrends: true,
      teamBenchmarking: true,
      aiRefactoringPlans: 20,
      ciCdIntegration: true,
      prGatekeeper: true,
      customRules: false,
      apiAccess: false,
      sso: false,
    },
    support: {
      sla: '24h',
      channels: ['email', 'priority'],
    },
  },
  enterprise: {
    maxRepos: -1,
    maxMembers: -1,
    maxRunsPerMonth: -1,
    dataRetentionDays: 365,
    features: {
      historicalTrends: true,
      teamBenchmarking: true,
      aiRefactoringPlans: -1,
      ciCdIntegration: true,
      prGatekeeper: true,
      customRules: true,
      apiAccess: true,
      sso: true,
    },
    support: {
      sla: '4h',
      channels: ['email', 'priority', 'dedicated'],
    },
  },
};

/**
 * Check if a plan has access to a feature
 */
export function hasFeature(
  plan: Plan,
  feature: keyof PlanLimits['features']
): boolean {
  const limits = planLimits[plan];
  const value = limits.features[feature];

  // Boolean features
  if (typeof value === 'boolean') return value;

  // Numeric features (like aiRefactoringPlans)
  return value !== 0;
}

/**
 * Check if plan meets minimum required level
 */
export function meetsPlanRequirement(
  currentPlan: Plan,
  requiredPlan: Plan
): boolean {
  return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
}

/**
 * Get upgrade prompt for a feature
 */
export function getUpgradePrompt(feature: string): {
  requiredPlan: Plan;
  message: string;
  cta: string;
} {
  const featureToPlan: Record<string, Plan> = {
    historicalTrends: 'pro',
    teamBenchmarking: 'team',
    ciCdIntegration: 'team',
    prGatekeeper: 'team',
    customRules: 'enterprise',
    apiAccess: 'enterprise',
    sso: 'enterprise',
  };

  const requiredPlan = featureToPlan[feature] || 'pro';

  const messages: Record<Plan, string> = {
    free: 'Upgrade to access this feature',
    pro: `$49/mo — Perfect for individual developers`,
    team: `$99/mo — CI/CD integration and team features`,
    enterprise: `$299+/mo — Custom rules and dedicated support`,
  };

  const ctas: Record<Plan, string> = {
    free: 'Upgrade Now',
    pro: 'Get Pro',
    team: 'Get Team',
    enterprise: 'Contact Sales',
  };

  return {
    requiredPlan,
    message: messages[requiredPlan],
    cta: ctas[requiredPlan],
  };
}

/**
 * Format plan name for display
 */
export function formatPlanName(plan: Plan): string {
  const names: Record<Plan, string> = {
    free: 'Free',
    pro: 'Pro',
    team: 'Team',
    enterprise: 'Enterprise',
  };
  return names[plan];
}

/**
 * Get plan price
 */
export function getPlanPrice(
  plan: Plan
): { monthly: number; annual: number } | null {
  const prices: Record<Plan, { monthly: number; annual: number } | null> = {
    free: null,
    pro: { monthly: 49, annual: 470 }, // ~20% discount
    team: { monthly: 99, annual: 950 },
    enterprise: { monthly: 299, annual: 2900 },
  };
  return prices[plan];
}
