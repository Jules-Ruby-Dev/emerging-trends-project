import axios, { AxiosInstance } from "axios";
import type { FigmaFile, FigmaNode } from "../types/index.js";

export class FigmaClient {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: "https://api.figma.com/v1",
      headers: {
        "X-Figma-Token": apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  async getFile(fileId: string): Promise<FigmaFile> {
    try {
      const response = await this.client.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Figma file: ${error}`);
    }
  }

  async getFileNodes(
    fileId: string,
    nodeIds: string[],
  ): Promise<Record<string, FigmaNode>> {
    try {
      const response = await this.client.get(`/files/${fileId}/nodes`, {
        params: {
          ids: nodeIds.join(","),
        },
      });
      return response.data.nodes;
    } catch (error) {
      throw new Error(`Failed to fetch Figma nodes: ${error}`);
    }
  }

  async getComponents(fileId: string): Promise<any> {
    try {
      const response = await this.client.get(`/files/${fileId}/components`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch Figma components: ${error}`);
    }
  }

  extractPageNames(document: FigmaNode): string[] {
    if (!document.children) return [];
    return document.children
      .filter((child) => child.type === "CANVAS")
      .map((page) => page.name);
  }

  extractComponentFrames(node: FigmaNode, pageName: string): FigmaNode[] {
    const frames: FigmaNode[] = [];

    const traverse = (n: FigmaNode) => {
      if (n.type === "COMPONENT" || n.type === "FRAME") {
        frames.push(n);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };

    traverse(node);
    return frames;
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("")}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16) / 255,
        g: Number.parseInt(result[2], 16) / 255,
        b: Number.parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 };
}

export function figmaColorToHex(figmaColor: {
  r: number;
  g: number;
  b: number;
  a?: number;
}): string {
  return rgbToHex(figmaColor.r, figmaColor.g, figmaColor.b);
}
