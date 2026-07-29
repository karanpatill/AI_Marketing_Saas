import torch
from diffusers import FluxPipeline

# Download the model at build time so the Docker container starts up fast
print("Downloading Flux.1-schnell...")
pipeline = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-schnell",
    torch_dtype=torch.bfloat16
)
print("Download complete!")
