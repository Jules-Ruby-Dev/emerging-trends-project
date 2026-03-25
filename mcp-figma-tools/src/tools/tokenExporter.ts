import type {
  ExportConfig,
  DesignTokens,
  ToolResponse,
} from "../types/index.js";
import { FigmaClient } from "../utils/figmaClient.js";
import {
  DesignTokenExtractor,
  generateTailwindConfig,
  generateCSSVariables,
} from "../utils/tokenExtractor.js";

export async function extractDesignTokens(
  config: ExportConfig,
): Promise<ToolResponse<DesignTokens>> {
  try {
    if (!config.figmaApiKey || !config.figmaFileId) {
      return {
        success: false,
        error: "Missing Figma API key or file ID",
      };
    }

    const client = new FigmaClient(config.figmaApiKey);
    const file = await client.getFile(config.figmaFileId);
    const extractor = new DesignTokenExtractor();

    const tokens = extractor.extractAllTokens(file.document);

    return {
      success: true,
      data: tokens,
      message: "Design tokens extracted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to extract design tokens: ${error}`,
    };
  }
}

export async function exportTailwindConfig(
  config: ExportConfig,
): Promise<ToolResponse<string>> {
  try {
    const tokenResponse = await extractDesignTokens(config);
    if (!tokenResponse.success || !tokenResponse.data) {
      return {
        success: false,
        error: "Could not extract design tokens",
      };
    }

    const tailwindConfig = generateTailwindConfig(tokenResponse.data);
    const configString = `module.exports = ${JSON.stringify(tailwindConfig, null, 2)}`;

    return {
      success: true,
      data: configString,
      message: "Tailwind config generated",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate Tailwind config: ${error}`,
    };
  }
}

export async function exportCSSVariables(
  config: ExportConfig,
): Promise<ToolResponse<string>> {
  try {
    const tokenResponse = await extractDesignTokens(config);
    if (!tokenResponse.success || !tokenResponse.data) {
      return {
        success: false,
        error: "Could not extract design tokens",
      };
    }

    const cssVars = generateCSSVariables(tokenResponse.data);

    return {
      success: true,
      data: cssVars,
      message: "CSS variables generated",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate CSS variables: ${error}`,
    };
  }
}
