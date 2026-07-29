import runpod
import urllib.request
import json
import urllib.parse
import os
import websocket
import uuid
import time
import base64

# Start the ComfyUI server in the background
os.system("python main.py --listen 127.0.0.1 --port 8188 &")

def queue_prompt(prompt):
    p = {"prompt": prompt, "client_id": str(uuid.uuid4())}
    data = json.dumps(p).encode("utf-8")
    req =  urllib.request.Request("http://127.0.0.1:8188/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())

def get_history(prompt_id):
    with urllib.request.urlopen(f"http://127.0.0.1:8188/history/{prompt_id}") as response:
        return json.loads(response.read())

def get_file(filename, subfolder, folder_type):
    data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    url_values = urllib.parse.urlencode(data)
    with urllib.request.urlopen(f"http://127.0.0.1:8188/view?{url_values}") as response:
        return response.read()

def wait_for_server():
    print("Waiting for ComfyUI to start...")
    for _ in range(60):
        try:
            with urllib.request.urlopen("http://127.0.0.1:8188/system_stats") as response:
                if response.status == 200:
                    print("ComfyUI is running!")
                    return True
        except:
            time.sleep(1)
    return False

def handler(job):
    job_input = job["input"]
    workflow_json = job_input.get("workflow", {})
    
    if not workflow_json:
        return {"error": "No ComfyUI workflow JSON provided"}

    # Queue the workflow
    try:
        response = queue_prompt(workflow_json)
        prompt_id = response["prompt_id"]
    except Exception as e:
        return {"error": f"Failed to queue prompt: {str(e)}"}
        
    # Poll for completion (in production, use websockets to listen for completion)
    # This is a simplified polling loop
    history = {}
    print(f"Waiting for job {prompt_id} to complete...")
    for _ in range(600): # 10 minutes max timeout
        history = get_history(prompt_id)
        if prompt_id in history:
            break
        time.sleep(1)
        
    if prompt_id not in history:
         return {"error": "Generation timed out"}
         
    # Extract the outputs (images or videos)
    results = []
    outputs = history[prompt_id]["outputs"]
    for node_id, node_output in outputs.items():
        if "images" in node_output:
            for image in node_output["images"]:
                file_data = get_file(image["filename"], image["subfolder"], image["type"])
                b64_img = base64.b64encode(file_data).decode("utf-8")
                results.append({"type": "image", "data": f"data:image/png;base64,{b64_img}"})
        if "gifs" in node_output or "videos" in node_output: # depending on video saver node
             # Extract video logic here...
             pass

    return {"results": results}

if wait_for_server():
    runpod.serverless.start({"handler": handler})
else:
    print("Failed to start ComfyUI. Exiting.")
