
const fs = require("fs");
let content = fs.readFileSync("src/backend/ai/utils/htmlTemplates.ts", "utf8");
content = content.replace(/\\`/g, "");
fs.writeFileSync("src/backend/ai/utils/htmlTemplates.ts", content);
console.log("Fixed backticks");

