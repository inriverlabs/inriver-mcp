#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const index_1 = require("./index");
const program = new commander_1.Command();
program
    .name('inriver-mcp')
    .description('Inriver MCP utility for connecting to MCP servers')
    .version('1.0.0')
    .argument('<name>', 'MCP server name (query-manager or code-writer)')
    .option('-r, --region <region>', 'Region (euw or use)', 'euw')
    .option('-s, --stack <stack>', 'Stack environment (prod1a or test1a)', 'prod1a')
    .option('-k, --api-key <key>', 'API key for authentication (required for query-manager)')
    .option('--debug', 'Enable debug logging')
    .action(async (name, options) => {
    try {
        // Set log level based on options
        index_1.logger.setLevel(options.debug ? index_1.LogLevel.DEBUG : index_1.LogLevel.INFO);
        // Validate MCP name
        const validNames = ['query-manager', 'code-writer'];
        if (!validNames.includes(name)) {
            index_1.logger.error(`Invalid MCP name '${name}'. Valid options: ${validNames.join(', ')}`);
            process.exit(1);
        }
        // Validate region
        const validRegions = ['euw', 'use', 'sea'];
        if (!validRegions.includes(options.region)) {
            index_1.logger.error(`Invalid region '${options.region}'. Valid options: ${validRegions.join(', ')}`);
            process.exit(1);
        }
        // Get API key from option or environment variable
        const apiKey = options.apiKey || process.env.INRIVER_API_KEY;
        // For query-manager, API key is required
        if (name === 'query-manager' && !apiKey) {
            index_1.logger.error('API key is required for query-manager. Provide it via --api-key option or INRIVER_API_KEY environment variable.');
            process.exit(1);
        }
        // Create config object
        const config = {
            name: name,
            region: options.region,
            stack: options.stack,
            ...(apiKey && { apiKey })
        };
        // Validate configuration
        const validation = (0, index_1.validateMCPConfig)(config);
        if (!validation.isValid) {
            validation.errors.forEach((error) => index_1.logger.error(error));
            process.exit(1);
        }
        index_1.logger.info('Configuration validated successfully');
        index_1.logger.debug('Final config:', { ...config, apiKey: config.apiKey ? '***' : undefined });
        index_1.logger.info(`Starting MCP server: ${name} in ${options.region} (${config.stack})`);
        await (0, index_1.startMCPServer)(config);
    }
    catch (error) {
        index_1.logger.error('Error starting MCP server:', error);
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
    console.log('  inriver-mcp code-writer --region use --stack test1a');
});
// Parse command line arguments
program.parse();
//# sourceMappingURL=cli.js.map