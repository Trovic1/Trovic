import type {
  AccountabilityOutput,
  IntakeOutput,
  PlannerOutput,
  ReflectionOutput
} from "@/lib/schemas";

interface GoalRecord {
  intake: IntakeOutput;
  plan: PlannerOutput | null;
  checkIns: AccountabilityOutput[];
  reflections: ReflectionOutput[];
  timeframeWeeks: number;
  motivation: string;
  constraints: string[];
}

const goalStore = new Map<string, GoalRecord>();
let latestGoalId: string | null = null;

export function saveGoal(goalId: string, record: GoalRecord) {
  goalStore.set(goalId, record);
  latestGoalId = goalId;
}

export function updateGoalPlan(goalId: string, plan: PlannerOutput) {
  const record = goalStore.get(goalId);
  if (!record) {
    return;
  }
  record.plan = plan;
  latestGoalId = goalId;
}

export function addCheckIn(goalId: string, checkIn: AccountabilityOutput) {
  const record = goalStore.get(goalId);
  if (!record) {
    return;
  }
  record.checkIns.unshift(checkIn);
  latestGoalId = goalId;
}

export function addReflection(goalId: string, reflection: ReflectionOutput) {
  const record = goalStore.get(goalId);
  if (!record) {
    return;
  }
  record.reflections.unshift(reflection);
  latestGoalId = goalId;
}

export function updateGoalDetails(
  goalId: string,
  details: Pick<GoalRecord, "timeframeWeeks" | "motivation" | "constraints">
) {
  const record = goalStore.get(goalId);
  if (!record) {
    return false;
  }
  record.timeframeWeeks = details.timeframeWeeks;
  record.motivation = details.motivation;
  record.constraints = details.constraints;
  latestGoalId = goalId;
  return true;
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
