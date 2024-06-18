import rateLimit from "express-rate-limit";

// Rate limiter middleware
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many login attempts, please try again after 15 minutes",
});
