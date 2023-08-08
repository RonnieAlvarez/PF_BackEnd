import { Router } from "express";
import { passportCall, authorization } from "../../../utils.js";
import __dirname from "../../../utils.js";
import bcrypt from "bcrypt";
import path from "path";
import { forgot_password, reset_password, postResetPassword, toggleRoll } from "../controllers/user.controller.js";
import userModel from "../models/ecommerce.model.js";
import multer from "multer";
import fs from "fs";

const router = Router();

const storage = (folderName) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      let userEmail = req.user.email;
      userEmail = userEmail.split("@")[0];

      if (!fs.existsSync(`${__dirname}/public/uploads/${userEmail}`)) {
        fs.mkdir(`${__dirname}/public/uploads/${userEmail}`, (err) => {
          if (err) throw err;
          console.log("Carpeta creada");
        });
      }
      if (!fs.existsSync(`${__dirname}/public/uploads/${userEmail}/${folderName}`)) {
        fs.mkdir(`${__dirname}/public/uploads/${userEmail}/${folderName}`, (err) => {
          if (err) throw err;
          console.log("Carpeta creada");
        });
      }

      cb(null, `${__dirname}/public/uploads/${userEmail}/${folderName}`);
    },
    filename: function (req, file, cb) {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  });

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

const uploadDocument = multer({ storage: storage("documents"), fileFilter: docFilter });
const uploadProfileImage = multer({ storage: storage("profile"), fileFilter: imageFilter });
const uploadProductImage = multer({ storage: storage("products"), fileFilter: imageFilter });

router.get("/favicon.ico", (req, res) => {
  res.sendFile("favicon.ico");
});
//router.get("/", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), async (req, res) => {

router.get("/", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), (req, res) => {
  res.render("MenuPrincipal", { user: req.user });
});
router.get("/login", async (req, res) => {
  res.render("login");
});
router.get("/forgot", async (req, res) => {
  res.render("forgot");
});
router.get("/register", (req, res) => {
  res.render("register");
});
router.get("/gitregister", (req, res) => {
  res.render("gitRegister");
});
router.get("/profile", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUN"]), (req, res) => {
  res.render("profile", { user: req.user });
});
router.get("/premium/:email", toggleRoll);

/* The code snippet defines a route for uploading document files for a premium user. When a POST
request is made to this route, it first checks if any files were uploaded. If no files were
uploaded, it returns a 400 status code with a rendered page displaying a message indicating that no
files were added. */
router.post("/premium/:email/documents", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), uploadDocument.array("files"), async (req, res) => {
  if (!req.files) {
    return res.status(400).render("nopage", { messagedanger: "No files added !! ", user: req.user });
  }
  let user = await userModel.findOne({ email: req.user.email });
  let userEmail = req.user.email;
  userEmail = userEmail.split("@")[0];
  req.files.forEach((file) => {
    const filePath = path.join(__dirname, "public", "uploads", userEmail, "documents", file.filename);
    //user.documents.push(filePath);
    user.documents.push({ name: req.user.email, reference: filePath, doctype: "documents" });
  });
  user.status = true;
  await user.save();
  return res.status(400).render("nopage", { message: `Document Files added successfully.`, user: req.user });
});

/* This code snippet defines a route for uploading a profile image for a user. When a POST request is
made to this route, it first checks if a file was uploaded. If no file was uploaded, it returns a
400 status code with a rendered page displaying a message indicating that no profile image was
added. */
router.post(
  "/premium/:email/profile",
  passportCall("jwt"),
  authorization(["USER", "ADMIN", "PREMIUM"]),
  uploadProfileImage.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).render("nopage", { messagedanger: "No Profile image added !! ", user: req.user });
    }
    let user = await userModel.findOne({ email: req.user.email });
    let userEmail = req.user.email;
    userEmail = userEmail.split("@")[0];
    const filePath = path.join(__dirname, "public", "uploads", userEmail, "profile", req.file.filename);
    user.documents.push({ name: req.user.email, reference: filePath, doctype: "images" });
    await user.save();
    return res.status(400).render("nopage", { message: `Profile image added successfully.`, user: req.user });
  }
);

/* This code snippet defines a route for uploading product files. When a POST request is made to this
route, it first checks if any files were uploaded. If no files were uploaded, it returns a 400
status code with a rendered page displaying a message indicating that no product files were added. */
router.post(
  "/premium/:email/products",
  passportCall("jwt"),
  authorization(["USER", "ADMIN", "PREMIUM"]),
  uploadProductImage.array("files"),
  async (req, res) => {
    if (!req.files) {
      return res.status(400).render("nopage", { messagedanger: "No product files added !! ", user: req.user });
    }
    let user = await userModel.findOne({ email: req.user.email });
    let userEmail = req.user.email;
    userEmail = userEmail.split("@")[0];
    req.files.forEach((file) => {
      const filePath = path.join(__dirname, "public", "uploads", userEmail, "products", file.filename);
      //user.documents.push(filePath);
      user.documents.push({ name: req.user.email, reference: filePath, doctype: "images" });
    });
    await user.save();
    return res.status(400).render("nopage", { message: `Product files added successfully.`, user: req.user });
  }
);
/* This code defines a route for logging out a user. When the user accesses this route, the
`req.session` object is destroyed, which effectively logs the user out. If there is an error
destroying the session, the error is returned as a JSON response. If the session is successfully
destroyed, the `session-id` cookie is cleared and the user is redirected to the login page with a
status code of 201. */
router.get("/logout", async (req, res) => {
  try {
    //user = await userModel.findOneAndUpdate({ email: req.user.email }, { $set: { last_connection: new Date() } });
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
});
router.post("/forgot-password", forgot_password);
router.get("/reset-password/:token", reset_password);
router.post("/postResetPassword/:token", postResetPassword);

/* The code snippet is configuring the storage options for multer, a middleware for handling file
uploads in Node.js. */

export default router;
