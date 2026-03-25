// Figma API types
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  strokes?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  strokeWeight?: number;
  opacity?: number;
  children?: FigmaNode[];
}

export interface FigmaFile {
  document: FigmaNode;
  components?: Record<string, any>;
}

// Design Token types
export interface DesignToken {
  name: string;
  value: string;
  type: "color" | "spacing" | "typography" | "shadow" | "border-radius";
  category?: string;
}

export interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, any>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
}

// React Component types
export interface ReactComponentProps {
  name: string;
  props: Record<string, string>;
  description?: string;
  children?: ReactComponentProps[];
}

export interface GeneratedReactComponent {
  filename: string;
  content: string;
  componentName: string;
  props: Record<string, any>;
}

// Export configuration
export interface ExportConfig {
  figmaFileId: string;
  figmaApiKey: string;
  outputPath: string;
  includeStories?: boolean;
  includeTests?: boolean;
  usesTailwind?: boolean;
  usesShadcn?: boolean;
  tailwindConfig?: Record<string, any>;
  pages?: string[];
}

// Tool response types
export interface ToolResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
