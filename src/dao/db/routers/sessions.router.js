import { Router } from "express";
import passport from "passport";
import { generateJWToken, passportCall, authorization } from "../../../utils.js";
import config from "../../../config/config.js";
import UserDto from "../../DTOs/user.Dto.js";
const router = Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => {});

/* This code defines a route for handling the callback from GitHub authentication using Passport.js
middleware. When the user is successfully authenticated, the code retrieves the user information
from the `req.user` object and stores it in the session object as `req.session.user`. It also sets
the `req.session.admin` flag to `true`. Finally, it redirects the user to the `/github` route. If
the authentication fails, it redirects the user to the `/github/error` route. */
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/users/login" }), async (req, res) => {
  req.session.user = new UserDto(req.user);
  res.status(200).redirect("/users/login");
});

/* This code is defining a route for user registration. It uses Passport.js middleware to authenticate
the registration process. If the registration fails, it redirects the user to the `/users/register`
route. If the registration is successful, it returns a status code of 201 and redirects the user to
the `/users/login` route. */
router.post("/register", passport.authenticate("register", { successRedirect: "/users/login", failureRedirect: "/api/jwt/current" }), async (req, res) => {
  req.session.user = new UserDto(req.user._doc);
  return res.status(200).redirect("/users/login");
});

/* This code is defining a route for user login. It uses Passport.js middleware to authenticate the
login process. If the login is successful, it retrieves the user information from the `req.user`
object and stores it in the session object as `req.session.user`. It also sets the
`req.session.login` flag to `true`. Finally, it redirects the user to the home page. If the login
fails, it redirects the user to the `/users/register` route with a status code of 401. It also sets
a cookie with the user's email as the session ID. */
router.post("/login", passport.authenticate("login", { successRedirect: "/", failureRedirect: "/users/register" }), async (req, res) => {
  const { email, password } = req.body;
  if (email === config.adminName && password === config.adminPassword) {
    req.session.user = {
      name: "CoderHouse",
      email: email,
      age: 21,
      roll: "ADMIN",
    };
    return res.status(200).redirect("/");
  }

  const user = UserDto(req.user._doc);
  if (!user) return res.status(401).redirect("/users/register");
  req.session.user = {
    name: user.name,
    email: user.email,
    age: user.age,
    roll: user.roll,
  };
  return res.status(200).redirect("/");
});

export default router;
