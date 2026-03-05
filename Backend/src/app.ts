import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { globalErrorMiddleware } from "./middleware/globalErrorMiddleware";
import { ApplicationError } from "./utils/errors/applicationError";
import authRouter from "./routes/authRoutes";
import { APPLICATION_MESSAGES } from "./utils/messages/applicationMessages";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);


app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new ApplicationError(APPLICATION_MESSAGES.ERROR.ROUTE_NOT_FOUND, 404));
});

app.use(globalErrorMiddleware);

export default app;
