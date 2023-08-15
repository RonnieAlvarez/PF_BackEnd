import { UserModel } from "../models/ecommerce.model.js";
import config from "../../../config/config.js";
import nodemailer from "nodemailer";
import { isValidPassword } from "../../../utils.js";
import bcrypt from "bcrypt";
import __dirname from "../../../utils.js";
import * as UserService from "../services/users.service.js";

import multer from "multer";
import fs from "fs";
import path from "path";

const storage = (folderName) => {
  //  try {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      let userEmail = req.user.email;
      userEmail = userEmail.split("@")[0];
      if (!fs.existsSync(`${__dirname}/public/uploads/${userEmail}`)) {
        fs.mkdir(`${__dirname}/public/uploads/${userEmail}`, (err) => {
          if (err) throw err;
          console.log("Folder created");
        });
      }
      if (!fs.existsSync(`${__dirname}/public/uploads/${userEmail}/${folderName}`)) {
        fs.mkdir(`${__dirname}/public/uploads/${userEmail}/${folderName}`, (err) => {
          if (err) throw err;
          console.log("Folder created");
        });
      }

      cb(null, `${__dirname}/public/uploads/${userEmail}/${folderName}`);
    },
    filename: function (req, file, cb) {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  });
  // } catch (error) {
  //   return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  // }
};

const docFilter = (req, file, cb) => {
  const allowedTypes = ["text/plain", "text/doc"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed types are text/plain, text/doc."));
  }
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Allowed types are image/jpeg, image/jpg, and image/png."));
  }
};

export const uploadDocument = multer({ storage: storage("documents"), fileFilter: docFilter });
export const uploadProfileImage = multer({ storage: storage("profile"), fileFilter: imageFilter });
export const uploadProductImage = multer({ storage: storage("products"), fileFilter: imageFilter });

export function loadProductsImages() {
  ulproimgs;
}
export function loadProfileImage() {
  ulimgs;
}

export function loadUserDocumentation() {
  uldocs;
}

/**
 * This JavaScript function handles the forgot password functionality by sending a reset password email
 * to the user.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made to the server. It includes details such as the request headers, request body, request
 * method, and request URL. In this code snippet, `req` is used to access the request body (`req.body`)
 * which
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It is an instance of the Express `Response` object and has methods like `status`,
 * `render`, and `send` that can be used to send the response.
 */
export async function forgot_password(req, res) {
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      ca: null,
      secure: false,
      auth: {
        user: config.GOOGLE_CLIENT_EMAIL,
        pass: config.GOOGLE_CLIENT_SECRET,
      },
    });
    transport.verify(function (error) {
      if (error) {
        res.status(400).render("nopage", { messagedanger: `${error.message}`, user: req.user });
      }
    });
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(400).render("nopage", { messagedanger: `User not found !!`, user: req.user });
    }
    const token = Math.random().toString(36).substring(2) + Date.now();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();
    const url = `${req.protocol}://${req.hostname}:${config.port}/users/reset-password/${token}`;
    const mailOptions = {
      from: "eCommerce shop 🛒 " + config.GOOGLE_CLIENT_EMAIL,
      to: email,
      subject: "Reset Password",
      //text: `To Reser your Password , click the link: ` + url,
      html: ` 
    <div style="background-color: #0DCAF0; height:200px; border: 2px solid darkgrey; border-radius: 30px; padding: 30px; text-align: center;">
      <h1>Reset Password</h1>
      <h3 style="font-weight: bold;margin-botton:20px;">To Reset your Password ,
       click the link <strong>below:</h3><br>
       <h2><a href='${url}'>RESET PASSWORD</a></strong></h2><br>
    </div>

    `,
    };
    const sendMail = async () => {
      await transport.sendMail(mailOptions);
    };
    sendMail();
    res.status(200).render("nopage", { messageSuccess: "We send you an email with the link to Reset the Password !!", user: req.user });
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}
/**
 * The `reset_password` function is an asynchronous function that handles the reset password
 * functionality by rendering a form for the user to enter a new password.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made to the server. It includes details such as the request method, headers, URL parameters,
 * query parameters, and body data.
 * @param res - The `res` parameter is the response object that is used to send a response back to the
 * client. It contains methods and properties that allow you to control the response, such as setting
 * the status code, headers, and sending the response body. In this code, the `res` object is used
 */
