import re

with open('src/app/api/scrape/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add to ScrapedBrand type
content = content.replace(
    '  colors: { primary: string; secondary: string; accent: string; background: string; text: string } | null;\n  warning?: string;',
    '  colors: { primary: string; secondary: string; accent: string; background: string; text: string } | null;\n  visualDirection: { overallTheme: string; typographyStyle: string; imageryStyle: string; uiElements: string } | null;\n  warning?: string;'
)

# Add to geminiSchema properties
content = content.replace(
    '          text: { type: "STRING" },\n        },\n      },',
    '          text: { type: "STRING" },\n        },\n      },\n      visualDirection: {\n        type: "OBJECT",\n        properties: {\n          overallTheme: { type: "STRING" },\n          typographyStyle: { type: "STRING" },\n          imageryStyle: { type: "STRING" },\n          uiElements: { type: "STRING" },\n        },\n      },'
)

# Add to emptyBrand
content = content.replace(
    '      competitors: [],\n      colors: null,\n      warning,\n    };\n  }',
    '      competitors: [],\n      colors: null,\n      visualDirection: null,\n      warning,\n    };\n  }'
)

# Add instructions to Gemini prompt
content = content.replace(
    '  - Pick brand colours from the dominant hex list; return "" for any colour you cannot determine.',
    '  - Pick brand colours from the dominant hex list; return "" for any colour you cannot determine.\n  - CAREFULLY analyze the visual direction of the brand from the content (typography mentioned or implied, imagery styles like photography or illustration, overall mood like premium, playful, corporate, and UI styles).'
)

with open('src/app/api/scrape/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated scrape route successfully')
