import session from "express-session";

const { COOKIE_MAX_AGE, SESSION_SECRET } = process.env;

export const useSession = session({
  secret: SESSION_SECRET,
  cookie: { maxAge: COOKIE_MAX_AGE, secure: true, sameSite: "strict" },
  resave: false,
  saveUninitialized: false,
  store: new session.MemoryStore(),
});
