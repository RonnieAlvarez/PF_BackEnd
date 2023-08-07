import * as eTicketsController from "../../controllers/etickets.controller.js";

import CustomRouter from "./custom.router.js";

export default class eTicketRouter extends CustomRouter {
  init() {
    this.get("/show", { policies: ["USER", "PREMIUM"] }, eTicketsController.showTickets);
    this.get("/showSwagger", { policies: ["USER", "PREMIUM"] }, eTicketsController.showTicketsSwagger);
  }
}
