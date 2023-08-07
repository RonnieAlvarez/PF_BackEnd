import jwt_decode from "jwt-decode";
import { STATUS } from "../config/constants.js";

/**
 * This function checks for a JWT token in the cookies of a request and sets the user property of the
 * request object if the token is valid, otherwise it redirects to the login page.
 * This function checks if the token is the unique token and returns the token jwtcookietoken
 */
export default function auth(req, res, next) {
  try {
    const cookie4 = String(req.cookies.jwtCookieToken);
    const cookieaux = cookie4.split("; ");
    let auxToken;
    let tokens;
    if (cookieaux.length > 1) {
      auxToken = cookieaux.find((cookie) => cookie.startsWith("jwtCookieToken="));
      tokens = auxToken.split("=")[1];
    } else {
      tokens = cookie4;
    }
    if (tokens) {
      const decoded = jwt_decode(tokens);
      let user = decoded.user;
      req.user = user;
      //  console.log(user.roll);
      next(null, req.user);
    }
    if (!req.user) {
      // console.log("auth middleware :" + tokens);
      res.status(401).redirect("/users/login");
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: STATUS.UNAUTHORIZED,
    });
  }
}
