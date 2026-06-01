import winston from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";

const esTransportOpts = {
  level: "info",
  clientOpts: { node: process.env.ELASTICSEARCH_NODE || "http://localhost:9200" },
  indexPrefix: "cinemax-api-logs"
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new ElasticsearchTransport(esTransportOpts)
  ]
});

export const logApi = (mode) => {
    return (req, res, next) => {
        const method = req.method;
        const url = req.originalUrl;
        const ip = req.ip;

        logger.info(`API Access`, {
          method,
          url,
          ip,
          mode,
          timestamp: new Date().toISOString()
        });

        next();
    };
};