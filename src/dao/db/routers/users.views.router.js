import { Router } from "express";
import { passportCall, authorization } from "../../../utils.js";
import {
  forgot_password,
  reset_password,
  postResetPassword,
  toggleRoll,
  funlogout,
  getAllUsers,
  eraseUsers,
  eraseUser,
  uploadProfileImage,
  uploadDocument,
  uploadProductImage,
  ulproimgs,
  ulimgs,
  uldocs,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/favicon.ico", (req, res) => {
  res.sendFile("favicon.ico");
});
router.get("/", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), (req, res) => {
  let isAdmin = false;
  if (req.user.roll == "ADMIN") {
    isAdmin = true;
  }
  res.render("MenuPrincipal", { user: req.user, isAdmin });
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
router.get("/getallusers", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), async (req, res) => {
  let userList = await getAllUsers();
  res.status(400).render("usersRep", { usersa: userList });
});
router.post("/dateToDelete", passportCall("jwt"), async (req, res) => {
  const fechaSeleccionada = req.body.fechaSeleccionada;
  eraseUsers(req, res, fechaSeleccionada);
});
router.get("/deleteInactiveUsers", passportCall("jwt"), authorization(["ADMIN"]), async (req, res) => {
  return res.render("fecha");
});
router.get("/profile", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUN"]), (req, res) => {
  res.render("profile", { user: req.user });
});
router.get("/showInactiveUser", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), async (req, res) => {
  let userList = await getAllUsers();
  res.status(400).render("userRep", { usersa: userList });
});
router.get("/deleteInactiveUser/:email", passportCall("jwt"), authorization(["ADMIN"]), async (req, res) => {
  eraseUser(req, res);
  res.status(400).redirect("/users");
});
/* The code `router.get("/premium/:email", toggleRoll);` is defining a GET route for the
"/premium/:email" endpoint. When a GET request is made to this endpoint, the `toggleRoll` function
will be called. The ":email" part of the route is a URL parameter that can be accessed within the
`toggleRoll` function. */
router.get("/premium", passportCall("jwt"), (req, res) => toggleRoll(req, res));

/* The code is defining a route for uploading documents for a premium user. */
router.post("/premium/:email/documents", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), uploadDocument.array("files"), uldocs);

/* The code is defining a route for uploading a profile image for a premium user. */
router.post("/premium/:email/profile", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), uploadProfileImage.single("file"), ulimgs);

/* The code is defining a route for uploading product images for a premium user. */
router.post("/premium/:email/products", passportCall("jwt"), authorization(["USER", "ADMIN", "PREMIUM"]), uploadProductImage.array("files"), ulproimgs);

/* The code `router.get("/logout", funlogout);` is defining a GET route for the "/logout" endpoint.
When a GET request is made to this endpoint, the `funlogout` function will be called. This function
is responsible for handling the logout functionality for the user. */
router.get("/logout", funlogout);

/* The code `router.post("/forgot-password", forgot_password);` is defining a POST route for the
"/forgot-password" endpoint. When a POST request is made to this endpoint, the `forgot_password`
function will be called. This function is responsible for handling the logic related to the forgot
password functionality, such as sending a password reset email to the user. */
router.post("/forgot-password", forgot_password);

/* The code `router.get("/reset-password/:token", reset_password);` is defining a GET route for the
"/reset-password/:token" endpoint. When a GET request is made to this endpoint, the `reset_password`
function will be called. This function is responsible for handling the logic related to resetting a
user's password. The ":token" part of the route is a URL parameter that can be accessed within the
`reset_password` function. */
router.get("/reset-password/:token", reset_password);

/* The code `router.post("/postResetPassword/:token", postResetPassword);` is defining a POST route for
the "/postResetPassword/:token" endpoint. When a POST request is made to this endpoint, the
`postResetPassword` function will be called. This function is responsible for handling the logic
related to resetting a user's password after they have received a password reset email and clicked
on the reset link. The ":token" part of the route is a URL parameter that can be accessed within the
`postResetPassword` function. */
router.post("/postResetPassword/:token", postResetPassword);

export default router;
