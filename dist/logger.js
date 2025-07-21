"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
let currentLogLevel = LogLevel.INFO;
/**
 * Custom logger that writes to stderr to avoid interfering with stdio
 */
exports.logger = {
    setLevel(level) {
        currentLogLevel = level;
    },
    debug(message, ...args) {
        if (currentLogLevel <= LogLevel.DEBUG) {
            const timestamp = new Date().toISOString();
            process.stderr.write(`[${timestamp}] DEBUG: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
        }
    },
    info(message, ...args) {
        if (currentLogLevel <= LogLevel.INFO) {
            const timestamp = new Date().toISOString();
            process.stderr.write(`[${timestamp}] INFO: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
        }
    },
    warn(message, ...args) {
        if (currentLogLevel <= LogLevel.WARN) {
            const timestamp = new Date().toISOString();
            process.stderr.write(`[${timestamp}] WARN: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
        }
    },
    error(message, ...args) {
        if (currentLogLevel <= LogLevel.ERROR) {
            const timestamp = new Date().toISOString();
            process.stderr.write(`[${timestamp}] ERROR: ${message}${args.length ? ' ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') : ''}\n`);
        }
    }
};
//# sourceMappingURL=logger.js.map