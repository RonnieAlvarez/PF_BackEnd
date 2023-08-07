import mongoose from "mongoose";
import config from "./config.js";

export default class MongoSingleton {
  static #instance;

  constructor() {
    this.#connectMongoDB();
  }

  static getInstance() {
    if (this.#instance) {
      // console.log("Already have an open instance of MongoSingleton.");
      (req) => {
        req.logger.warning("Already have an open instance of MongoSingleton.");
      };
    } else {
      this.#instance = new MongoSingleton();
    }
    return this.#instance;
  }

  #connectMongoDB = async () => {
    try {
      mongoose.set("strictQuery", true);
      mongoose.connect(config.mongoUrl);
      console.log(`Db Connected 🛒 ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error("Db not conected. error: " + error);
    }
  };
}
