import type { ExportConfig, ToolResponse } from "../types/index.js";
import { FigmaClient } from "../utils/figmaClient.js";
import {
  VanillaUIGenerator,
  type GeneratedUIComponent,
  generateWebComponent,
} from "../utils/vanillaUIGenerator.js";

export async function generateVanillaUIComponents(
  config: ExportConfig,
): Promise<ToolResponse<GeneratedUIComponent[]>> {
  try {
    if (!config.figmaApiKey || !config.figmaFileId) {
      return {
        success: false,
        error: "Missing Figma API key or file ID",
      };
    }

    const client = new FigmaClient(config.figmaApiKey);
    const file = await client.getFile(config.figmaFileId);
    const generator = new VanillaUIGenerator();

    const components: GeneratedUIComponent[] = [];

    const pageNames = client.extractPageNames(file.document);
    const targetPages = config.pages || pageNames.slice(0, 1);

    if (file.document.children) {
      for (const page of file.document.children) {
        if (page.type === "CANVAS" && targetPages.includes(page.name)) {
          const frames = client.extractComponentFrames(page, page.name);
          frames.forEach((frame) => {
            const componentName = frame.name.replace(/\s+/g, "");
            const uiComponent = generator.generateUIComponent(
              frame,
              componentName,
            );
            components.push(uiComponent);
          });
        }
      }
    }

    return {
      success: true,
      data: components,
      message: `Generated ${components.length} vanilla TS UI components`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate vanilla UI components: ${error}`,
    };
  }
}

export async function generateWebComponents(
  config: ExportConfig,
): Promise<ToolResponse<Record<string, string>>> {
  try {
    const componentsResponse = await generateVanillaUIComponents(config);
    if (!componentsResponse.success || !componentsResponse.data) {
      return {
        success: false,
        error: "Could not generate vanilla components",
      };
    }

    const webComponents: Record<string, string> = {};

    componentsResponse.data.forEach((component) => {
      const componentName = component.filename
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      webComponents[`${component.filename}-wc.ts`] = generateWebComponent(
        { name: component.filename, type: "FRAME", id: "" } as any,
        componentName,
      );
    });

    return {
      success: true,
      data: webComponents,
      message: `Generated ${Object.keys(webComponents).length} Web Components`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate Web Components: ${error}`,
    };
  }
}

export function generateHTMLTemplate(
  componentName: string,
): ToolResponse<string> {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${componentName}</title>
  <link rel="stylesheet" href="./${componentName}.css" />
</head>
<body>
  <div id="root">
    <div class="${componentName.toLowerCase()}" data-component="${componentName.toLowerCase()}">
      <!-- Content will be rendered here -->
    </div>
  </div>

  <script type="module" src="./${componentName}.ts"></script>
</body>
</html>
`;

  return {
    success: true,
    data: template,
    message: `HTML template generated for ${componentName}`,
  };
}
