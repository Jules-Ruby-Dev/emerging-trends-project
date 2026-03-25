import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { orchestrateFulExport } from "../tools/coordinator.js";
import type { ExportConfig } from "../types/index.js";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const FIGMA_API_KEY = process.env.FIGMA_API_KEY!;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID!;
const FRONTEND_PATH = path.resolve(
  process.cwd(),
  "../frontend/src/components/generated",
);

if (!FIGMA_API_KEY || !FIGMA_FILE_ID) {
  console.error("❌ Missing FIGMA_API_KEY or FIGMA_FILE_ID in .env");
  process.exit(1);
}

async function generateComponentsFromFigma() {
  console.log("🎨 Starting Figma component generation...");
  console.log(`📁 Output path: ${FRONTEND_PATH}`);

  const config: ExportConfig = {
    figmaFileId: FIGMA_FILE_ID,
    figmaApiKey: FIGMA_API_KEY,
    outputPath: FRONTEND_PATH,
    includeStories: true,
    includeTests: false,
    usesTailwind: true,
    usesShadcn: true,
    pages: [
      "Login",
      "Home - Chat with AR",
      "History",
      "Settings",
      "Pretend Friend settings",
    ],
  };

  try {
    console.log(`\n🚀 Calling orchestrateFulExport with config...`);
    const result = await orchestrateFulExport(config);

    if (!result.success || !result.data) {
      console.error(`❌ Generation failed: ${result.error}`);
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(FRONTEND_PATH)) {
      fs.mkdirSync(FRONTEND_PATH, { recursive: true });
      console.log(`📁 Created output directory: ${FRONTEND_PATH}`);
    }

    // Write React components
    if (result.data.reactComponents && result.data.reactComponents.length > 0) {
      console.log(
        `\n⚛️  Writing ${result.data.reactComponents.length} React components...`,
      );
      for (const component of result.data.reactComponents) {
        const filePath = path.join(FRONTEND_PATH, component.filename);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, component.content, "utf-8");
        console.log(`  ✓ ${component.filename}`);
      }
    }

    // Write design tokens
    if (result.data.designTokens) {
      const tokensPath = path.join(FRONTEND_PATH, "designTokens.json");
      fs.writeFileSync(
        tokensPath,
        JSON.stringify(result.data.designTokens, null, 2),
        "utf-8",
      );
      console.log(`\n🎨 ✓ Design tokens written to designTokens.json`);
    }

    // Write documentation
    if (result.data.documentation?.libraryIndex) {
      const docsPath = path.join(FRONTEND_PATH, "COMPONENT_LIBRARY.md");
      fs.writeFileSync(
        docsPath,
        result.data.documentation.libraryIndex,
        "utf-8",
      );
      console.log(`📚 ✓ Component library documentation written`);
    }

    // Write Tailwind config
    if (result.data.configFiles?.tailwind) {
      const tailwindPath = path.join(
        FRONTEND_PATH,
        "TAILWIND_CONFIG_EXTENSION.js",
      );
      fs.writeFileSync(tailwindPath, result.data.configFiles.tailwind, "utf-8");
      console.log(`⚙️  ✓ Tailwind config extension written`);
    }

    // Print summary
    console.log("\n✅ Generation Complete!");
    console.log(`📊 Summary:`);
    console.log(
      `   - Components Generated: ${result.data.summary.componentsGenerated}`,
    );
    console.log(`   - Docs Generated: ${result.data.summary.docsGenerated}`);
    console.log(
      `   - Configs Generated: ${result.data.summary.configsGenerated}`,
    );
    console.log(`   - Timestamp: ${result.data.summary.timestamp}`);
    console.log(`\n📁 Components available at: ${FRONTEND_PATH}
`);
    console.log(`🎯 Next steps:`);
    console.log(`   1. Import generated components in React app`);
    console.log(`   2. Add routing to switch between pages`);
    console.log(`   3. Connect backend API calls`);
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
}

generateComponentsFromFigma();
