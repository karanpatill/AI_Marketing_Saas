import re

with open('src/backend/services/StrategyEngine.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'\\ - \\', '${post.format} - ')
content = content.replace(r'\https://dummyimage.com/1080x1080/0A0A0A/E1E0CC&text=\\', 'https://dummyimage.com/1080x1080/0A0A0A/E1E0CC&text=')
content = content.replace(r'\Successfully generated and mocked 30 days of content for Campaign \\', 'Successfully generated and mocked 30 days of content for Campaign ')

with open('src/backend/services/StrategyEngine.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed backticks in StrategyEngine')
