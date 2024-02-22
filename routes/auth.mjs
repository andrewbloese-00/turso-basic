import { Router } from "express";
import { User, UserInitializer } from "../models/User.mjs";
export const authRouter = Router();

authRouter.route("/signup").post(async (req, res) => {
  const { name, email, password } = req.body;
  const { token, error } = await User.signup(name, email, password);
  if (error) res.status(401).json({ error });
  else res.status(201).json({ token });
});

authRouter.route("/signin").post(async (req, res) => {
  const { email, password } = req.body;
  const { token, error } = await User.signin(email, password);
  if (error) res.status(401).json({ error });
  else res.status(201).json({ token });
});
