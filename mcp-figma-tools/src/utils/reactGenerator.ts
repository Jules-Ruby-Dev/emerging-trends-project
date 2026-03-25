import type { FigmaNode, GeneratedReactComponent } from "../types/index.js";

export class ReactComponentGenerator {
  generateComponent(
    node: FigmaNode,
    componentName: string,
  ): GeneratedReactComponent {
    const props = this.extractProps(node);
    const componentContent = this.generateComponentCode(
      componentName,
      node,
      props,
    );

    return {
      filename: `${this.sanitizeName(componentName)}.tsx`,
      content: componentContent,
      componentName,
      props,
    };
  }

  generateComponentStory(
    componentName: string,
    props: Record<string, any>,
  ): string {
    const santizedName = this.sanitizeName(componentName);
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${santizedName}';

const meta = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  argTypes: {
    ${Object.entries(props)
      .map(
        ([key, type]) => `${key}: { control: '${this.getControlType(type)}' }`,
      )
      .join(",\n    ")}
  },
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ${Object.entries(props)
      .map(([key]) => `${key}: undefined`)
      .join(",\n    ")}
  },
};
`;
  }

  private extractProps(node: FigmaNode): Record<string, string> {
    const props: Record<string, string> = {};

    // Auto-detect common props based on node type
    if (node.type === "TEXT") {
      props["children"] = "string";
      props["className"] = "string";
    } else if (node.type === "FRAME" || node.type === "COMPONENT") {
      props["children"] = "React.ReactNode";
      props["className"] = "string";
    }

    // Check for components with specific names
    if (node.name.includes("Button")) {
      props["onClick"] = "() => void";
      props["variant"] = "string";
    } else if (node.name.includes("Input")) {
      props["value"] = "string";
      props["onChange"] = "(value: string) => void";
      props["placeholder"] = "string";
    } else if (node.name.includes("Card")) {
      props["title"] = "string";
      props["description"] = "string";
    }

    return props;
  }

  private generateComponentCode(
    componentName: string,
    node: FigmaNode,
    props: Record<string, any>,
  ): string {
    const propTypes = Object.entries(props)
      .map(([key, type]) => `  ${key}?: ${type};`)
      .join("\n");

    const propsInterface = propTypes
      ? `interface ${componentName}Props {
${propTypes}
}`
      : "";

    return `'use client';

import React from 'react';

${propsInterface}

export function ${componentName}({ ${Object.keys(props).join(", ")} }: ${componentName}Props${propsInterface ? "" : " = {}"}) {
  return (
    <div className="w-full">
      {/* Generated from Figma: ${node.name} */}
      <div className="flex items-center justify-center p-4">
        <p className="text-gray-500">${componentName} Component</p>
      </div>
    </div>
  );
}
`;
  }

  private getControlType(type: string): string {
    if (type.includes("function")) return "action";
    if (type === "boolean") return "boolean";
    if (type === "number") return "number";
    return "text";
  }

  private sanitizeName(name: string): string {
    return name
      .replaceAll(/\s+/g, "")
      .replaceAll(/[^a-zA-Z0-9]/g, "")
      .replaceAll(/^(\d)/, "_$1");
  }
}

export function generateReactComponentsFromFigma(
  nodes: FigmaNode[],
  pageName: string,
): GeneratedReactComponent[] {
  const generator = new ReactComponentGenerator();
  return nodes.map((node) => {
    const componentName = node.name.replaceAll(/\s+/g, "");
    return generator.generateComponent(node, componentName);
  });
}
