import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
export function errorHandler(
  e: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (e instanceof AppError)
    return res
      .status(e.statusCode)
      .json({ success: false, error: { code: e.code, message: e.message } });
  if (e?.code === 11000)
    return res
      .status(409)
      .json({
        success: false,
        error: { code: "CONFLICT", message: "Duplicate resource" },
      });
  console.error(e);
  res
    .status(500)
    .json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
}
