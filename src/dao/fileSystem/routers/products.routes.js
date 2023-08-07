//
/********************************************************************************* */
//
import { Router } from "express";
import prodManager from "../classes/Contenedor.js";

let products = [];
const router = Router();
const path = "scr/public/products.json";
const productList = new prodManager(path);

//
/********************************************************************************* */
/* A function that is called when the user makes a GET request to the / route. */
router.get("/", async (req, res) => {
  try {
    productList.init();
    products = await productList.getAll();
    return res.render("home", { productsa: products });
  } catch {
    res.status(500).send("Internal Server Error");
  }
});
//
/********************************************************************************* */
/* A function that is called when the user makes a POST request to the /realTimeProducts route. */
router.post("/realTimeProducts", async (req, res) => {
  try {
    products = await productList.getAll();
    console.log("Product added");
    let product = req.body;
    productList.addProduct(
      product.title,
      product.description,
      product.code,
      product.price,
      (product.status = true),
      product.stock,
      product.category,
      product.thumbnail ? product.thumbnail : ["Without thumbnail"]
    );
    return res.render("realTimeProducts", { productsa: products });
  } catch {
    res.status(500).send("Internal Server Error");
  }
});
//
/********************************************************************************* */
/* Deleting the product by id. */
router.get("/realTimeProducts", async (req, res) => {
  try {
    products = await productList.getAll();
    const id = parseInt(req.query.id);
    console.log(`producto a borrar ${id} `);
    products = await productList.deleteById(id);
  } catch {
    res.status(500).send("Internal Server Error");
  } finally {
    return res.render("realTimeProducts", { productsa: products });
  }
});

//
/********************************************************************************* */
///* A function that is called when the user makes a GET request to the /products/:pid route. */

router.get("/:pid", async function (req, res) {
  try {
    const pid = Number(req.params.pid);
    const arrayProducts = await products.getAll();
    /* Using the find method to find the product with the id that matches the pid. If it doesn't find
    it, it returns the object {Product:"Product not found"}. */
    const prodObj = arrayProducts.find((p) => p.id === pid);
    if (!prodObj) {
      res.status(404).send("Product not found");
      return;
    }
    res.send(prodObj);
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

//
/********************************************************************************* */
//
/* A function that is called when the user makes a POST request to the /products route. */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnail,
    } = req.body;
    products.addProduct(
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnail ? thumbnail : ["sin imagen"]
    );
    res.send({ status: "Success", msg: "Product Added" });
  } catch {
    res.status(500).send("Internal Server Error");
  }
});
//
/********************************************************************************* */
//
/* A function that is called when the user makes a PUT request to the /products/:pid route. */
router.put("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    const newObj = { id, ...req.body };
    products.UpdateProductById(newObj);
    res.send({ status: "Success", msg: "Product Updated" });
  } catch {
    res.status(500).send("Internal Server Error");
  }
});
//
/********************************************************************************* */
//
/* Deleting the product by id. */
router.delete("/:pid", async (req, res) => {
  try {
    const id = parseInt(req.params.pid);
    products.deleteById(id);
    res.send({ status: "Success", msg: "Product Deleted" });
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

export default router;
