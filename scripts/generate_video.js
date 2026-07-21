require('dotenv').config({ path: '.env.local' });
const { fal } = require('@fal-ai/client');

async function main() {
  try {
    console.log("Submitting to Kling Video...");
    const result = await fal.subscribe("fal-ai/kling-video/v1/standard/text-to-video", {
      input: {
        prompt: "A cinematic, warm golden hour shot of a glowing holographic data sphere hovering above a dark, moody landscape. Glowing golden data streams and abstract holographic marketing charts float in the air. Surreal, dramatic clouds, film grain, highly detailed, photorealistic, 4k.",
        aspect_ratio: "16:9",
        duration: "5",
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });
    
    console.log("Success:");
    if (result && result.video && result.video.url) {
      console.log("NEW VIDEO URL:", result.video.url);
      const fs = require('fs');
      fs.writeFileSync('new_video_url.txt', result.video.url);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
