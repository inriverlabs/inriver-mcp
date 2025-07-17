import { logger, LogLevel } from '../logger';

describe('Logger', () => {
  let originalWrite: typeof process.stderr.write;
  let writeOutput: string[];

  beforeEach(() => {
    writeOutput = [];
    originalWrite = process.stderr.write;
    process.stderr.write = jest.fn((chunk: any) => {
      writeOutput.push(chunk.toString());
      return true;
    }) as any;
  });

  afterEach(() => {
    process.stderr.write = originalWrite;
  });

  test('should log debug messages when log level is DEBUG', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.debug('Test debug message');
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('DEBUG: Test debug message');
  });

  test('should not log debug messages when log level is INFO', () => {
    logger.setLevel(LogLevel.INFO);
    logger.debug('Test debug message');
    
    expect(writeOutput).toHaveLength(0);
  });

  test('should log error messages at any log level', () => {
    logger.setLevel(LogLevel.ERROR);
    logger.error('Test error message');
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('ERROR: Test error message');
  });

  test('should format log messages with timestamp', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.info('Test message');
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] INFO: Test message/);
  });

  test('should handle additional arguments', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.info('Test message', 'arg1', { key: 'value' });
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('INFO: Test message arg1 {"key":"value"}');
  });

  test('should log info messages when log level is INFO', () => {
    logger.setLevel(LogLevel.INFO);
    logger.info('Test info message');
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('INFO: Test info message');
  });

  test('should log warn messages when log level is WARN', () => {
    logger.setLevel(LogLevel.WARN);
    logger.warn('Test warn message');
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('WARN: Test warn message');
  });

  test('should not log info messages when log level is WARN', () => {
    logger.setLevel(LogLevel.WARN);
    logger.info('Test info message');
    
    expect(writeOutput).toHaveLength(0);
  });

  test('should not log warn messages when log level is ERROR', () => {
    logger.setLevel(LogLevel.ERROR);
    logger.warn('Test warn message');
    
    expect(writeOutput).toHaveLength(0);
  });

  test('should handle empty additional arguments', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.info('Test message');
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('INFO: Test message');
    expect(writeOutput[0]).not.toContain('undefined');
  });

  test('should handle null and undefined arguments', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.info('Test message', null, undefined);
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('INFO: Test message null undefined');
  });

  test('should handle number arguments', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.info('Test message', 42, 3.14);
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('INFO: Test message 42 3.14');
  });

  test('should handle boolean arguments', () => {
    logger.setLevel(LogLevel.DEBUG);
    logger.info('Test message', true, false);
    
    expect(writeOutput).toHaveLength(1);
    expect(writeOutput[0]).toContain('INFO: Test message true false');
  });

  test('should write to stderr and not stdout', () => {
    const originalStdoutWrite = process.stdout.write;
    const stdoutOutput: string[] = [];
    
    // Mock stdout.write to capture any output
    process.stdout.write = jest.fn((chunk: any) => {
      stdoutOutput.push(chunk.toString());
      return true;
    }) as any;

    try {
      logger.setLevel(LogLevel.DEBUG);
      logger.info('Test message for stderr');
      
      // Should have written to stderr (captured in writeOutput)
      expect(writeOutput).toHaveLength(1);
      expect(writeOutput[0]).toContain('INFO: Test message for stderr');
      
      // Should NOT have written to stdout
      expect(stdoutOutput).toHaveLength(0);
    } finally {
      // Restore original stdout.write
      process.stdout.write = originalStdoutWrite;
    }
  });
});
