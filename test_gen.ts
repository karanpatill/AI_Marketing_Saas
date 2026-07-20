import { createAdminClient } from "./src/lib/supabaseServer";
import { AIGenerationService } from "./src/backend/services/AIGenerationService";

async function run() {
  const admin = createAdminClient();
  const ai = new AIGenerationService(admin);
  try {
    const job = await ai.enqueueJob({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      workspaceId: "00000000-0000-0000-0000-000000000000",
      jobType: "generate_post",
      payload: { prompt: "Hello world" }
    });
    console.log("Job created:", job.id);
    
    // Wait a bit to let background process run
    setTimeout(async () => {
        const { data } = await admin.from('jobs').select('*').eq('id', job.id).single();
        console.log("Job status after 5s:", data?.status, data?.error);
    }, 5000);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
