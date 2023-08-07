import { Router } from "express";
import jwt from "jsonwebtoken";
import config from "../../../../config/config.js";
import UserDto from "../../../DTOs/user.Dto.js";

const PRIVATE_KEY = config.jwtKey;
export default class CustomRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  getRouter() {
    return this.router;
  }
  init() {} //Esta inicialilzacion se usa para las clases heredadas.

  get(path, policies, ...callbacks) {
    this.router.get(path, this.handlePolicies(policies), this.generateCustomResponses, this.applyCallbacks(callbacks));
  }

  post(path, policies, ...callbacks) {
    this.router.post(path, this.handlePolicies(policies), this.generateCustomResponses, this.applyCallbacks(callbacks));
  }

  put(path, policies, ...callbacks) {
    this.router.put(path, this.handlePolicies(policies), this.generateCustomResponses, this.applyCallbacks(callbacks));
  }

  delete(path, policies, ...callbacks) {
    this.router.delete(path, this.handlePolicies(policies), this.generateCustomResponses, this.applyCallbacks(callbacks));
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (req, res, next) => {
      if (typeof callback !== "function") {
        return next();
      }
      try {
        await callback.apply(this, [req, res, next]);
      } catch (error) {
        res.status(500).render("nopage", { messagedanger: `${error.message}` });
      }
    });
  }

  generateCustomResponses = (req, res, next) => {
    //Custom responses
    res.sendSuccess = (payload) => res.status(200).send({ status: "Success", payload });
    res.sendInternalServerError = (error) => res.status(500).send({ status: "Error", error });
    res.sendClientError = (error) =>
      res.status(400).send({
        status: "Client Error, Bad request from client.",
        error,
      });
    res.sendUnauthorizedError = (error) => async (req, res) =>
      res.status(401).render("nopage", { messagedanger: "User not authenticated or missing token.", user: req.user, error });
    res.sendForbiddenError = (error) => async (req, res) =>
      res.status(403).render("nopage", {
        messagedanger: "Token invalid or user with no access, Unauthorized please check your roles! StatusCode(403)",
        user: req.user,
        error,
      });
    next();
  };

  handlePolicies({ policies }) {
    return (req, res, next) => {
      const authHeader = req.cookies.jwtCookieToken ? req.cookies.jwtCookieToken : req.headers.cookie; //inicialmente era headers.authorization
      if (!authHeader) {
        return async (req, res) =>
          res.status(401).render("nopage", {
            messagedanger: "User not authenticated or missing token.",
          });
      }
      const token = authHeader;
      jwt.verify(token, PRIVATE_KEY, (error, credentials) => {
        if (error)
          return async (req, res) =>
            res.status(403).render("nopage", {
              messagedanger: "Token invalid, Unauthorized! StatusCode(403)",
            });
        let user = new UserDto(credentials.user);
        if (policies.includes(user.roll)) {
          let messageinfo = `[${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}] - Logger Info : policies: ${policies} -user: ${
            user.roll
          } url: ${req.url}. `;
          req.logger.warning(`${messageinfo}`);
        }
        if (!policies.includes(user.roll)) {
          return res.status(401).render("nopage", { messagedanger: "The user has no privileges, check your roles!  StatusCode(403)", user: user });
        }
        next();
      });
    };
  }
}
