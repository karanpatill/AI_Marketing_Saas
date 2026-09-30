import re
import os

app_data = r'C:\Users\kpvlo\.gemini\antigravity\brain\91583c2d-1d7d-44fd-baaf-2b38c75d8e6d'
step5_path = os.path.join(app_data, 'scratch', 'step5.tsx')

with open('src/app/onboarding/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

with open(step5_path, 'r', encoding='utf-8') as f:
    step5_new = f.read()

# Replace Step 5
pattern5 = r'\{\/\*\s*[^\*]+Step 5: Brand Identity Studio[^\*]+\*\/\}.*?step === 5 && \((.*?)\n\s*\)\}'
match5 = re.search(pattern5, content, re.DOTALL)
if match5:
    content = content[:match5.start()] + step5_new.strip('\n') + content[match5.end():]
    print('Step 5 replaced')
else:
    print('Step 5 not found')

with open('src/app/onboarding/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
