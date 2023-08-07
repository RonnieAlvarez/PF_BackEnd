import winston from "winston";
import config from "./config.js";

//Custom logger options:
const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "orange",
    warning: "yellow",
    info: "blue",
    http: "green",
    debug: "white",
  },
};

//Custom Logger:
const devLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize({
      colors: customLevelsOptions.colors,
    }),
    winston.format.simple(),
    winston.format.timestamp(),
    winston.format.printf((info) => `[${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}] - ${info.message}`)
  ),
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(winston.format.colorize({ colors: customLevelsOptions.colors }), winston.format.simple()),
    }),
    new winston.transports.File({
      maxsize: 1024 * 1024,
      maxFiles: 3,
      filename: "./errors.log",
      level: "warning", //Cambiamos el logger level name.
    }),
  ],
});

//Creating our logger:
const prodLogger = winston.createLogger({
  //Declare transports:
  transports: [
    new winston.transports.Console({
      level: "http",
    }),
    new winston.transports.File({
      filename: "./errors.log",
      level: "warning",
    }),
  ],
});

//Declare a middleware:
export const addLogger = (req, res, next) => {
  if (config.environment === "production") {
    req.logger = prodLogger;
  } else {
    req.logger = devLogger;
  }
  req.logger.info(
    `Midleware consola. Level: ${req.logger.level} ${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
  );
  req.logger.warning(
    `Midleware file. Level: ${req.logger.level} ${req.method} en ${req.url} - at ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`
  );
  next();
};
