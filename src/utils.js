import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import config from "./config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

/**
 * The function checks if a given password is valid for a user by comparing it with the user's stored
 * password using bcrypt.
 * @param user - The user object contains information about the user, including their password. It is
 * typically an object that contains properties such as username, email, and password.
 * @param password - The password parameter is the password that the user is trying to validate.
 * @returns the result of the comparison between the provided password and the user's password using
 * bcrypt's compareSync method.
 */
export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

const PRIVATE_KEY = config.jwtKey;

/**
 * This function generates a JSON Web Token (JWT) for a given user with a 24-hour expiration time.
 */
export const generateJWToken = (user) => {
  const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: "24h" });
  return token;
};

/**
 * This is a middleware function that verifies the authenticity of a token in the authorization header
 * of a request and grants access to the next function if the token is valid.
 */
export const authToken = (req, res, next) => {
  const authHeader = req.cookies.jwtCookieToken ? req.cookies.jwtCookieToken : req.headers.cookie; //inicialmente era headers.authorization
  if (!authHeader) return res.status(401).json({ message: "Token no valido", error: "Not autorized" });
  const token = authHeader;
  jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
    if (error) return res.status(403).json({ message: "Token no valido", error: "Not autorized" });
    req.user = credentials.user;
    next();
  });
};

/**
 * This is a function that returns a middleware for authenticating a user using a specified passport
 * strategy.
 */
export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.status(401).redirect("/login");
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

/**
 * This is a middleware function that checks if the user has the required role to access a certain
 * route.
 */
export const authorization = (roll) => {
  return async (req, res, next) => {
    const userRole = req.user.roll.toUpperCase();
    const allowedRoles = roll.map((elementos) => {
      return elementos.toUpperCase();
    });
    const singleName = req.user.name.split(" ")[0];
    if (!req.user) return res.status(401).render("nopage", { message: `Unauthorized: User ${singleName} not found in JWT.`, user: req.user });
    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .render("nopage", { messagedanger: `Forbidden: The User ${singleName} doesn't have permission with the ${req.user.roll} roll.`, user: req.user });
    }
    next();
  };
};

export default __dirname;
