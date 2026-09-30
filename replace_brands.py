import re

with open('src/app/api/brands/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('approved_moodboard: z.unknown().nullable().optional(),', 'visual_direction: z.unknown().nullable().optional(),')

with open('src/app/api/brands/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated brands route')