export async function reset_password(req, res) {
  try {
    const { token } = req.params;
    const user = await UserModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      res.status(400).render("nopage", { messagedanger: "Link to Reset the Password invalid or expired !!", user: req.user });
      setTimeout(() => {
        try {
          res.status(401).redirect("/users/login");
        } catch (error) {
          res.status(400).render("nopage", { messagedanger: `${error.message}`, user: req.user });
        }
      }, 2000);
    }
    res.send(`
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DESAFIO Passport - GitHub</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    
</head>

<body class="bg-ligth">
    <div class="container my-1 d-flex flex-column sticky-top bg-dark p-2 rounded">
        <span class="d-sm-inline-flex text-center align-middle justify-content-center text-light fs-4 fw-bold opacity-75">
        Back-end Final Project </span>
    </div>
    
  <div id="login" class="container bg-info rounded mt-3 pb-2" style="width:500px">
    <h3 class="text-center text-white pb-2">My eCommerce App</h3>
    <div class="container border border-secondary rounded p-3 m-2">
        <form class="m-2" action="/users/postResetPassword/${token}" method="post">
          <input type="password" name="password" placeholder="Reset Password" required>
          <input type="submit" value="Restablecer contraseña">
          <p>minimum 8 long and minimum 4 letters</p>
        </form>
    </div>
  </div>
</body>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
    crossorigin="anonymous"></script>
</html>
  `);
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

/**
 * This function handles the reset password functionality by validating the token, checking the
 * password requirements, hashing the new password, and updating the user's password in the database.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made by the client. It includes details such as the request headers, request parameters,
 * request body, etc. In this code snippet, `req` is used to access the `params` and `body` properties.
 * @param res - The `res` parameter is the response object that is used to send a response back to the
 * client. It contains methods and properties that allow you to control the response, such as setting
 * the status code, headers, and sending data back to the client. In this code snippet, the `res`
 * @returns a response with the appropriate status code and rendering a view with a message indicating
 * the result of the password reset process.
 */
export async function postResetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await UserModel.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).render("nopage", { messagedanger: `Link to Reset the Password invalid or expired !! ` });
    }
    if (isValidPassword(user, password)) {
      return res.status(400).render("nopage", { messagedanger: "The Password could'nt be the same !!" });
    }
    if (!validarPassword(password)) {
      return res
        .status(400)
        .render("nopage", { messagedanger: "The password does not meet the requirements !! \n 8+ alphanum chars, 1+ num, and non-alphanum chars" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(401).redirect("/users/login");
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

/**
 * The function `validarPassword` checks if a password meets certain criteria.
 * @param password - The `password` parameter is a string that represents the password that needs to be
 * validated.
 * @returns a boolean value indicating whether the password passed as an argument matches the specified
 * regular expression pattern.
 */
function validarPassword(password) {
  const regex = /^(?=.*[a-zA-Z]{4,})[a-zA-Z\d]{8,}$/;
  return regex.test(password);
}

/**
 * The function `toggleRoll` is an asynchronous function that toggles the roll (role) of a user between
 * "PREMIUM" and "USER" based on their email.
 * @param req - The `req` parameter is the req.params object that contains information about the HTTP
 * request made by the client. It includes properties such as the request method, request headers,
 * request parameters, and request body.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It contains methods and properties that allow you to control the response, such as
 * setting the status code, headers, and sending the response body.
 * @returns a response to the client. If the user is found and their role is successfully updated, it
 * will return a 400 status with a success message and redirect the user to the "/users/logout" page.
 * If the user is not found or the role update fails, it will return a 400 status with an error
 * message.
 */
export async function toggleRoll(req, res) {
  try {
    let { email } = req.user;
    let user = await UserModel.findOne({ email: email });
    if (user.status === false) {
      return res.status(400).render("nopage", { messagedanger: `User not UpLoaded Documents and can not change the roll !! `, user: req.user });
    }
    if (user) {
      let modificated = false;
      if (user.roll === "PREMIUM" && modificated === false) {
        user.roll = "USER";
        modificated = true;
      }
      if (user.roll === "USER" && modificated === false) {
        user.roll = "PREMIUM";
      }
      const actualizado = await user.save(user);
      if (actualizado) {
        return res.status(200).redirect("/users/logout");
      } else {
        return res.status(400).render("nopage", { messagedanger: `User not Updated !! `, user: req.user });
      }
    }
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

export async function funlogout(req, res) {
  try {
    let randomNumberToAppend = Math.floor(Math.random() * 1000 + 1).toString();
    let randomIndex = Math.floor(Math.random() * 10 + 1);
    let hashedRandomNumberToAppend = await bcrypt.hash(randomNumberToAppend, 10);
    req.token = req.token + hashedRandomNumberToAppend;
    req.session.user = " ";
    res.clearCookie("jwtCookieToken");
    res.setHeader("Clear-Site-Data", '"cookies", "storage"');
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
    res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
    res.setHeader("Expires", "0"); // Proxies.
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).render("nopage", { messagedanger: `${error.message}` });
      }
      res.clearCookie("session-id");
      return res.redirect("/users/login");
    });
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

export async function getAllUsers(req, res) {
  try {
    const userList = await UserService.getAll();
    return userList;
  } catch (error) {
    return res.render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

export async function eraseUsers(req, res, fechaseleccionada) {
  try {
    let usersDeleted = await UserService.deleteInactiveUsers(req, res, fechaseleccionada);
    return usersDeleted;
  } catch (error) {
    return res.render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

export async function eraseUser(req, res) {
  try {
    return await UserService.deleteInactiveUser(req, res);
  } catch (error) {
    return res.render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

export async function uldocs(req, res) {
  try {
    if (!req.files) {
      return res.status(400).render("nopage", { messagedanger: "No files added !! ", user: req.user });
    }
    let user = await UserModel.findOne({ email: req.user.email });
    let userEmail = req.user.email;
    userEmail = String(userEmail.split("@")[0]);
    req.files.forEach((file) => {
      const filePath = path.join(__dirname, "public", "uploads", userEmail, "documents", String(file.filename));
      user.documents.push({ name: req.user.email, reference: filePath, doctype: "documents" });
    });
    user.status = true;
    await user.save();
    return res.status(400).render("nopage", { message: `Document Files added successfully.`, user: req.user });
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

export async function ulimgs(req, res) {
  try {
    if (!req.file) {
      return res.status(400).render("nopage", { messagedanger: "No Profile image added !! ", user: req.user });
    }
    let user = await UserModel.findOne({ email: req.user.email });
    let userEmail = req.user.email;
    userEmail = String(userEmail.split("@")[0]);
    const filePath = path.join(__dirname, "public", "uploads", userEmail, "profile", String(req.file.filename));
    user.documents.push({ name: req.user.email, reference: filePath, doctype: "images" });
    await user.save();
    return res.status(400).render("nopage", { message: `Profile image added successfully.`, user: req.user });
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}

export async function ulproimgs(req, res) {
  try {
    if (!req.files) {
      return res.status(400).render("nopage", { messagedanger: "No product files added !! ", user: req.user });
    }
    let user = await UserModel.findOne({ email: req.user.email });
    let userEmail = req.user.email;
    userEmail = String(userEmail.split("@")[0]);
    req.files.forEach((file) => {
      const filePath = path.join(__dirname, "public", "uploads", userEmail, "products", String(file.filename));
      user.documents.push({ name: req.user.email, reference: filePath, doctype: "images" });
    });
    await user.save();
    return res.status(400).render("nopage", { message: `Product files added successfully.`, user: req.user });
  } catch (error) {
    return res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
  }
}
