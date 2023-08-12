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
        subject = "User was deleted from eCommerce shop database for inactivity account";
        sendEmails(user, subject, req, res);
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

export async function deleteInactiveUser(req, res) {
  try {
    if (req.user.roll == "ADMIN") {
      let { email } = req.params;
      email = email.slice(1);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 2);
      const user = await userModel.findOne({ email: email }).lean();
      subject = "User was deleted from eCommerce shop database for inactivity account";
      sendEmails(user, subject, req, res);
      //  }
      try {
        //  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
        await userModel.deleteOne({ email: email });
        //  res.status(400).render("nopage", { messagedanger: `User notifyed and erased fron database !!` });
      } catch (error) {
        res.status(400).render("nopage", { messagedanger: `User not found` });
      }
      //  return true;
    } else {
      (req, res) => {
        res.status(400).render("nopage", { messagedanger: `User roll cant not delete Users !!` });
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

function sendEmails(user, subject, req, res) {
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
      subject: `${subject}`,
      html: ` 
    <div style="background-color: #0DCAF0; height:200px; border: 2px solid darkgrey; border-radius: 30px; padding: 30px; text-align: center;">
      <h1>User Deleted</h1>
      < style="font-weight: bold;margin-botton:20px;"> ${subject}
       <strong></h3><br>
       <h2><a href='${url}'>To go back</a></strong></h2><br>
    </div>

    `,
    };
    const sendMail = async () => {
      await transport.sendMail(mailOptions);
    };
    sendMail();
  } catch (error) {
    return (req, res) => {
      res.status(500).render("nopage", { messagedanger: `${error.message}`, user: req.user });
    };
  }
}
