import * as eProductController from "../../controllers/eproducts.controller.js";
import * as eCartController from "../../controllers/ecarts.controller.js";
import { authorization } from "../../../../utils.js";

import CustomRouter from "./custom.router.js";

export default class CartsRouter extends CustomRouter {
  init() {
    this.get(
      "/mockingProducts",
      { policies: ["USER", "ADMIN", "PREMIUM"] },
      authorization(["USER", "ADMIN", "PREMIUM"]),
      eProductController.getMockingProducts
    );
    this.get("/realTimeProducts", { policies: ["USER", "ADMIN", "PREMIUM"] }, authorization(["USER", "ADMIN", "PREMIUM"]), eProductController.getRealProducts);
    this.post("/realTimeProducts", { policies: ["ADMIN", "PREMIUM"] }, authorization(["ADMIN", "PREMIUM"]), eProductController.createRealProduct);
    this.get("/realTimeProducts/delete", { policies: ["ADMIN", "PREMIUM"] }, authorization(["ADMIN", "PREMIUM"]), eProductController.deleteRealProduct);
    this.get("/realTimeCarts", { policies: ["USER", "ADMIN", "PREMIUM"] }, eCartController.getRealCarts);
    this.post("/realTimeCarts", { policies: ["USER", "PREMIUM"] }, authorization(["USER", "PREMIUM"]), eCartController.createRealCart);
    this.post("/realTimeCarts/add", { policies: ["USER", "PREMIUM"] }, authorization(["USER", "PREMIUM"]), eCartController.saveProductToCart);
    this.get("/realTimeCart/delete", { policies: ["USER", "PREMIUM"] }, authorization(["USER", "PREMIUM"]), eCartController.deleteRealCart);
    this.post("/realTimeCarts/purchase", { policies: ["USER", "PREMIUM"] }, authorization(["USER", "PREMIUM"]), eCartController.purchaseProducts);
    this.get("/", { policies: ["USER", "ADMIN", "PREMIUM"] }, eProductController.getProducts);
    this.get("/all", { policies: ["USER", "ADMIN", "PREMIUM"] }, eProductController.getAllProducts);
    this.post("/", { policies: ["ADMIN"] }, authorization(["ADMIN"]), eProductController.createProduct);
    this.get("/:pid", { policies: ["USER", "ADMIN"] }, eProductController.getProduct);
    this.put("/:pid", { policies: ["ADMIN"] }, authorization(["ADMIN"]), eProductController.updateProduct);
    this.delete("/:pid", { policies: ["ADMIN"] }, authorization(["ADMIN"]), eProductController.deleteProduct);
    this.get("*", { policies: ["USER", "ADMIN", "PREMIUM"] }, (req, res) => {
      res.status(404).render("nopage", { messagedanger: "Cannot get that URL!!" });
    });
  }
}
