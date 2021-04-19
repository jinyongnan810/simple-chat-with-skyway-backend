import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { User } from "../models/user";
import { Password } from "../middlewares/services/password";
const router = express.Router();
router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid."),
    body("password").notEmpty().withMessage("Password must be provided."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // find email
    const userFound = await User.findOne({ email });
    if (userFound) {
      if (await Password.compareHash(password, userFound.password)) {
        // success
        const userJwt = jwt.sign(
          { id: userFound._id, email: userFound.email },
          process.env.JWT_KEY! //ignore typescript error
        );
        req.session = {
          jwt: userJwt,
        };
      } else {
        // failed
        throw new BadRequestError("Authentication failed");
      }
    } else {
      throw new BadRequestError("Authentication failed");
    }
    res.send(userFound);
  }
);
export default router;
