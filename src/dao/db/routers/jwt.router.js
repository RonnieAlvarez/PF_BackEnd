import { Router } from "express";
import userModel from "../models/ecommerce.model.js";
import { isValidPassword } from "../../../utils.js";
import { generateJWToken } from "../../../utils.js";
import config from "../../../config/config.js";
import UserDto from "../../DTOs/user.Dto.js";

const router = Router();

/* This code defines a route for handling a POST request to "/current". It expects the request body to
contain an email and password. It then tries to find a user in the database with the given email. If
the user is not found, it returns a 401 error with a message indicating that the user was not found.
If the user is found, it checks if the password is valid using the `isValidPassword` function (which
is not shown in this code snippet). If the password is not valid, it returns a 401 error with a
message indicating that the credentials are invalid. If the password is valid, it generates a JWT
token containing the user's name, email, age, and roll, and sets it as a cookie with the name
"jwtCookieToken". It then sends a response with a message indicating that the login was successful.
If there is an error during this process, it returns a 500 error with a message indicating that
there was an internal error. */
router.post("/current", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await userModel.findOne({ email: email });
    if (!user) {
      if (email === config.adminName && password === config.adminPassword) {
        user = {
          first_name: "Admin",
          last_name: "CoderHouse",
          email: email,
          age: 21,
          roll: "ADMIN",
        };
      } else {
        let message = "User not found: " + email;
        return res.status(401).render("nopage", { messagedanger: `${message}` });
      }
    }
    if (user.loggedBy === "LocalStrategy") {
      if (!isValidPassword(user, password)) {
        let message = "Invalid password for user: " + email;
        return res.status(401).render("nopage", { messagedanger: `${message}` });
      }
    }
    const tokenUser = new UserDto(user);

    const access_token = generateJWToken(tokenUser);
    res.set("Authorization", `Bearer ${access_token}`);
    res.cookie("jwtCookieToken", access_token, {
      maxAge: 8 * 24 * 60 * 60,
      // httpOnly: false // expone la cookie
      httpOnly: true, // No expone la cookie debe ir en true
    });
    user = await userModel.findOneAndUpdate({ email: email }, { $set: { last_connection: new Date() } });
    res.send({ message: "Login successful!" });
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}` });
  }
});

export default router;
