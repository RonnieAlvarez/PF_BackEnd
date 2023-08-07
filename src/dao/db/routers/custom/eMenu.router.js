import * as eMenuController from "../../controllers/emenu.controller.js";

import CustomRouter from "./custom.router.js";

export default class eMenuRouter extends CustomRouter {
  init() {
    this.get("/products", { policies: ["USER", "ADMIN", "PREMIUM"] }, eMenuController.getmenuProducts);
    this.get("/menu", { policies: ["USER", "ADMIN", "PREMIUM"] }, eMenuController.getMenu);

    this.get("/logger", { policies: ["USER", "ADMIN"] }, (req, res) => {
      let messageinfo = ` Prueba EndPoint Logger test : level: ${req.logger.level} - method: ${req.method} url: ${req.url}. `;
      req.logger.warning(`${messageinfo}`);
      res.status(201).render("nopage", { messageSuccess: messageinfo, user: req.user });
    });
    this.get("/docUplouder", { policies: ["USER", "ADMIN"] }, (req, res) => {
      res.status(201).render("upDocs", { user: req.user });
    });
    this.get("/imgUplouder", { policies: ["USER", "ADMIN"] }, (req, res) => {
      res.status(201).render("upImgs", { user: req.user });
    });
    this.get("/proUplouder", { policies: ["USER", "ADMIN"] }, (req, res) => {
      res.status(201).render("upProds", { user: req.user });
    });
  }
}
