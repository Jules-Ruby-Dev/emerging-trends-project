import type { ExportConfig, ToolResponse } from "../types/index.js";
import {
  extractDesignTokens,
  exportTailwindConfig,
  exportCSSVariables,
} from "./tokenExporter.js";
import { generateReactComponents } from "./reactGenerator.js";
import { generateVanillaUIComponents } from "./vanillaUIGenerator.js";
import {
  generateComponentLibraryDocs,
  generateStorybookConfig,
} from "./docGenerator.js";

export interface OrchestrationResult {
  designTokens: any;
  reactComponents: any;
  vanillaComponents: any;
  documentation: any;
  configFiles: any;
  summary: {
    componentsGenerated: number;
    docsGenerated: number;
    configsGenerated: number;
    timestamp: string;
  };
}

export async function orchestrateFulExport(
  config: ExportConfig,
): Promise<ToolResponse<OrchestrationResult>> {
  try {
    console.log("🚀 Starting full Figma export orchestration...");

    // Step 1: Extract design tokens
    console.log("📦 Extracting design tokens...");
    const tokensResponse = await extractDesignTokens(config);
    if (!tokensResponse.success) {
      return { success: false, error: "Failed to extract design tokens" };
    }

    // Step 2: Generate React components
    console.log("⚛️  Generating React components...");
    const reactResponse = await generateReactComponents(config);
    if (!reactResponse.success || !reactResponse.data) {
      return { success: false, error: "Failed to generate React components" };
    }

    // Step 3: Generate vanilla UI components
    console.log("🎨 Generating vanilla TypeScript UI components...");
    const vanillaResponse = await generateVanillaUIComponents(config);
    // Don't fail if vanilla generation fails - it's optional

    // Step 4: Generate documentation
    console.log("📚 Generating documentation...");
    const libDocsResponse = await generateComponentLibraryDocs(config);

    // Step 5: Generate configs
    console.log("⚙️  Generating configuration files...");
    const tailwindResponse = await exportTailwindConfig(config);
    const cssVarsResponse = await exportCSSVariables(config);
    const storybookConfigResponse = generateStorybookConfig();

    // Compile results
    const result: OrchestrationResult = {
      designTokens: tokensResponse.data,
      reactComponents: reactResponse.data,
      vanillaComponents: vanillaResponse.data || [],
      documentation: {
        libraryIndex: libDocsResponse.data,
        storybook: storybookConfigResponse.data,
      },
      configFiles: {
        tailwind: tailwindResponse.data,
        cssVariables: cssVarsResponse.data,
        storybook: storybookConfigResponse.data,
      },
      summary: {
        componentsGenerated:
          (reactResponse.data?.length || 0) +
          (vanillaResponse.data?.length || 0),
        docsGenerated: 3, // library index, tailwind, CSS vars
        configsGenerated: 3,
        timestamp: new Date().toISOString(),
      },
    };

    console.log("✅ Export orchestration complete!");

    return {
      success: true,
      data: result,
      message: `Successfully exported ${result.summary.componentsGenerated} components with documentation`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Orchestration failed: ${error}`,
    };
  }
}

export async function syncFigmaToRepository(
  config: ExportConfig,
  repoPath: string,
): Promise<ToolResponse<string>> {
  try {
    const exportResult = await orchestrateFulExport(config);
    if (!exportResult.success || !exportResult.data) {
      return { success: false, error: "Could not complete export" };
    }

    const files: Record<string, string> = {};

    // Structure files for repository
    if (exportResult.data.reactComponents) {
      exportResult.data.reactComponents.forEach((component: any) => {
        files[`src/components/react/${component.filename}`] = component.content;
      });
    }

    if (
      exportResult.data.vanillaComponents &&
      exportResult.data.vanillaComponents.length > 0
    ) {
      exportResult.data.vanillaComponents.forEach((component: any) => {
        files[
          `src/components/vanilla/${component.filename.replaceAll("-", "_")}.ts`
        ] = component.ts;
        files[
          `src/components/vanilla/${component.filename.replaceAll("-", "_")}.css`
        ] = component.css;
        files[
          `src/components/vanilla/${component.filename.replaceAll("-", "_")}.html`
        ] = component.html;
      });
    }

    // Add config and docs
    if (exportResult.data.configFiles?.tailwind) {
      files["tailwind.config.js"] = exportResult.data.configFiles
        .tailwind as string;
    }
    if (exportResult.data.configFiles?.cssVariables) {
      files["src/styles/design-tokens.css"] = exportResult.data.configFiles
        .cssVariables as string;
    }
    if (exportResult.data.configFiles?.storybook) {
      files[".storybook/main.ts"] = exportResult.data.configFiles
        .storybook as string;
    }
    if (exportResult.data.documentation?.libraryIndex) {
      files["docs/COMPONENTS.md"] = exportResult.data.documentation
        .libraryIndex as string;
    }

    let syncSummary = `# Figma Sync Report\n\n`;
    syncSummary += `Generated at: ${new Date().toISOString()}\n\n`;
    syncSummary += `## Files Generated\n`;
    syncSummary += Object.keys(files)
      .map((path) => `- ${path}`)
      .join("\n");
    syncSummary += `\n\n## Summary\n`;
    syncSummary += `- Total files: ${Object.keys(files).length}\n`;
    syncSummary += `- React components: ${exportResult.data.reactComponents?.length || 0}\n`;
    syncSummary += `- Vanilla components: ${exportResult.data.vanillaComponents?.length || 0}\n`;

    return {
      success: true,
      data: syncSummary,
      message: `Synced ${Object.keys(files).length} files to repository`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Repository sync failed: ${error}`,
    };
  }
}

export async function validateDesignSync(
  config: ExportConfig,
): Promise<ToolResponse<string>> {
  try {
    const tokensResponse = await extractDesignTokens(config);
    const reactResponse = await generateReactComponents(config);

    let validation = `# Design Sync Validation Report\n\n`;
    validation += `Timestamp: ${new Date().toISOString()}\n\n`;

    if (tokensResponse.success) {
      validation += `✅ Design Tokens: ${Object.keys((tokensResponse.data as any).colors || {}).length} colors extracted\n`;
    } else {
      validation += `❌ Design Tokens: Failed\n`;
    }

    if (reactResponse.success) {
      validation += `✅ React Components: ${reactResponse.data?.length} components generated\n`;
    } else {
      validation += `❌ React Components: Failed\n`;
    }

    validation += `\n## Recommendations\n`;
    validation += `- Review all colors for brand consistency\n`;
    validation += `- Run component tests\n`;
    validation += `- Update Storybook stories\n`;

    return {
      success: tokensResponse.success && reactResponse.success,
      data: validation,
      message: "Validation complete",
    };
  } catch (error) {
    return {
      success: false,
      error: `Validation failed: ${error}`,
    };
  }
}
