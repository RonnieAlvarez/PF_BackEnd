/********************************************************************************* */
//
//  RONNIE ALVAREZ CASTRO  CODERHOUSE PROGRAMA FULLSTACK CURSO BACKEND
//
//  Aplicativo para Ecommerce
//
//
/********************************************************************************* */
import __dirname from "./utils.js";
import express from "express";
import path from "path";
import exphbs from "express-handlebars";
import { createSocketServer } from "./config/socketServer.js";
import mongoStore from "connect-mongo";
import cookie from "cookie-parser";
import session from "express-session";
import auth from "./middlewares/auth.middleware.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import swaggerUIExpress from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Import Routers
import usersViewRouter from "./dao/db/routers/users.views.router.js";
import sessionsRouter from "./dao/db/routers/sessions.router.js";
import jwtRouter from "./dao/db/routers/jwt.router.js";
import EmenuExtendRouter from "./dao/db/routers/custom/eMenu.router.js";
import EticketsExtendRouter from "./dao/db/routers/custom/eTicket.router.js";
import EcommerceExtendRouter from "./dao/db/routers/custom/eCommerce.router.js";
import ChatExtendRouter from "./dao/db/routers/custom/chat.router.js";
import compression from "express-compression";
import cors from "cors";
import config from "../src/config/config.js";
import MongoSingleton from "./config/MongoSingleton.js";
import { authToken } from "./utils.js";
import { addLogger } from "./config/logger.js";

const app = express();
const PORT = config.port || 8080;
console.log(`Port ${PORT}`);
//json settings postman
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(addLogger);

/* The `app.use(compression())` middleware is used to enable compression of HTTP responses in the
Express application. It compresses the response data using the gzip or brotli algorithm before
sending it to the client, which reduces the size of the response and improves the performance of the
application. */
app.use(
  compression({
    level: 6,
    threshold: 1024,
    brotliEnabled: true,
    brotliThreshold: 1024,
    zlib: {},
  })
);
const pathPublic = path.join(__dirname, "/public");
app.use(express.static(pathPublic));

app.use(cookie());
app.use(cors());
const sessionMiddleware = session({
  store: mongoStore.create({
    mongoUrl: config.mongoUrl,
    collectionName: "sessions",
    Options: { userNewUrlParse: true, useUnifiedTopology: true },
    ttl: 24 * 60 * 60,
  }),
  secret: config.mongoSecret,
  resave: false,
  saveUninitialized: false,
  isLogged: true,
});
app.use(sessionMiddleware);
app.use(cookieParser(`${config.cookiePassword}`));

const isAuthenticated = (req, res, next) => {
  if (req.session.isLogged) {
    next(); // El usuario está autenticado, continuar con la siguiente función de middleware
  } else {
    res.status(401).send("User not ahthenticated !!"); // El usuario no está autenticado, enviar respuesta de error 401
  }
};
//Middleware Passport
initializePassport();

app.use(passport.initialize()); // init passport on every route call
app.use(passport.session()); //allow passport to use "express-session"

/*for personal use. This code is creating a middleware function that logs the HTTP method and URL of every incoming
request to the server. It then calls the `next()` function to pass control to the next middleware
function in the chain. */
app.use(function (req, res, next) {
  if (config.environment !== "production") {
    console.log("%s %s", req.method, req.url);
    next();
  }
});

/* The code `app.use(function (req, res, next) { ... })` is creating a middleware function that checks
if the user is authenticated. */
app.use(function (req, res, next) {
  if (isAuthenticated) {
    next();
  } else {
    return res.status(200).redirect("/users/logout");
  }
});

// View engine
const hbs = exphbs.create({});
hbs.handlebars.registerHelper("lookup", (obj, field) => obj[field]);
hbs.handlebars.registerHelper("substring", function (str, start, len) {
  return str.substr(start, len);
});
/* The `hbs.handlebars.registerHelper("select", function (value, options) { ... })` code is registering
a custom helper function called "select" in the Handlebars template engine. */
hbs.handlebars.registerHelper("select", function (value, options) {
  var select = document.createElement("select");
  select.innerHTML = options.fn(this);
  select.value = value;
  if (select.children[select.selectedIndex]) select.children[select.selectedIndex].setAttribute("selected", "selected");
  return select.innerHTML;
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Routes
const chatExtendRouter = new ChatExtendRouter();
const ecommerceExtendRouter = new EcommerceExtendRouter();
const emenuExtendRouter = new EmenuExtendRouter();
const eticketsExtendRouter = new EticketsExtendRouter();

app.use("/products/", auth, authToken, ecommerceExtendRouter.getRouter());
app.use("/menu/", auth, authToken, emenuExtendRouter.getRouter());
app.use("/api/chat", auth, authToken, chatExtendRouter.getRouter());
app.use("/api/tickets", auth, authToken, eticketsExtendRouter.getRouter());
app.use("/users", usersViewRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/jwt", jwtRouter);
//app.use("/", usersViewRouter);

const swOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "CoderHouse API Project with Swagger",
      description: "An eCommerce API application made with Express and documented with Swagger",
    },
  },
  // aqui van a estar todas las especificaciones tecnicas de mis apis
  apis: ["./src/docs/**/*.yaml"],
};
const swaggerSpecs = swaggerJsdoc(swOptions);
//Documentation
app.use("/apidocs", auth, authToken, swaggerUIExpress.serve, swaggerUIExpress.setup(swaggerSpecs));

app.get("*", (req, res) => {
  res.status(404).render("nopage", { messagedanger: "Cannot get that URL!!" });
});
// Server
const server = app.listen(PORT, () => {
  (req) => {
    let messageinfo = `[${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}] - Logger Info : Server up on PORT:  ${PORT} `;
    req.logger.warning(`${messageinfo}`);
  };
});

server.on("error", (err) => console.log(err));
// Socket server
createSocketServer(server);

/**
 * The function `mongoInstance` attempts to get an instance of a MongoDB connection using a singleton
 * pattern and logs any errors that occur.
 */
const mongoInstance = async () => {
  try {
    await MongoSingleton.getInstance();
  } catch (error) {
    console.error(error);
  }
};
mongoInstance();
