import * as eChatController from "../../controllers/echat.controller.js";

import CustomRouter from "./custom.router.js";

export default class ChatRouter extends CustomRouter {
  init() {
    this.get("/ini", { policies: ["USER", "PREMIUM"] }, eChatController.getchat);
  }
}
