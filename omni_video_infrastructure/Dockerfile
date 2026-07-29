FROM nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y git python3 python3-pip wget ffmpeg libsm6 libxext6 && rm -rf /var/lib/apt/lists/*
RUN ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /
# Clone ComfyUI
RUN git clone https://github.com/comfyanonymous/ComfyUI.git
WORKDIR /ComfyUI

# Install ComfyUI dependencies
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
RUN pip install -r requirements.txt
RUN pip install runpod websocket-client

# Add Custom Nodes here (e.g. ComfyUI-VideoHelperSuite for video rendering)
RUN cd custom_nodes && git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git && cd ComfyUI-VideoHelperSuite && pip install -r requirements.txt

# Add RunPod handler
COPY handler.py /ComfyUI/handler.py

CMD ["python", "-u", "/ComfyUI/handler.py"]
