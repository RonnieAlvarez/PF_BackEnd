import dotenv from "dotenv";
import program from "../process.js";

const environment = program.opts().mode;
dotenv.config({
  path: environment === "production" ? "./src/config/.env.production" : "./src/config/.env.development",
});

// console.log(process.env.PORT)

export default {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URI,
  mongoSecret: process.env.SECRET,
  adminName: process.env.ADMIN_NAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtKey: process.env.JWTPRIVATE_KEY,
  gitClientId: process.env.GITCLIENTID,
  gitClientSecret: process.env.GITCLIENTSECRET,
  cookiePassword: process.env.COOKIEPASSWORD,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
};
