import UserDto from "../../DTOs/user.Dto.js";
import userModel from "../models/ecommerce.model.js";
import { sendEmails } from "../../../utils.js";

/**
 * The function `getAll` retrieves all users from the database and returns them as an array of UserDto
 * objects.
 * @returns The getAll function returns an array of UserDto objects.
 */
export async function getAll() {
  let users = await userModel.find();
  return users.map((user) => new UserDto(user));
}

export async function deleteInactiveUsers(req, res, fechaseleccionada) {
  try {
    if (req.user.roll == "ADMIN") {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 2);
      const listUsersToRemove = await userModel.find({ last_connection: { $lt: fechaseleccionada } }).lean();
      const subject = "User was deleted from eCommerce shop database for inactivity account";
      for (const user of listUsersToRemove) {
        sendEmails(req, res, user, subject);
      }
      await userModel.deleteMany({ last_connection: { $lt: fechaseleccionada } });
      return res.status(400).render("usersRep", { usersa: listUsersToRemove });
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
      const subject = "User was deleted from eCommerce shop database for inactivity account";
      sendEmails(req, res, user, subject);
      try {
        await userModel.deleteOne({ email: email });
      } catch (error) {
        res.status(400).render("nopage", { messagedanger: `User not found` });
      }
    } else {
      (req, res) => {
        res.status(400).render("nopage", { messagedanger: `User roll cant not delete Users !!` });
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
