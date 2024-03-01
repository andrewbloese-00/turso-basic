import { LOG_LABELS, log } from "./logger.js";

//handles error logging and messages
export function handleErr(req, res, error, code = 500) {
  log(
    LOG_LABELS.ERR,
    `${req.method} ${req.url} Failed...\n${JSON.stringify(error, null, 4)}\n`,
  );
  res.status(code).json({ error });
}
