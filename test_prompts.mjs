import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

const getStyleProfile = (lang) => {
    const profiles = {
        'maximalism': {
            layoutStyle: 'Loud, vibrant, dense with elements, no empty space.',
            headingDesc: 'Extremely bold, colorful, taking up massive space.',
            bodyDesc: 'High energy, enthusiastic, persuasive and packed with value.'
        },
        'blueprint': {
            layoutStyle: 'Technical, grid-based, dark mode, precise schematics.',
            headingDesc: 'Monospaced, data-driven, analytical.',
            bodyDesc: 'Technical instructions, step-by-step logic, formulas.'
        }
    };
    return profiles[lang];
};

async function testPrompt(assignedLanguage, brandName, brandPersonality, primaryColor, secondaryColor) {
    const profile = getStyleProfile(assignedLanguage);
    const prompt = `
You are an elite, world-class copywriter, art director, and content strategist specializing in ultra-premium, high-converting LinkedIn and Instagram posts.
Your style flawlessly matches the brand's visual identity, vibe, and tone of voice, acting as the ultimate manifestation of the brand's DNA.

--- BRAND DNA & IDENTITY ---
- Brand Name: ${brandName}
- Visual Vibe & Tone: ${brandPersonality}
- Core Business: Artificial Intelligence Marketing SaaS
- Target Audience: Marketing Agencies and Founders
- Unique Selling Proposition (USP): AI that designs complete marketing campaigns
- Brand Colors: Primary (${primaryColor}), Secondary (${secondaryColor})
- Assigned Design Language: ${assignedLanguage}

DESIGN LANGUAGE DIRECTIVES for ${assignedLanguage}:
- Layout Philosophy: ${profile.layoutStyle}
- Heading Tone: ${profile.headingDesc}
- Body Copy Style: ${profile.bodyDesc}

Topic of the Post: "How AI is replacing traditional design agencies"

--- CRITICAL RULES ---
1. WRITE WORLD-CLASS COPY.
2. This is for a single static post graphic. Keep the text punchy and readable.

Return the result STRICTLY as a JSON object with the following structure. DO NOT include markdown formatting (\`\`\`json):
{
  "category": "MARKETING INSIGHT",
  "title": "The specific hook title that stops the scroll.",
  "content": "Short, compelling subtitle setting up the premise.",
  "image_prompt": "A detailed image generation prompt for the background image that strictly follows the ${assignedLanguage} design language aesthetics and prominently features the brand colors: ${primaryColor} and ${secondaryColor}."
}
`;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });
    
    let jsonOutput = result.response.text();
    const match = jsonOutput.match(/\{[\s\S]*\}/);
    if(match) {
        return JSON.parse(match[0]);
    }
    return JSON.parse(jsonOutput);
}

async function run() {
    console.log("=== Testing Asenra (Maximalism) ===");
    const b = await testPrompt("maximalism", "Asenra", "High energy, dynamic, creative, boundless", "#FF5733", "#900C3F");
    console.log(JSON.stringify(b, null, 2));

    console.log("\n=== Testing TechNova (Blueprint) ===");
    const m = await testPrompt("blueprint", "TechNova", "Technical, precise, highly structured, analytical", "#0A192F", "#64FFDA");
    console.log(JSON.stringify(m, null, 2));
}

run();
