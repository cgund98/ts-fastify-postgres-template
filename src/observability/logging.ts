import pino from "pino";

let logger: pino.Logger | null = null;

logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

export function getLogger(name?: string): pino.Logger {
  logger ??= pino();
  return name ? logger.child({ module: name }) : logger;
}
