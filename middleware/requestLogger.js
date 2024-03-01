import { LOG_LABELS, log } from "../utils/logger.js";

export function requestLogger(req, res, next) {
  const { method, path } = req;
  log("Request", `🌐 ${method} ${path} \n`);
  next();
}
