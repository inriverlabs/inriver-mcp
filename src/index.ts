import { startStdioServer, ServerType } from 'mcp-proxy';
import { SSEClientTransportOptions } from '@modelcontextprotocol/sdk/client/sse.js';

export type MCPName = 'query-manager' | 'code-writer';
export type Region = 'euw' | 'use' | 'sea';
export type Stack = 'prod1a' | 'test1a' | 'dev1a' | 'dev3a' | 'dev4a' | 'dev5a';

export interface MCPConfig {
  name: MCPName;
  region: Region;
  stack?: Stack;
  apiKey?: string;
}

/**
 * Constructs the MCP server URL based on configuration
 */
export function buildMCPUrl(config: MCPConfig): string {
  const stack = config.stack || 'prod1a';
  return `https://mcp-${stack}-${config.region}-web-app.azurewebsites.net/${config.name}/sse`;
}

/**
 * Creates transport options with API key headers
 */
export function createTransportOptions(apiKey?: string): SSEClientTransportOptions {
  const options: SSEClientTransportOptions = {
    requestInit: {}
  };

  if (apiKey) {
    options.requestInit!.headers = {
      'X-inRiver-APIKey': apiKey
    };
  }

  return options;
}

/**
 * Validates MCP configuration
 */
export function validateMCPConfig(config: MCPConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const validNames: MCPName[] = ['query-manager', 'code-writer'];
  const validRegions: Region[] = ['euw', 'use', 'sea'];
  const validStacks: Stack[] = ['prod1a', 'test1a', 'dev1a', 'dev3a', 'dev4a', 'dev5a'];

  if (!validNames.includes(config.name)) {
    errors.push(`Invalid MCP name '${config.name}'. Valid options: ${validNames.join(', ')}`);
  }

  if (!validRegions.includes(config.region)) {
    errors.push(`Invalid region '${config.region}'. Valid options: ${validRegions.join(', ')}`);
  }

  if (config.stack && !validStacks.includes(config.stack)) {
    errors.push(`Invalid stack '${config.stack}'. Valid options: ${validStacks.join(', ')}`);
  }

  // API key is only required for query-manager
  if (config.name === 'query-manager') {
    if (!config.apiKey || config.apiKey.trim() === '') {
      errors.push('API key is required for query-manager');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Starts the MCP server with the given configuration
 */
export async function startMCPServer(config: MCPConfig): Promise<void> {
  const validation = validateMCPConfig(config);
  if (!validation.isValid) {
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }

  const url = buildMCPUrl(config);
  const transportOptions = createTransportOptions(config.apiKey);

  await startStdioServer({
    url,
    serverType: ServerType.SSE,
    transportOptions
  });
}
