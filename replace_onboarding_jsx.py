import re

with open('src/app/onboarding/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the moodboard_picker block
content = re.sub(
    r'\{msg\.type === "moodboard_picker" && \([\s\S]*?\}\)\]\.map\(\(\[key, preset\]\) => \([\s\S]*?</div>\n                  \)\}\n',
    '',
    content
)

with open('src/app/onboarding/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Removed moodboard picker JSX')
