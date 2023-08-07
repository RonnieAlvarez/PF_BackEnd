import passport from "passport";
import passportLocal from "passport-local";
import userModel from "../dao/db/models/ecommerce.model.js";
import { createHash, isValidPassword } from "../utils.js";
import GitHubStrategy from "passport-github2";
import jwtStrategy from "passport-jwt";
import config from "./config.js";

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const PRIVATE_KEY = config.jwtKey;
//const PORT = config.port;
const GITCLIENTID = config.gitClientId;
const GITCLIENTSECRET = config.gitClientSecret;

const localStrategy = passportLocal.Strategy;

const initializePassport = () => {
  /* This code is defining a Passport strategy for authenticating with a JSON Web Token (JWT). It is
    using the `passport.use()` method to create a new instance of the `JwtStrategy` class, which is
    a Passport strategy for authenticating with a JWT. The strategy takes an options object and a
    callback function as parameters. The options object specifies how to extract the JWT from the
    request object and the secret key used to sign the JWT. The callback function is called when the
    user is authenticated with the JWT. It uses the `jwt_payload` object to extract the user
    information from the JWT and calls the `done` function with the user object as the second
    parameter. If there is an error, the function logs the error to the console and calls the `done`
    function with the error object as the second parameter. */
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload.user);
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );

  /* This code is defining a Passport strategy for authenticating with GitHub. It is using the
`passport.use()` method to create a new instance of the `GitHubStrategy` class, which is a Passport
strategy for authenticating with GitHub using the OAuth 2.0 API. The strategy takes a client ID, a
client secret, a callback URL, and a callback function as parameters. The callback function is
called when the user is authenticated with GitHub. It uses the `userModel.findOne()` method to find
a user with the specified email. If the user is not found, the function creates a new user with the
information obtained from the GitHub profile and calls the `done` function with the new user object
as the second parameter. If the user is found, the function calls the `done` function with the user
object as the second parameter. */
  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: GITCLIENTID,
        clientSecret: GITCLIENTSECRET,
        callbackUrl: "http://localhost:&{PORT}/api/sessions/githubcallback",
      },
      //            async (accessToken, refreshToken, profile, done) => {
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({
            email: profile._json.email,
          });
          if (!user) {
            let namesplited = profile._json.name.split(" ");
            let newUser = {
              first_name: namesplited[0],
              last_name: namesplited[1],
              age: 21,
              email: profile._json.email,
              password: "", // createHash(profile._json.email),
              roll: "USER",
              loggedBy: "GitHub",
            };
            const result = await userModel.create(newUser);
            return done(null, result);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(null, error);
        }
      }
    )
  );

  /* This code is defining a local strategy for user registration. It is using the `passport.use()`
method to create a new instance of the `localStrategy` class, which is a Passport strategy for
authenticating with a username and password. */
  passport.use(
    "register",
    new localStrategy({ passReqToCallback: true, usernameField: "email" }, async (req, username, password, done) => {
      const { first_name, last_name, email, age, roll } = req.body;
      try {
        const exists = await userModel.findOne({ email });
        const user = {
          first_name,
          last_name,
          email,
          age: age ?? 21,
          roll: roll ?? "USER",
          password: createHash(password),
          loggedBy: "LocalStrategy",
        };
        if (exists) {
          const result = await userModel.findOneAndUpdate({ email }, user);
          return done(null, result);
        }
        const result = await userModel.create(user);
        //Todo sale OK
        return done(null, result);
      } catch (error) {
        return done(error);
      }
    })
  );

  /* This code is defining a local strategy for user login. It is using the `passport.use()` method
    to create a new instance of the `localStrategy` class, which is a Passport strategy for
    authenticating with a username and password. The strategy takes a request object, a username
    (which is the user's email in this case), a password, and a callback function `done` as
    parameters. The function uses the `userModel.findOne()` method to find a user with the specified
    email. If the user is not found, the function logs a warning message to the console and calls
    the `done` function with `false` as the second parameter. If the user is found, the function
    uses the `isValidPassword()` function to check if the password is valid. If the password is not
    valid, the function logs a warning message to the console and calls the `done` function with
    `false` as the second parameter. If the password is valid, the function calls the `done`
    function with the user object as the second parameter. */
  passport.use(
    "login",
    new localStrategy({ passReqToCallback: true, usernameField: "email" }, async (username, password, done) => {
      try {
        const user = await userModel.findOne({ email: username });
        if (!user) {
          console.warn("local User doesn't exists with username: " + username);
          return done(null, false);
        }
        if (!isValidPassword(user, password)) {
          console.warn("Invalid credentials for user: " + username);
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return (res) => res.status(403).send({ error: error });
        //console.log(error);
      }
    })
  );

  /* This code defines the function that serializes a user object into a session store based on the
    user ID. It takes the user object and a callback function `done` as parameters. The function
    logs a message to the console indicating that it is serializing the user object, and then calls
    the `done` function with the user ID as the second parameter. This function is used by Passport
    to store the user object in the session store. */
  passport.serializeUser((user, done) => {
    //        console.log("serializando" + user);
    done(null, user._id);
  });

  /* This code defines the function that deserializes a user object from a session store based on the
user ID. It takes the user ID as a parameter and uses it to retrieve the user object from the
database using the `userModel.findById()` method. Once the user object is retrieved, it is passed to
the `done` callback function along with a `null` error parameter. This function is used by Passport
to retrieve the user object from the session store and attach it to the `req.user` property for
subsequent requests. */
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userModel.findById(id);
      console.log("deserializando " + user._id);
      return done(null, user);
    } catch (error) {
      console.error("User Deserialized Error : " + error);
    }
  });
};

/**
 * The function extracts a JWT token from a cookie in a request object.
 */
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwtCookieToken"];
  }
  return token;
};

export default initializePassport;
