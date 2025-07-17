import { 
  startMCPServer, 
  buildMCPUrl, 
  createTransportOptions, 
  validateMCPConfig, 
  MCPConfig,
  MCPName,
  Region,
  Stack,
  logger,
  LogLevel
} from '../index';

// Mock the mcp-proxy module
jest.mock('mcp-proxy', () => ({
  startStdioServer: jest.fn(),
  ServerType: {
    SSE: 'SSE'
  }
}));

// Mock the custom logger
jest.mock('../logger', () => ({
  logger: {
    setLevel: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  LogLevel: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  }
}));

import { startStdioServer } from 'mcp-proxy';

const mockedStartStdioServer = startStdioServer as jest.MockedFunction<typeof startStdioServer>;

describe('MCP Server', () => {
  let config: MCPConfig;

  beforeEach(() => {
    config = {
      name: 'query-manager',
      region: 'euw',
      stack: 'test1a',
      apiKey: 'test-api-key'
    };
    jest.clearAllMocks();
  });

  describe('MCPConfig', () => {
    test('should create MCP config with required fields', () => {
      expect(config.name).toBe('query-manager');
      expect(config.region).toBe('euw');
      expect(config.apiKey).toBe('test-api-key');
    });

    test('should use default stack when not provided', () => {
      const configWithoutStack: MCPConfig = {
        name: 'code-writer',
        region: 'use',
        apiKey: 'test-key'
      };
      
      expect(configWithoutStack.stack).toBeUndefined();
    });

    test('should accept valid MCP names', () => {
      const queryManagerConfig: MCPConfig = { ...config, name: 'query-manager' };
      const codeWriterConfig: MCPConfig = { ...config, name: 'code-writer' };
      
      expect(queryManagerConfig.name).toBe('query-manager');
      expect(codeWriterConfig.name).toBe('code-writer');
    });

    test('should accept valid regions', () => {
      const euwConfig: MCPConfig = { ...config, region: 'euw' };
      const useConfig: MCPConfig = { ...config, region: 'use' };
      const seaConfig: MCPConfig = { ...config, region: 'sea' };
      
      expect(euwConfig.region).toBe('euw');
      expect(useConfig.region).toBe('use');
      expect(seaConfig.region).toBe('sea');
    });

    test('should accept valid stacks', () => {
      const stacks: Stack[] = ['prod1a', 'test1a', 'dev1a', 'dev3a', 'dev4a', 'dev5a'];
      
      stacks.forEach(stack => {
        const stackConfig: MCPConfig = { ...config, stack };
        expect(stackConfig.stack).toBe(stack);
      });
    });
  });

  describe('buildMCPUrl', () => {
    test('should build URL with default stack', () => {
      const configWithoutStack = { ...config };
      delete configWithoutStack.stack;
      
      const url = buildMCPUrl(configWithoutStack);
      expect(url).toBe('https://mcp-prod1a-euw.productmarketingcloud.com/query-manager/sse');
    });

    test('should build URL with custom stack', () => {
      const url = buildMCPUrl(config);
      expect(url).toBe('https://mcp-test1a-euw.productmarketingcloud.com/query-manager/sse');
    });

    test('should build URL for different regions', () => {
      const useConfig = { ...config, region: 'use' as Region };
      const seaConfig = { ...config, region: 'sea' as Region };
      
      expect(buildMCPUrl(useConfig)).toBe('https://mcp-test1a-use.productmarketingcloud.com/query-manager/sse');
      expect(buildMCPUrl(seaConfig)).toBe('https://mcp-test1a-sea.productmarketingcloud.com/query-manager/sse');
    });

    test('should build URL for different MCP names', () => {
      const codeWriterConfig = { ...config, name: 'code-writer' as MCPName };
      
      expect(buildMCPUrl(codeWriterConfig)).toBe('https://mcp-test1a-euw.productmarketingcloud.com/code-writer/sse');
    });
  });

  describe('createTransportOptions', () => {
    test('should create transport options with API key header', () => {
      const transportOptions = createTransportOptions('test-api-key');
      
      expect(transportOptions).toEqual({
        requestInit: {
          headers: {
            'X-inRiver-APIKey': 'test-api-key'
          }
        }
      });
    });

    test('should create transport options without API key header when no key provided', () => {
      const transportOptions = createTransportOptions();
      
      expect(transportOptions).toEqual({
        requestInit: {}
      });
    });

    test('should create transport options without API key header when undefined key provided', () => {
      const transportOptions = createTransportOptions(undefined);
      
      expect(transportOptions).toEqual({
        requestInit: {}
      });
    });

    test('should handle different API keys', () => {
      const transportOptions = createTransportOptions('different-key');
      
      expect(transportOptions.requestInit?.headers).toEqual({
        'X-inRiver-APIKey': 'different-key'
      });
    });
  });

  describe('validateMCPConfig', () => {
    test('should validate correct configuration for query-manager', () => {
      const validation = validateMCPConfig(config);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate correct configuration for code-writer without API key', () => {
      const codeWriterConfig = {
        name: 'code-writer' as MCPName,
        region: 'euw' as Region,
        stack: 'test1a' as Stack
      };
      const validation = validateMCPConfig(codeWriterConfig);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject invalid MCP name', () => {
      const invalidConfig = { ...config, name: 'invalid-name' as MCPName };
      const validation = validateMCPConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Invalid MCP name 'invalid-name'. Valid options: query-manager, code-writer");
    });

    test('should reject invalid region', () => {
      const invalidConfig = { ...config, region: 'invalid-region' as Region };
      const validation = validateMCPConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Invalid region 'invalid-region'. Valid options: euw, use, sea");
    });

    test('should reject invalid stack', () => {
      const invalidConfig = { ...config, stack: 'invalid-stack' as Stack };
      const validation = validateMCPConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Invalid stack 'invalid-stack'. Valid options: prod1a, test1a, dev1a, dev3a, dev4a, dev5a");
    });

    test('should reject empty API key for query-manager', () => {
      const invalidConfig = { ...config, apiKey: '' };
      const validation = validateMCPConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('API key is required for query-manager');
    });

    test('should reject whitespace-only API key for query-manager', () => {
      const invalidConfig = { ...config, apiKey: '   ' };
      const validation = validateMCPConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('API key is required for query-manager');
    });

    test('should reject missing API key for query-manager', () => {
      const invalidConfig = { ...config };
      delete invalidConfig.apiKey;
      const validation = validateMCPConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('API key is required for query-manager');
    });

    test('should allow missing API key for code-writer', () => {
      const codeWriterConfig = {
        name: 'code-writer' as MCPName,
        region: 'euw' as Region,
        stack: 'test1a' as Stack
      };
      const validation = validateMCPConfig(codeWriterConfig);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should allow empty API key for code-writer', () => {
      const codeWriterConfig = {
        name: 'code-writer' as MCPName,
        region: 'euw' as Region,
        stack: 'test1a' as Stack,
        apiKey: ''
      };
      const validation = validateMCPConfig(codeWriterConfig);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should collect multiple validation errors', () => {
      const invalidConfig = {
        name: 'invalid-name' as MCPName,
        region: 'invalid-region' as Region,
        stack: 'invalid-stack' as Stack,
        apiKey: ''
      };
      const validation = validateMCPConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3); // name, region, stack (no API key error since name is invalid)
    });

    test('should allow undefined stack (uses default)', () => {
      const configWithoutStack = { ...config };
      delete configWithoutStack.stack;
      
      const validation = validateMCPConfig(configWithoutStack);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('startMCPServer', () => {
    test('should start server with valid configuration for query-manager', async () => {
      mockedStartStdioServer.mockResolvedValue({} as any);
      
      await startMCPServer(config);
      
      expect(mockedStartStdioServer).toHaveBeenCalledWith({
        url: 'https://mcp-test1a-euw.productmarketingcloud.com/query-manager/sse',
        serverType: 'SSE',
        transportOptions: {
          requestInit: {
            headers: {
              'X-inRiver-APIKey': 'test-api-key'
            }
          }
        }
      });
    });

    test('should start server with valid configuration for code-writer without API key', async () => {
      const codeWriterConfig = {
        name: 'code-writer' as MCPName,
        region: 'euw' as Region,
        stack: 'test1a' as Stack
      };
      
      mockedStartStdioServer.mockResolvedValue({} as any);
      
      await startMCPServer(codeWriterConfig);
      
      expect(mockedStartStdioServer).toHaveBeenCalledWith({
        url: 'https://mcp-test1a-euw.productmarketingcloud.com/code-writer/sse',
        serverType: 'SSE',
        transportOptions: {
          requestInit: {}
        }
      });
    });

    test('should throw error for invalid configuration', async () => {
      const invalidConfig = { ...config, name: 'invalid-name' as MCPName };
      
      await expect(startMCPServer(invalidConfig)).rejects.toThrow(
        "Invalid configuration: Invalid MCP name 'invalid-name'. Valid options: query-manager, code-writer"
      );
      
      expect(mockedStartStdioServer).not.toHaveBeenCalled();
    });

    test('should throw error for query-manager without API key', async () => {
      const invalidConfig = { ...config };
      delete invalidConfig.apiKey;
      
      await expect(startMCPServer(invalidConfig)).rejects.toThrow(
        "Invalid configuration: API key is required for query-manager"
      );
      
      expect(mockedStartStdioServer).not.toHaveBeenCalled();
    });

    test('should propagate errors from startStdioServer', async () => {
      const error = new Error('Connection failed');
      mockedStartStdioServer.mockRejectedValue(error);
      
      await expect(startMCPServer(config)).rejects.toThrow('Connection failed');
    });

    test('should not log anything to stdout during server start', async () => {
      const originalWrite = process.stdout.write;
      const stdoutOutput: string[] = [];
      
      // Mock stdout.write to capture any output
      process.stdout.write = jest.fn((chunk: any) => {
        stdoutOutput.push(chunk.toString());
        return true;
      }) as any;

      try {
        mockedStartStdioServer.mockResolvedValue({} as any);
        
        await startMCPServer(config);
        
        // Verify no output was written to stdout
        expect(stdoutOutput).toHaveLength(0);
        expect(mockedStartStdioServer).toHaveBeenCalled();
      } finally {
        // Restore original stdout.write
        process.stdout.write = originalWrite;
      }
    });

    test('should not log anything to stdout even when server start fails', async () => {
      const originalWrite = process.stdout.write;
      const stdoutOutput: string[] = [];
      
      // Mock stdout.write to capture any output
      process.stdout.write = jest.fn((chunk: any) => {
        stdoutOutput.push(chunk.toString());
        return true;
      }) as any;

      try {
        const error = new Error('Connection failed');
        mockedStartStdioServer.mockRejectedValue(error);
        
        await expect(startMCPServer(config)).rejects.toThrow('Connection failed');
        
        // Verify no output was written to stdout even on error
        expect(stdoutOutput).toHaveLength(0);
      } finally {
        // Restore original stdout.write
        process.stdout.write = originalWrite;
      }
    });
  });
});
