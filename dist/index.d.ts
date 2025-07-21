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
export { logger, LogLevel } from './logger';
/**
 * Constructs the MCP server URL based on configuration
 */
export declare function buildMCPUrl(config: MCPConfig): string;
/**
 * Creates transport options with API key headers
 */
export declare function createTransportOptions(apiKey?: string): SSEClientTransportOptions;
/**
 * Validates MCP configuration
 */
export declare function validateMCPConfig(config: MCPConfig): {
    isValid: boolean;
    errors: string[];
};
/**
 * Starts the MCP server with the given configuration
 */
export declare function startMCPServer(config: MCPConfig): Promise<void>;
//# sourceMappingURL=index.d.ts.map