#!/usr/bin/env node

import { Command } from 'commander';
import { consola } from 'consola';
import { startMCPServer, validateMCPConfig, MCPConfig, MCPName, Region, Stack } from './index';

const program = new Command();

program
  .name('inriver-mcp')
  .description('Inriver MCP utility for connecting to MCP servers')
  .version('1.0.0')
  .argument('<name>', 'MCP server name (query-manager or code-writer)')
  .option('-r, --region <region>', 'Region (euw or use)', 'euw')
  .option('-s, --stack <stack>', 'Stack environment (prod1a or test1a)', 'prod1a')
  .option('-k, --api-key <key>', 'API key for authentication')
  .option('--debug', 'Enable debug logging')
  .action(async (name: string, options: any) => {
    try {
      // Set log level based on options
      consola.level = options.debug ? 5 : 3;

      // Validate MCP name
      const validNames: MCPName[] = ['query-manager', 'code-writer'];
      if (!validNames.includes(name as MCPName)) {
        consola.error(`Invalid MCP name '${name}'. Valid options: ${validNames.join(', ')}`);
        process.exit(1);
      }

      // Validate region
      const validRegions: Region[] = ['euw', 'use', 'sea'];
      if (!validRegions.includes(options.region as Region)) {
        consola.error(`Invalid region '${options.region}'. Valid options: ${validRegions.join(', ')}`);
        process.exit(1);
      }

      // Get API key from option or environment variable
      const apiKey = options.apiKey || process.env.INRIVER_API_KEY;
      if (!apiKey) {
        consola.error('API key is required. Use --api-key option or set INRIVER_API_KEY environment variable.');
        process.exit(1);
      }

      // Create config object
      const config: MCPConfig = {
        name: name as MCPName,
        region: options.region as Region,
        stack: options.stack as Stack,
        apiKey
      };

      // Validate configuration
      const validation = validateMCPConfig(config);
      if (!validation.isValid) {
        validation.errors.forEach((error: string) => consola.error(error));
        process.exit(1);
      }

      consola.debug('Configuration validated successfully');
      consola.debug('Final config:', { ...config, apiKey: '***' });
      consola.debug(`Starting MCP server: ${name} in ${options.region} (${config.stack})`); // Default this to debug since logs cause errors to show up in Claude Desktop
      
      await startMCPServer(config);
    } catch (error) {
      consola.error('Error starting MCP server:', error);
      process.exit(1);
    }
  });

// Add subcommands for additional functionality
program
  .command('list')
  .description('List available MCP servers and regions')
  .action(() => {
    console.log('\nAvailable MCP Servers:');
    console.log('  • query-manager - Query management server');
    console.log('  • code-writer   - Code writing assistance server');
    
    console.log('\nAvailable Regions:');
    console.log('  • euw - Europe West');
    console.log('  • use - US East');
    
    console.log('\nAvailable Stacks:');
    console.log('  • prod1a - Production (default)');
    console.log('  • test1a - Testing');
    
    console.log('\nExample usage:');
    console.log('  inriver-mcp query-manager --region euw --api-key YOUR_API_KEY');
    console.log('  inriver-mcp code-writer --region use --stack test1a --api-key YOUR_API_KEY');
  });

// Parse command line arguments
program.parse();
