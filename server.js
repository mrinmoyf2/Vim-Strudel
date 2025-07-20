// File: server.js
const express = require("express");
const { chromium } = require("playwright");
const fs = require("fs"); // Node.js File System module
const path = require("path"); // Node.js Path module

const app = express();
const port = 3000;
let page;

app.use(express.text());

// This function reads the main file, finds @import statements,
// and recursively builds the final code string.
function buildCode(filePath, seenFiles = new Set()) {
  if (seenFiles.has(filePath)) {
    console.warn(`Circular dependency detected: ${filePath} already imported.`);
    return ""; // Prevent infinite loops
  }
  seenFiles.add(filePath);

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const fileDir = path.dirname(filePath);
    let finalCode = "";

    const lines = fileContent.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*\/\/\s*@import\s+"(.*?)"/);
      if (match) {
        const importPath = path.resolve(fileDir, match[1]);
        finalCode += buildCode(importPath, seenFiles) + "\n";
      } else {
        finalCode += line + "\n";
      }
    }
    return finalCode;
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e.message);
    return `\n// FAILED TO IMPORT ${filePath}\n`;
  }
}

// This is the new, corrected code
app.post("/update", async (req, res) => {
  const mainFilePath = req.body;
  console.log(`Received update trigger for: ${mainFilePath}`);

  const fullCode = buildCode(mainFilePath);
  console.log("--- Code Bundled ---");
  console.log(fullCode.substring(0, 200) + "..."); // Log a snippet
  console.log("--------------------");

  if (page) {
    try {
      const editor = page.locator(".cm-content");
      await editor.fill(fullCode);
      await page.keyboard.press("Control+Enter");
      res.send("Bundled and Updated!");
    } catch (e) {
      console.error("Failed to update Strudel:", e.message);
      // THE FIX: Always send a response back to Vim/curl
      res.status(500).send("Error occurred during Playwright update.");
    }
  } else {
    res.status(503).send("Playwright page not ready.");
  }
});
(async () => {
  const browser = await chromium.launch({ headless: false }); // headless:true runs it in the background
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto("https://strudel.cc");

  // Wait for the global 'stack' function to be available.
  // This is a reliable sign that the Strudel environment is fully loaded.
  await page.waitForFunction(() => window.stack, null, { timeout: 60000 });

  app.listen(port, () => {
    console.log(`🚀 Server listening at http://localhost:${port}`);
    console.log("🎉 Strudel is ready. Start coding in Vim!");
  });
})();
