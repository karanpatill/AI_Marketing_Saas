import re

with open('src/backend/services/BrandService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'  Respond with ONLY the exact name of the chosen design language from the list above\. Nothing else\.;[\s\S]*?    \}\n  \}\n\n', '', content)

with open('src/backend/services/BrandService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed BrandService')
