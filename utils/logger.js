//Basic logger, currently outputs to console, easy to extend later if needed
const ERR = "err";
const WARN = "warn";
const INFO = "info";
const LOG = "log";
export const LOG_LABELS = { ERR, WARN, INFO, LOG };

export const log = async (label, args) => {
  const t = new Date().toString();
  // output to console
  if (label === ERR) {
    console.warn(`[Error]`, t);
    console.error(args);
  }
  if (label === WARN) {
    console.warn("[Warning] ", t);
    console.warn(args);
  }

  if (label === INFO) {
    console.warn("[Info] ", t);
    console.info(args);
  } else {
    console.log(`[${label}]`, t);
    console.log(args);
  }
};
