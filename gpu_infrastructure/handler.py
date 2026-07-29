import runpod
import torch
import base64
from io import BytesIO
from diffusers import FluxPipeline

print("Loading model into memory...")
pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16
)
# Load onto GPU (RunPod instances typically use CUDA)
pipe.enable_model_cpu_offload()

def generate_image(job):
    job_input = job["input"]
    prompt = job_input.get("prompt", "a beautiful marketing image")
    width = job_input.get("width", 1024)
    height = job_input.get("height", 1024)
    num_inference_steps = job_input.get("num_inference_steps", 4)
    guidance_scale = job_input.get("guidance_scale", 0.0)
    
    print(f"Generating image for prompt: {prompt}")
    
    image = pipe(
        prompt,
        width=width,
        height=height,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale
    ).images[0]
    
    # Convert PIL Image to base64
    buffered = BytesIO()
    image.save(buffered, format="JPEG", quality=90)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "images": [{"url": f"data:image/jpeg;base64,{img_str}"}]
    }

print("Starting RunPod Serverless worker...")
runpod.serverless.start({"handler": generate_image})
