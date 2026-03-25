import type {
  ExportConfig,
  GeneratedReactComponent,
  ToolResponse,
} from "../types/index.js";
import { FigmaClient } from "../utils/figmaClient.js";
import {
  ReactComponentGenerator,
  generateReactComponentsFromFigma,
} from "../utils/reactGenerator.js";

export async function generateReactComponents(
  config: ExportConfig,
): Promise<ToolResponse<GeneratedReactComponent[]>> {
  try {
    if (!config.figmaApiKey || !config.figmaFileId) {
      return {
        success: false,
        error: "Missing Figma API key or file ID",
      };
    }

    const client = new FigmaClient(config.figmaApiKey);
    const file = await client.getFile(config.figmaFileId);

    // Extract page names
    const pageNames = client.extractPageNames(file.document);
    const targetPages = config.pages || pageNames.slice(0, 1);

    const components: GeneratedReactComponent[] = [];

    // For each page, extract components
    if (file.document.children) {
      for (const page of file.document.children) {
        if (page.type === "CANVAS" && targetPages.includes(page.name)) {
          const frames = client.extractComponentFrames(page, page.name);
          const pageComponents = generateReactComponentsFromFigma(
            frames,
            page.name,
          );
          components.push(...pageComponents);
        }
      }
    }

    return {
      success: true,
      data: components,
      message: `Generated ${components.length} React components`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate React components: ${error}`,
    };
  }
}

export async function generateComponentWithStory(
  config: ExportConfig,
  componentName: string,
): Promise<ToolResponse<{ component: string; story: string }>> {
  try {
    const componentsResponse = await generateReactComponents(config);
    if (!componentsResponse.success || !componentsResponse.data) {
      return {
        success: false,
        error: "Could not generate components",
      };
    }

    const target = componentsResponse.data.find(
      (c) => c.componentName === componentName,
    );
    if (!target) {
      return {
        success: false,
        error: `Component ${componentName} not found`,
      };
    }

    const generator = new ReactComponentGenerator();
    const story = generator.generateComponentStory(componentName, target.props);

    return {
      success: true,
      data: {
        component: target.content,
        story,
      },
      message: `Generated component and story for ${componentName}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate component with story: ${error}`,
    };
  }
}

export function generateComponentProps(
  componentName: string,
): ToolResponse<Record<string, string>> {
  // This would parse component names and suggest props
  const defaultProps: Record<string, Record<string, string>> = {
    Button: {
      onClick: "() => void",
      variant: "string",
      children: "React.ReactNode",
    },
    Card: {
      title: "string",
      description: "string",
      children: "React.ReactNode",
    },
    Input: {
      value: "string",
      onChange: "(value: string) => void",
      placeholder: "string",
    },
    Modal: {
      isOpen: "boolean",
      onClose: "() => void",
      children: "React.ReactNode",
    },
    Chat: { messages: "Message[]", onSend: "(message: string) => void" },
  };

  const props = defaultProps[componentName] || {
    children: "React.ReactNode",
    className: "string",
  };

  return {
    success: true,
    data: props,
    message: `Props extracted for ${componentName}`,
  };
}
