import type { FigmaNode, GeneratedReactComponent } from "../types/index.js";

export class ComponentDocGenerator {
  generateAPIDoc(component: GeneratedReactComponent): string {
    return `# ${component.componentName}

## Overview
Auto-generated component from Figma design.

## Props

| Prop | Type | Description | Required |
|------|------|-------------|----------|
${Object.entries(component.props)
  .map(([key, type]) => `| \`${key}\` | \`${type}\` | - | - |`)
  .join("\n")}

## Usage

\`\`\`tsx
import { ${component.componentName} } from './${component.filename.replace(".tsx", "")}';

export function Example() {
  return <${component.componentName} />;
}
\`\`\`

## Accessibility

- [ ] ARIA labels added
- [ ] Keyboard navigation supported
- [ ] Color contrast verified
- [ ] Screen reader tested

## Generated From
- Figma File: [Link]
- Updated: ${new Date().toISOString()}
`;
  }

  generateA11yReport(node: FigmaNode): string {
    const checks = [
      {
        check: "Color Contrast",
        status: "pending",
        note: "Verify WCAG AA or AAA compliance",
      },
      {
        check: "Keyboard Navigation",
        status: "pending",
        note: "Ensure all interactive elements are keyboard accessible",
      },
      {
        check: "ARIA Labels",
        status: "pending",
        note: "Add descriptive labels where needed",
      },
      {
        check: "Focus Management",
        status: "pending",
        note: "Visible focus indicators present",
      },
    ];

    let report = `# Accessibility Report - ${node.name}

## Checklist

| Check | Status | Notes |
|-------|--------|-------|
`;

    checks.forEach((check) => {
      report += `| ${check.check} | ${check.status} | ${check.note} |\n`;
    });

    report += `

## WCAG 2.1 Compliance
- [ ] Level A
- [ ] Level AA
- [ ] Level AAA

## Notes
- Review color contrasts using Figma plugins or WCAG contrast checker
- Test with keyboard navigation only
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Verify focus indicators are visible

## Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Intro to ARIA](https://www.w3.org/WAI/fundamentals/accessibility-intro/)
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
`;

    return report;
  }

  generateUsageExamples(
    componentName: string,
    props: Record<string, any>,
  ): string {
    return `# ${componentName} Usage Examples

## Basic Usage

\`\`\`tsx
import { ${componentName} } from '@/components/${componentName}';

export function BasicExample() {
  return <${componentName} />;
}
\`\`\`

${this.generatePropExamples(componentName, props)}

## Advanced Usage

\`\`\`tsx
import { ${componentName} } from '@/components/${componentName}';
import { useState } from 'react';

export function AdvancedExample() {
  const [state, setState] = useState({});

  return (
    <${componentName}
      ${Object.keys(props)
        .slice(0, 2)
        .map((key) => `${key}={...}`)
        .join("\n      ")}
    />
  );
}
\`\`\`

## Styling

\`\`\`tsx
// Using Tailwind classes
<${componentName} className="w-full h-32" />

// Using CSS modules
import styles from './${componentName}.module.css';
<${componentName} className={styles.root} />
\`\`\`
`;
  }

  private generatePropExamples(
    componentName: string,
    props: Record<string, any>,
  ): string {
    if (Object.keys(props).length === 0) {
      return "";
    }

    let examples = "## With Props\n\n```tsx\n";
    examples += `<${componentName}\n`;

    Object.entries(props).forEach(([key, type]) => {
      if (type.includes("string")) {
        examples += `  ${key}="example"\n`;
      } else if (type.includes("boolean")) {
        examples += `  ${key}={true}\n`;
      } else if (type.includes("number")) {
        examples += `  ${key}={1}\n`;
      } else if (type.includes("function")) {
        examples += `  ${key}={() => console.log('clicked')}\n`;
      }
    });

    examples += `/>\n\`\`\`\n`;
    return examples;
  }

  generateComponentIndex(components: GeneratedReactComponent[]): string {
    let index = `# Component Library

Auto-generated components from Figma.

## Available Components

| Component | Props | File |
|-----------|-------|------|
`;

    components.forEach((component) => {
      const propCount = Object.keys(component.props).length;
      index += `| ${component.componentName} | ${propCount} | \`${component.filename}\` |\n`;
    });

    index += "\n## Quick Start\n\n```bash\n";
    index += "npm install\n";
    index += "npm run dev\n";
    index += "```\n";

    return index;
  }
}

export function generateStandardDocsStructure(
  componentName: string,
): Record<string, string> {
  return {
    "README.md": `# ${componentName} Component

Quick overview of the ${componentName} component.

[See full documentation](./docs/api.md)`,
    "docs/api.md": `# ${componentName} API Reference`,
    "docs/examples.md": `# ${componentName} Examples`,
    "docs/accessibility.md": `# ${componentName} Accessibility`,
  };
}
