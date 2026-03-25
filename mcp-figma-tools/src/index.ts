#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  extractDesignTokens,
  exportTailwindConfig,
  exportCSSVariables,
} from "./tools/tokenExporter.js";
import {
  generateReactComponents,
  generateComponentWithStory,
  generateComponentProps,
} from "./tools/reactGenerator.js";
import {
  generateVanillaUIComponents,
  generateWebComponents,
  generateHTMLTemplate,
} from "./tools/vanillaUIGenerator.js";
import {
  generateComponentDocumentation,
  generateComponentLibraryDocs,
  generateA11yChecklist,
  generateStorybookConfig,
} from "./tools/docGenerator.js";
import {
  orchestrateFulExport,
  syncFigmaToRepository,
  validateDesignSync,
} from "./tools/coordinator.js";
import type { ExportConfig } from "./types/index.js";

const server = new Server(
  {
    name: "figma-mcp-tools",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Tool definitions
const tools = [
  // Design Token Tools
  {
    name: "extract_design_tokens",
    description:
      "Extract design tokens (colors, spacing, typography) from Figma file",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string", description: "Figma file ID" },
        figmaApiKey: { type: "string", description: "Figma API key" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
  {
    name: "export_tailwind_config",
    description: "Generate Tailwind CSS configuration from design tokens",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
  {
    name: "export_css_variables",
    description: "Generate CSS custom properties from design tokens",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },

  // React Component Tools
  {
    name: "generate_react_components",
    description: "Generate React components from Figma frames",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
        pages: {
          type: "array",
          items: { type: "string" },
          description: "Page names to extract",
        },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
  {
    name: "generate_component_with_story",
    description: "Generate React component with Storybook story",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
        componentName: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey", "componentName"],
    },
  },
  {
    name: "generate_component_props",
    description: "Generate TypeScript props interface for a component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: { type: "string" },
      },
      required: ["componentName"],
    },
  },

  // Vanilla UI Tools
  {
    name: "generate_vanilla_ui",
    description: "Generate vanilla TypeScript + HTML/CSS components",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
  {
    name: "generate_web_components",
    description: "Generate Web Components (custom elements) from Figma",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
  {
    name: "generate_html_template",
    description: "Generate HTML template for a component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: { type: "string" },
      },
      required: ["componentName"],
    },
  },

  // Documentation Tools
  {
    name: "generate_component_docs",
    description: "Generate comprehensive documentation for a component",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
        componentName: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey", "componentName"],
    },
  },
  {
    name: "generate_library_docs",
    description: "Generate component library index and documentation",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
  {
    name: "generate_a11y_checklist",
    description: "Generate accessibility checklist for components",
    inputSchema: {
      type: "object",
      properties: {
        componentNames: { type: "array", items: { type: "string" } },
      },
      required: ["componentNames"],
    },
  },
  {
    name: "generate_storybook_config",
    description: "Generate Storybook configuration file",
    inputSchema: {
      type: "object",
    },
  },

  // Coordinator Tools
  {
    name: "orchestrate_full_export",
    description:
      "Orchestrate complete Figma export with all tools (master command)",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
        pages: { type: "array", items: { type: "string" } },
        usesTailwind: { type: "boolean" },
        usesShadcn: { type: "boolean" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
  {
    name: "sync_figma_to_repo",
    description: "Sync Figma export to repository with proper file structure",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
        repoPath: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey", "repoPath"],
    },
  },
  {
    name: "validate_design_sync",
    description: "Validate design tokens and components are in sync",
    inputSchema: {
      type: "object",
      properties: {
        figmaFileId: { type: "string" },
        figmaApiKey: { type: "string" },
      },
      required: ["figmaFileId", "figmaApiKey"],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args || typeof args !== "object") {
      return { success: false, error: "Missing arguments" };
    }

    const argsTyped = args as Record<string, unknown>;
    const config: ExportConfig = {
      figmaFileId: argsTyped.figmaFileId as string,
      figmaApiKey: argsTyped.figmaApiKey as string,
      outputPath: (argsTyped.outputPath as string) || "./generated",
      pages: argsTyped.pages as string[] | undefined,
      usesTailwind: argsTyped.usesTailwind as boolean | undefined,
      usesShadcn: argsTyped.usesShadcn as boolean | undefined,
    };

    let result;

    switch (name) {
      // Design Token Tools
      case "extract_design_tokens":
        result = await extractDesignTokens(config);
        break;
      case "export_tailwind_config":
        result = await exportTailwindConfig(config);
        break;
      case "export_css_variables":
        result = await exportCSSVariables(config);
        break;

      // React Component Tools
      case "generate_react_components":
        result = await generateReactComponents(config);
        break;
      case "generate_component_with_story":
        result = await generateComponentWithStory(
          config,
          argsTyped.componentName as string,
        );
        break;
      case "generate_component_props":
        result = generateComponentProps(argsTyped.componentName as string);
        break;

      // Vanilla UI Tools
      case "generate_vanilla_ui":
        result = await generateVanillaUIComponents(config);
        break;
      case "generate_web_components":
        result = await generateWebComponents(config);
        break;
      case "generate_html_template":
        result = generateHTMLTemplate(argsTyped.componentName as string);
        break;

      // Documentation Tools
      case "generate_component_docs":
        result = await generateComponentDocumentation(
          config,
          argsTyped.componentName as string,
        );
        break;
      case "generate_library_docs":
        result = await generateComponentLibraryDocs(config);
        break;
      case "generate_a11y_checklist":
        result = generateA11yChecklist(argsTyped.componentNames as string[]);
        break;
      case "generate_storybook_config":
        result = generateStorybookConfig();
        break;

      // Coordinator Tools
      case "orchestrate_full_export":
        result = await orchestrateFulExport(config);
        break;
      case "sync_figma_to_repo":
        result = await syncFigmaToRepository(
          config,
          argsTyped.repoPath as string,
        );
        break;
      case "validate_design_sync":
        result = await validateDesignSync(config);
        break;

      default:
        return {
          content: [
            {
              type: "text",
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Figma MCP server running on stdio");
}

main().catch(console.error);
