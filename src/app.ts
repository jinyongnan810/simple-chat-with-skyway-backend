import express from "express";
require("express-async-errors");
import { json } from "body-parser";
import morgan from "morgan";
import cors from "cors";

import cookieSesion from "cookie-session";

import CurrentUserRouter from "./routers/current-user";
import SignInRouter from "./routers/signin";
import SignOutRouter from "./routers/signout";
import SignUpRouter from "./routers/signup";
import { NotFoundError } from "./errors/not-found-error";
import { handleError } from "./middlewares/error-handler";

const app = express();
var corsOptions = {
  origin: "http://localhost:4000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.set("trust proxy", true); //trust ingress nginx
app.use(
  cookieSesion({
    signed: false, // no encryption
    secure: false, //process.env.NODE_ENV === "production", // only https
    sameSite: "none",
  })
);
app.use(json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

app.use(CurrentUserRouter);
app.use(SignInRouter);
app.use(SignOutRouter);
app.use(SignUpRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(handleError);

export { app };
