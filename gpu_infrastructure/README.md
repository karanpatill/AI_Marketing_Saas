# GPU Infrastructure - RunPod Serverless

This directory contains the necessary code to deploy a highly-optimized, autoscaling API for **Flux.1-schnell** image generation on RunPod.

## Why this setup?
- **Serverless:** You only pay by the second when generating images. When idle, costs drop to zero.
- **Fast Startup:** The model weights are baked into the Docker image via `builder.py`, meaning when a new instance spins up, it doesn't need to download 20GB of weights from HuggingFace.
- **API Compatible:** The `handler.py` exposes a REST endpoint that you can call directly from your Next.js application, completely replacing Fal.ai.

## Deployment Steps

1. **Build and push the Docker image**
   Run these commands from this directory:
   ```bash
   docker build -t your-docker-username/asenra-flux-api:latest .
   docker push your-docker-username/asenra-flux-api:latest
   ```

2. **Create the Serverless Endpoint on RunPod**
   - Go to the **RunPod** dashboard > **Serverless** > **Endpoints**
   - Click **New Endpoint**
   - Name it (e.g., `asenra-flux`)
   - Select the GPU (Recommend: `1x RTX 4090` for fast generations)
   - For **Container Image**, put `your-docker-username/asenra-flux-api:latest`
   - Set max workers to 3 (or whatever you prefer)
   - Deploy!

3. **Call your new API**
   Once deployed, you'll get an Endpoint ID. Update your Next.js `ImageGenerator.ts` to call your RunPod API:
   
   ```typescript
   const response = await fetch(`https://api.runpod.ai/v2/${ENDPOINT_ID}/runsync`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": `Bearer ${YOUR_RUNPOD_API_KEY}`
     },
     body: JSON.stringify({
       input: {
         prompt: "your brand image prompt",
         width: 1080,
         height: 1080,
         num_inference_steps: 4,
         guidance_scale: 0.0
       }
     })
   });
   ```
