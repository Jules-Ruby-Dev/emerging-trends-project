import type { ExportConfig, ToolResponse } from "../types/index.js";
import { ComponentDocGenerator } from "../utils/docGenerator.js";
import { generateReactComponents } from "./reactGenerator.js";

export async function generateComponentDocumentation(
  config: ExportConfig,
  componentName: string,
): Promise<ToolResponse<Record<string, string>>> {
  try {
    const componentsResponse = await generateReactComponents(config);
    if (!componentsResponse.success || !componentsResponse.data) {
      return {
        success: false,
        error: "Could not generate components",
      };
    }

    const component = componentsResponse.data.find(
      (c) => c.componentName === componentName,
    );
    if (!component) {
      return {
        success: false,
        error: `Component ${componentName} not found`,
      };
    }

    const docGen = new ComponentDocGenerator();
    const docs: Record<string, string> = {
      "api.md": docGen.generateAPIDoc(component),
      "accessibility.md": docGen.generateA11yReport({
        name: componentName,
        type: "COMPONENT",
        id: "",
      }),
      "examples.md": docGen.generateUsageExamples(
        componentName,
        component.props,
      ),
    };

    return {
      success: true,
      data: docs,
      message: `Generated documentation for ${componentName}`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate documentation: ${error}`,
    };
  }
}

export async function generateComponentLibraryDocs(
  config: ExportConfig,
): Promise<ToolResponse<string>> {
  try {
    const componentsResponse = await generateReactComponents(config);
    if (!componentsResponse.success || !componentsResponse.data) {
      return {
        success: false,
        error: "Could not generate components",
      };
    }

    const docGen = new ComponentDocGenerator();
    const indexDoc = docGen.generateComponentIndex(componentsResponse.data);

    return {
      success: true,
      data: indexDoc,
      message: `Generated component library index for ${componentsResponse.data.length} components`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to generate library docs: ${error}`,
    };
  }
}

export function generateA11yChecklist(
  componentNames: string[],
): ToolResponse<string> {
  let checklist = "# Accessibility Checklist\n\n";

  componentNames.forEach((name) => {
    checklist += `## ${name}\n`;
    checklist += "- [ ] Color contrast (WCAG AA)\n";
    checklist += "- [ ] Keyboard navigation\n";
    checklist += "- [ ] ARIA labels\n";
    checklist += "- [ ] Focus indicators\n";
    checklist += "- [ ] Screen reader tested\n\n";
  });

  return {
    success: true,
    data: checklist,
    message: "A11y checklist generated",
  };
}

export function generateStorybookConfig(): ToolResponse<string> {
  const config = `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts', '../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;
`;

  return {
    success: true,
    data: config,
    message: "Storybook configuration generated",
  };
}
