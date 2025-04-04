import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
});

if (process.env.NODE_ENV === "development") {
  (apiLimiter as any).skip = (req: any, res: any) => true;
}
