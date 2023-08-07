import * as ProductService from "../services/eproducts.service.js";
import { STATUS } from "../../../config/constants.js";
import UserDto from "../../DTOs/user.Dto.js";
import CustomError from "../../../middlewares/errors/CustomError.js";
import EErrors from "../../../middlewares/errors/errors-enum.js";
import { generateProductErrorInfo } from "../../../middlewares/errors/messages/product-error.message.js";

/**
 * The function retrieves mock products and renders them on a webpage, while also checking if the user
 * has permission to add products.
 */
export async function getMockingProducts(req, res) {
  try {
    let user = new UserDto(req.user);
    let canaddproducts = null;
    if (user.roll === "ADMIN") canaddproducts = false;

    const products = await ProductService.getMockProducts();
    return res.render("realTimeProducts", { productsa: products, user: user, canaddproducts });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}
/**
 * This is an asynchronous function that retrieves a product based on a given ID and returns a JSON
 * response with the product and a status.
 */
export async function getProduct(req, res) {
  try {
    let { pid } = req.params;
    pid = parseInt(pid);
    const response = await ProductService.getProduct(pid);
    res.json({
      product: response,
      status: STATUS.SUCCESS,
    });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}

//**************************************** */
export async function getProducts(req, res) {
  try {
    let user = new UserDto(req.user);
    const products = await ProductService.getProducts();
    return res.render("home", { productsa: products, user });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}
//**************************************** */
/**
 * This is an asynchronous function that retrieves a list of products from a database, paginates them,
 * and renders them in an HTML template with links to navigate between pages and return to the home
 * menu.
 * */
/**
 * This function retrieves all products from a ProductService and renders them in a real-time view.
 */
export async function getRealProducts(req, res) {
  try {
    let user = new UserDto(req.user);
    let canaddproducts = null;
    if (user.roll === "ADMIN" || user.roll === "PREMIUM") canaddproducts = true;

    const products = await ProductService.getAllProducts();
    return res.render("realTimeProducts", { productsa: products, user: user, canaddproducts });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}

/**
 * This function creates a new product and renders a page with all products.
 */
export async function createRealProduct(req, res) {
  try {
    const { body } = req;
    let id = Number(body.id);
    const Title = body.Title;
    const Price = Number(body.Price);
    let user = new UserDto(req.user);

    if (!Title || !Price || Price < 0) {
      CustomError.createError({
        name: "Product Creation Error",
        cause: generateProductErrorInfo({ id: id, Title: Title, Price: Price }),
        message: "Error: There was a problem encountered while attempting to create the product.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }
    let products = await ProductService.getProducts();
    let maxId = 0;
    products.forEach((product) => {
      if (product.id > maxId) {
        maxId = product.id;
      }
    });
    id = maxId + 1;
    body.id = id;

    body.Owner = user.email;
    products = await ProductService.createProduct(body);
    products = await ProductService.getProducts();
    let canaddproducts = null;
    if (user.roll === "ADMIN" || user.roll === "PREMIUM") canaddproducts = true;
    return res.render("realTimeProducts", { productsa: products, user: user, canaddproducts });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}

/**
 * This function deletes a real product using its ID and then renders a page with all the remaining
 * products.
 */
export async function deleteRealProduct(req, res) {
  try {
    let user = new UserDto(req.user);
    const id = parseInt(req.query.pid);
    await ProductService.deleteRealProduct(id);
    let products = await ProductService.getAllProducts();
    let canaddproducts = null;
    if (user.roll === "ADMIN") canaddproducts = true;
    res.status(201).render("realTimeProducts", { productsa: products, user: user, canaddproducts });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}

//****************************************** */

/**
 * This is an asynchronous function that creates a product and returns a JSON response with the product
 * and a success status code, or an error message and a fail status code.
 */
export async function createProduct(req, res) {
  try {
    const { body } = req;
    const response = await ProductService.createProduct(body);
    res.status(201).json({
      product: response,
      status: STATUS.SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: STATUS.FAIL,
    });
  }
}

/**
 * This is an asynchronous function that updates a product and returns a JSON response with the updated
 * product and a status code.
 */
export async function updateProduct(req, res) {
  try {
    const { pid } = req.params;
    const { body } = req;
    const response = await ProductService.updateProduct(pid, body);
    res.status(201).json({
      product: response,
      status: STATUS.SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: STATUS.FAIL,
    });
  }
}

/**
 * This is an asynchronous function that deletes a product and returns a success message or an error
 * message with a corresponding status code.
 */
export async function deleteProduct(req, res) {
  try {
    const { pid } = req.params;
    await ProductService.deleteProduct(pid);
    res.status(201).json({
      message: "Product deleted !!",
      status: STATUS.SUCCESS,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: STATUS.FAIL,
    });
  }
}
export async function getAllProducts(req, res) {
  try {
    let user = new UserDto(req.user);
    const products = await ProductService.getProducts();
    return res.status(201).send({ products: products });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      status: STATUS.FAIL,
    });
  }
}
