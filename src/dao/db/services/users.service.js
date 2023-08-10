import config from "../../../config/config.js";
import UserDto from "../../DTOs/user.Dto.js";
import userModel from "../models/ecommerce.model.js";
import nodemailer from "nodemailer";

/**
 * The function `getAll` retrieves all users from the database and returns them as an array of UserDto
 * objects.
 * @returns The getAll function returns an array of UserDto objects.
 */
export async function getAll() {
  let users = await userModel.find();
  return users.map((user) => new UserDto(user));
}

export async function deleteInactiveUsers(req, res) {
  try {
    if (req.user.roll == "USER") {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 2);
      const listUsersToRemove = await userModel.find({ last_connection: { $lt: cutoffDate } }).lean();
      for (const user of listUsersToRemove) {
        sendEmails(user, req, res);
      }
      await userModel.deleteMany({ last_connection: { $lt: cutoffDate } });
      return true;
    } else {
      (req, res) => {
        res.status(400).render("nopage", { messagedanger: `User roll cant not delete Users !!` });
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

function sendEmails(user, req, res) {
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
        res.status(400).render("nopage", { messagedanger: `${error.message}`, user });
      }
    });
    const email = user.email;
    if (!user) {
      res.status(400).render("nopage", { messagedanger: `User not found !!`, user });
    }
    const url = `${req.protocol}://${req.hostname}:${config.port}/users/login`;
    const mailOptions = {
      from: "eCommerce shop 🛒 " + config.GOOGLE_CLIENT_EMAIL,
      to: email,
      subject: "User deleted from eCommerce shop for inactivity account",
      html: ` 
    <div style="background-color: #0DCAF0; height:200px; border: 2px solid darkgrey; border-radius: 30px; padding: 30px; text-align: center;">
      <h1>User Deleted</h1>
      <h3 style="font-weight: bold;margin-botton:20px;">Your User was deleted from eCommerce database for inactive account
       <strong></h3><br>
       <h2><a href='${url}'>To go back</a></strong></h2><br>
    </div>

    `,
    };
    const sendMail = async () => {
      await transport.sendMail(mailOptions);
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    sendMail();
  } catch (error) {
    return (req, res) => {
      res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
    };
  }
}

/* This is a class that provides methods for interacting with a user model, including getting all
users, saving a user, finding a user by username, and updating a user. */
// export default class UserService {
//   constructor() {}
//   getAll = async () => {
//     let users = await userModel.find();
//     return users.map((user) => user.toObject());
//   };
//   save = async (user) => {
//     let result = await userModel.create(user);
//     return result;
//   };
//   saveUser = async (user) => {
//     let result = await userModel.save(user);
//     return result;
//   };
//   findByUsername = async (username) => {
//     const result = await userModel.findOne({ email: username });
//     return result;
//   };
//   update = async (filter, value) => {
//     let result = await userModel.updateOne(filter, value);
//     return result;
//   };
// }
