import userModel from "../models/ecommerce.model.js";

/* This is a class that provides methods for interacting with a user model, including getting all
users, saving a user, finding a user by username, and updating a user. */
export default class UserService {
  constructor() {}
  getAll = async () => {
    let users = await userModel.find();
    return users.map((user) => user.toObject());
  };
  save = async (user) => {
    let result = await userModel.create(user);
    return result;
  };
  saveUser = async (user) => {
    let result = await userModel.save(user);
    return result;
  };
  findByUsername = async (username) => {
    const result = await userModel.findOne({ email: username });
    return result;
  };
  update = async (filter, value) => {
    let result = await userModel.updateOne(filter, value);
    return result;
  };
}
