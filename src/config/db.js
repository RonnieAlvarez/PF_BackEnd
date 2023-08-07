import mongoose from "mongoose";
import config from "../config/config.js";
mongoose.set("strictQuery", true);
mongoose
  .connect(config.mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Db Connected 🛒");
  })
  .catch((err) => {
    console.log(err);
  });
