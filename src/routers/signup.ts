import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { User } from "../models/user";
const router = express.Router();
router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid."),
    body("password")
      .isLength({ min: 3, max: 20 })
      .withMessage("Password must be within 3-20 characters."),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // check email
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new BadRequestError("Email in use.");
    } else {
      // create user
      const newUser = User.build({ email, password });
      await newUser.save();
      const userJwt = jwt.sign(
        { id: newUser._id, email: newUser.email },
        process.env.JWT_KEY! //ignore typescript error
      );
      req.session = {
        jwt: userJwt,
      };
      return res.status(201).send(newUser);
    }
  }
);
export default router;
