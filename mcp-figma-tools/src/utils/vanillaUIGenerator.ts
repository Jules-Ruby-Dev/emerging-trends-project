import type { FigmaNode } from "../types/index.js";

export interface GeneratedUIComponent {
  html: string;
  css: string;
  ts: string;
  filename: string;
}

export class VanillaUIGenerator {
  generateUIComponent(
    node: FigmaNode,
    componentName: string,
  ): GeneratedUIComponent {
    const html = this.generateHTML(node, componentName);
    const css = this.generateCSS(node, componentName);
    const ts = this.generateTypeScript(node, componentName);

    return {
      html,
      css,
      ts,
      filename: this.sanitizeName(componentName),
    };
  }

  private generateHTML(node: FigmaNode, componentName: string): string {
    const className = `${this.sanitizeName(componentName)}`;

    return `<!-- Generated from Figma: ${node.name} -->
<div class="${className}" id="${className}">
  ${this.generateNodeHTML(node, 1)}
</div>
`;
  }

  private generateNodeHTML(node: FigmaNode, depth: number): string {
    const indent = "  ".repeat(depth);
    const className = `${this.sanitizeName(node.name)}`;

    if (node.type === "TEXT") {
      return `${indent}<span class="${className}">${node.name}</span>`;
    }

    if (node.type === "FRAME" || node.type === "COMPONENT") {
      let html = `${indent}<div class="${className}">\\n`;
      if (node.children) {
        html += node.children
          .map((child) => this.generateNodeHTML(child, depth + 1))
          .join("\\n");
      }
      html += `\\n${indent}</div>`;
      return html;
    }

    return `${indent}<div class="${className}"></div>`;
  }

  private generateCSS(node: FigmaNode, componentName: string): string {
    const className = this.sanitizeName(componentName);

    return `.${className} {
  /* Generated from Figma component: ${node.name} */
  display: flex;
  flex-direction: column;
}

${this.generateNodeCSS(node, 1)}
`;
  }

  private generateNodeCSS(node: FigmaNode, depth: number): string {
    const className = this.sanitizeName(node.name);
    let css = "";

    if (node.absoluteBoundingBox) {
      css += `.${className} {
  width: ${node.absoluteBoundingBox.width}px;
  height: ${node.absoluteBoundingBox.height}px;
}
`;
    }

    if (node.children) {
      node.children.forEach((child) => {
        css += this.generateNodeCSS(child, depth + 1);
      });
    }

    return css;
  }

  private generateTypeScript(node: FigmaNode, componentName: string): string {
    const className = this.sanitizeName(componentName);

    return `/**
 * Generated from Figma component: ${node.name}
 * Component: ${componentName}
 */

interface ${componentName}Options {
  selector?: string;
  data?: Record<string, any>;
}

export class ${componentName} {
  private element: HTMLElement | null;
  private options: ${componentName}Options;

  constructor(options: ${componentName}Options = {}) {
    this.options = options;
    this.element = document.querySelector(options.selector || '.${className}');
    this.init();
  }

  private init(): void {
    if (!this.element) {
      console.error('${className} element not found');
      return;
    }
    this.setup();
  }

  private setup(): void {
    // Setup event listeners and state
  }

  public destroy(): void {
    if (this.element) {
      // Cleanup
    }
  }
}

// Auto-initialize if data attribute is present
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-component="${className}"]');
  elements.forEach((el) => {
    new ${componentName}({ selector: '.' + el.className });
  });
});

export default ${componentName};
`;
  }

  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-z0-9-]/g, "");
  }
}

export function generateWebComponent(
  node: FigmaNode,
  componentName: string,
): string {
  const tagName = componentName
    .split(/(?=[A-Z])/)
    .join("-")
    .toLowerCase();

  return `import { VanillaUIGenerator } from './vanilla-ui-generator.js';

class ${componentName} extends HTMLElement {
  private generator: VanillaUIGenerator;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    
    const container = document.createElement('div');
    container.innerHTML = this.getTemplate();
    
    this.shadowRoot?.appendChild(style);
    this.shadowRoot?.appendChild(container);
  }

  private getTemplate(): string {
    return \`
      <!-- Web component template for ${componentName} -->
      <div class="${tagName}-container">
        <slot></slot>
      </div>
    \`;
  }

  private getStyles(): string {
    return \`
      :host {
        display: block;
      }
    \`;
  }
}

customElements.define('${tagName}', ${componentName});
`;
}
