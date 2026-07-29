FROM runpod/pytorch:2.2.1-py3.10-cuda12.1.1-devel-ubuntu22.04

WORKDIR /
# Install core dependencies
RUN pip install --upgrade pip
RUN pip install runpod transformers accelerate diffusers sentencepiece

# Add builder script to download models during build
COPY builder.py /builder.py
RUN python /builder.py

# Add handler script
COPY handler.py /handler.py

CMD ["python", "-u", "/handler.py"]
