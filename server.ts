// server.ts

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * Create MCP server instance
 */
const server = new Server(
  {
    name: "louie-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // we will define tools here
    },
  },
);

/**
 * Example Tool
 */

/**
 * Start server (stdio transport)
 * This allows AI clients to connect
 */
async function main() {
  const transport = new StdioTransport();
  await server.connect(transport);
}

main();
