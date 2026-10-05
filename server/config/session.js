import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db/pool.js";
import { env } from "./env.js";

export const SESSION_COOKIE = "sid";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // US-03 CA4

const PgStore = connectPgSimple(session);

// Les sessions sont stockées dans la table "session" de Postgres (pas de Redis).
export const sessionMiddleware = session({
  store: new PgStore({ pool, tableName: "session" }),
  name: SESSION_COOKIE,
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    maxAge: SEVEN_DAYS_MS,
  },
});
