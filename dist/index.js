"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.logger = void 0;
exports.buildMCPUrl = buildMCPUrl;
exports.createTransportOptions = createTransportOptions;
exports.validateMCPConfig = validateMCPConfig;
exports.startMCPServer = startMCPServer;
const mcp_proxy_1 = require("mcp-proxy");
// Re-export logger components for convenience
var logger_1 = require("./logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_1.logger; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_1.LogLevel; } });
/**
 * Constructs the MCP server URL based on configuration
 */
function buildMCPUrl(config) {
    const stack = config.stack || 'prod1a';
    return `https://mcp-${stack}-${config.region}.productmarketingcloud.com/${config.name}/sse`;
}
/**
 * Creates transport options with API key headers
 */
function createTransportOptions(apiKey) {
    const options = {
        requestInit: {}
    };
    if (apiKey) {
        options.requestInit.headers = {
            'X-inRiver-APIKey': apiKey
        };
    }
    return options;
}
/**
 * Validates MCP configuration
 */
function validateMCPConfig(config) {
    const errors = [];
    const validNames = ['query-manager', 'code-writer'];
    const validRegions = ['euw', 'use', 'sea'];
    const validStacks = ['prod1a', 'test1a', 'dev1a', 'dev3a', 'dev4a', 'dev5a'];
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
async function startMCPServer(config) {
    const validation = validateMCPConfig(config);
    if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
    const url = buildMCPUrl(config);
    const transportOptions = createTransportOptions(config.apiKey);
    await (0, mcp_proxy_1.startStdioServer)({
        url,
        serverType: mcp_proxy_1.ServerType.SSE,
        transportOptions
    });
}
//# sourceMappingURL=index.js.map