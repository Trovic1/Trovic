export const opikConfig = {
  apiKey: process.env.OPIK_API_KEY ?? "",
  projectId: process.env.OPIK_PROJECT_ID ?? "commit-coach"
};

export const opikAgents = {
  intake: "intake-agent",
  planner: "planner-agent",
  accountability: "accountability-agent",
  reflection: "reflection-agent"
};
