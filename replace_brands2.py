import re

with open('src/app/api/brands/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const { workspaceId, name, ...data } = createBrandSchema.parse(await req.json());',
    'const { workspaceId, name, visual_direction, ...data } = createBrandSchema.parse(await req.json());'
)

content = content.replace(
    'const brand = await service.createBrand(workspaceId, name, data);',
    'const brand = await service.createBrand(workspaceId, name, { ...data, approved_moodboard: visual_direction });'
)

with open('src/app/api/brands/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated route to map visual_direction to approved_moodboard')
