import type {
  AccountabilityOutput,
  IntakeOutput,
  PlannerOutput,
  ReflectionOutput
} from "@/lib/agents/schemas";

interface GoalRecord {
  intake: IntakeOutput;
  plan: PlannerOutput | null;
  checkIns: AccountabilityOutput[];
  reflections: ReflectionOutput[];
}

const goalStore = new Map<string, GoalRecord>();
let latestGoalId: string | null = null;

export function saveIntake(result: IntakeOutput) {
  goalStore.set(result.goalId, {
    intake: result,
    plan: null,
    checkIns: [],
    reflections: []
  });
  latestGoalId = result.goalId;
}

export function savePlan(result: PlannerOutput) {
  const record = goalStore.get(result.goalId);
  if (!record) {
    return;
  }
  record.plan = result;
  latestGoalId = result.goalId;
}

export function saveCheckIn(result: AccountabilityOutput) {
  const record = goalStore.get(result.goalId);
  if (!record) {
    return;
  }
  record.checkIns.unshift(result);
  latestGoalId = result.goalId;
}

export function saveReflection(result: ReflectionOutput) {
  const record = goalStore.get(result.goalId);
  if (!record) {
    return;
  }
  record.reflections.unshift(result);
  latestGoalId = result.goalId;
}

export function getLatestGoal() {
  if (!latestGoalId) {
    return null;
  }
  return goalStore.get(latestGoalId) ?? null;
}

export function getGoal(goalId: string) {
  return goalStore.get(goalId) ?? null;
}
