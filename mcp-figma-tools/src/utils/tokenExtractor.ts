import type { FigmaNode, DesignTokens } from "../types/index.js";
import { figmaColorToHex } from "./figmaClient.js";

export class DesignTokenExtractor {
  extractColors(node: FigmaNode): Record<string, string> {
    const colors: Record<string, string> = {};

    const traverse = (n: FigmaNode) => {
      if (n.fills && n.fills.length > 0) {
        const fill = n.fills[0];
        if (fill.type === "SOLID" && fill.color) {
          const colorName = this.sanitizeName(n.name);
          colors[colorName] = figmaColorToHex(fill.color);
        }
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);
    return colors;
  }

  extractSpacing(node: FigmaNode): Record<string, string> {
    const spacing: Record<string, string> = {};

    // Map to standard spacing scale (8px base)
    const commonSpacing = [2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64];
    commonSpacing.forEach((px) => {
      spacing[`spacing-${px}`] = `${px}px`;
    });

    return spacing;
  }

  extractTypography(node: FigmaNode): Record<string, any> {
    const typography: Record<string, any> = {};

    const traverse = (n: FigmaNode, depth = 0) => {
      if (n.type === "TEXT" || (n as any).style?.fontSize) {
        const fontSize = (n as any).style?.fontSize || 16;
        const fontWeight = (n as any).style?.fontWeight || 400;
        const lineHeight = (n as any).style?.lineHeightPx || fontSize * 1.5;

        const typeName = `${this.sanitizeName(n.name)}-${depth}`;
        typography[typeName] = {
          fontSize: `${fontSize}px`,
          fontWeight,
          lineHeight: `${lineHeight}px`,
        };
      }
      if (n.children) {
        n.children.forEach((child) => traverse(child, depth + 1));
      }
    };

    traverse(node);
    return typography;
  }

  extractShadows(node: FigmaNode): Record<string, string> {
    const shadows: Record<string, string> = {};

    const traverse = (n: FigmaNode) => {
      if ((n as any).effects && (n as any).effects.length > 0) {
        const effect = (n as any).effects[0];
        if (effect.type === "DROP_SHADOW") {
          const shadowName = this.sanitizeName(n.name);
          const shadow = `${effect.offset?.x || 0}px ${effect.offset?.y || 0}px ${effect.radius || 4}px rgba(0, 0, 0, ${effect.color?.a || 0.15})`;
          shadows[shadowName] = shadow;
        }
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);
    return shadows;
  }

  extractBorderRadius(node: FigmaNode): Record<string, string> {
    const borderRadius: Record<string, string> = {};

    const traverse = (n: FigmaNode) => {
      if ((n as any).cornerRadius) {
        const radiusName = this.sanitizeName(n.name);
        borderRadius[radiusName] = `${(n as any).cornerRadius}px`;
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);
    return borderRadius;
  }

  extractAllTokens(node: FigmaNode): DesignTokens {
    return {
      colors: this.extractColors(node),
      spacing: this.extractSpacing(node),
      typography: this.extractTypography(node),
      shadows: this.extractShadows(node),
      borderRadius: this.extractBorderRadius(node),
    };
  }

  private sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replaceAll(/\s+/g, "-")
      .replaceAll(/[^a-z0-9-]/g, "");
  }
}

export function generateTailwindConfig(
  tokens: DesignTokens,
): Record<string, any> {
  return {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: tokens.colors,
        spacing: tokens.spacing,
        fontSize: tokens.typography,
        boxShadow: tokens.shadows,
        borderRadius: tokens.borderRadius,
      },
    },
  };
}

export function generateCSSVariables(tokens: DesignTokens): string {
  let css = ":root {\n";

  Object.entries(tokens.colors).forEach(([key, value]) => {
    css += `  --color-${key}: ${value};\n`;
  });

  Object.entries(tokens.spacing).forEach(([key, value]) => {
    css += `  --${key}: ${value};\n`;
  });

  Object.entries(tokens.shadows).forEach(([key, value]) => {
    css += `  --shadow-${key}: ${value};\n`;
  });

  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    css += `  --radius-${key}: ${value};\n`;
  });

  css += "}\n";
  return css;
}
