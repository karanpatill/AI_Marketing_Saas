import re

with open('src/app/onboarding/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace approvedMoodboard with visualDirection
content = re.sub(
    r'approvedMoodboard:\s*\{[^}]*\}\s*\|\s*null;',
    'visualDirection: { overallTheme: string; typographyStyle: string; imageryStyle: string; uiElements: string; } | null;',
    content
)

content = re.sub(
    r'approvedMoodboard:\s*null,',
    'visualDirection: null,',
    content
)

# Add visualDirection to scraper merge
content = content.replace(
    '          colors: scraped?.colors?.primary ? { ...data.colors, ...scraped.colors } : data.colors,',
    '          colors: scraped?.colors?.primary ? { ...data.colors, ...scraped.colors } : data.colors,\n          visualDirection: scraped?.visualDirection || null,'
)

# Change Logo Upload next step from 'moodboard' to 'complete'
content = content.replace(
    '      setStep("moodboard");\n      setIsTyping(true);\n      setTimeout(() => {\n        setIsTyping(false);\n        addMessage("ai", "text", "Got it. Finally, choose a visual direction for your AI-generated posts.");\n        addMessage("ai", "moodboard_picker", "");\n      }, 1000);',
    '      setStep("complete");\n      setIsTyping(true);\n      setTimeout(() => {\n        setIsTyping(false);\n        addMessage("ai", "text", "Perfect. Your autonomous marketing engine is ready to deploy. Click below to initialize your workspace.");\n      }, 1000);'
)

# Remove handleSelectMoodboard
content = re.sub(r'const handleSelectMoodboard = [\s\S]*?1000\);\n    };', '', content)

# Remove moodboard preset constant
content = re.sub(r'const MOODBOARD_PRESETS = \{[\s\S]*?\};\n', '', content)

# Remove moodboard_picker from message type
content = content.replace('| "moodboard_picker"', '')

# Update submission payload (replace approved_moodboard with visual_direction)
content = content.replace(
    'approved_moodboard: data.approvedMoodboard || null,',
    'visual_direction: data.visualDirection || null,'
)

with open('src/app/onboarding/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated onboarding UI successfully')
