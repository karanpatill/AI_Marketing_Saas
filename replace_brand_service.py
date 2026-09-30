import re

with open('src/backend/services/BrandService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove assignDesignLanguageAI
content = re.sub(
    r'private async assignDesignLanguageAI[\s\S]*?\}\n\n',
    '',
    content
)

# Modify createBrand to just insert the data
content = re.sub(
    r'async createBrand\(workspaceId: string, name: string, data: any = \{\}\) \{[\s\S]*?return this\.repo\.createBrand\(\{[\s\S]*?workspace_id: workspaceId,[\s\S]*?name,[\s\S]*?\.\.\.data,[\s\S]*?internal_design_language: internalDesignLanguage[\s\S]*?\}\);\n  \}',
    'async createBrand(workspaceId: string, name: string, data: any = {}) {\n    return this.repo.createBrand({ \n      workspace_id: workspaceId, \n      name, \n      ...data\n    });\n  }',
    content
)

with open('src/backend/services/BrandService.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated BrandService')
