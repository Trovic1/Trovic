const opikApiKey = process.env.OPIK_API_KEY ?? "";
const opikProjectId = process.env.OPIK_PROJECT_ID ?? "commit-coach";

let clientPromise: Promise<any> | null = null;

async function getOpikClient() {
  if (!opikApiKey) {
    return null;
  }
  if (!clientPromise) {
    clientPromise = import("opik").then((module) => {
      const OpikClient = module.Opik ?? module.default ?? module;
      return typeof OpikClient === "function"
        ? new OpikClient({ apiKey: opikApiKey, projectId: opikProjectId })
        : OpikClient;
    });
  }
  return clientPromise;
}

export async function emitOpikTrace(name: string, payload: Record<string, unknown>) {
  const client = await getOpikClient();
  const trace = {
    name,
    projectId: opikProjectId,
    payload,
    timestamp: new Date().toISOString()
  };

  if (client?.trace) {
    return client.trace(trace);
  }
  if (client?.createTrace) {
    return client.createTrace(trace);
  }
  if (client?.log) {
    return client.log(trace);
  }

  console.info("[opik:trace]", trace);
  return trace;
}
