import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
export const validate =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    const r = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!r.success)
      return res
        .status(422)
        .json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: r.error.issues.map((i) => i.message).join(", "),
          },
        });
    (req as any).validated = r.data;
    next();
  };
