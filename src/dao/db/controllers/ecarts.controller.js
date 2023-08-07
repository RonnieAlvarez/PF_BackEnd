import * as CartService from "../services/ecarts.service.js";
import { CartModel, ProductModel, TicketModel } from "../models/ecommerce.model.js";
import UserDto from "../../DTOs/user.Dto.js";
import nodemailer from "nodemailer";
import config from "../../../config/config.js";
import process from "process";

/**
 * This function retrieves all carts from a database and renders them in a real-time view.
 */
export async function getRealCarts(req, res) {
  try {
    let user = new UserDto(req.user);
    const carts = await CartModel.find({ uid: user._id }).populate("products").lean();
    const productsarray = await ProductModel.find().select("id Title Price Stock");
    let total = 0;
    let carlinea = [];
    if (carts.length > 0) {
      carts[0].products.forEach((product) => {
        productsarray.forEach((linea) => {
          if (linea.id == product.pid) {
            carlinea.push({
              lid: linea.id,
              lQua: product.Quantity,
              lTitle: linea.Title,
              lPrice: linea.Price,
              lTotLine: linea.Price * product.Quantity,
            });
            total = total + linea.Price * product.Quantity;
          }
        });
      });
    }

    /* This line of code is creating a new array called `products` by filtering the `productsarray`
        array to only include products with a `Stock` value greater than 0. It then maps each
        filtered product object to a new object with modified properties using the `Array.from()`
        method. The modified properties include `id` padded with leading zeros to a length of 3,
        `Title` converted to uppercase and truncated to the first 5 characters, `Price` formatted as
        a currency string using the `toLocaleString()` method, and `Stock` padded with leading zeros
        to a length of 2. */
    const products = Array.from(
      productsarray.filter((product) => product.Stock > 0),
      ({ id, Title, Price, Stock }) => ({
        id: id.toString().padStart(3, "0"),
        Title: Title.toUpperCase().substring(0, 5),
        Price: Price.toLocaleString("en-US", { style: "currency", currency: "USD" }),
        Stock: Stock.toString().padStart(2, "0"),
      })
    );
    //----------------------------------------------------------------
    let canAddToCart = null;
    if (user.roll === "USER" || user.roll === "PREMIUM") {
      canAddToCart = true;
    } else {
      canAddToCart = false;
      return res
        .status(403)
        .render("nopage", { messagedanger: `Forbidden: The User ${user.name} doesn't have permission with the ${user.roll} roll.`, user: user });
    }
    return res.status(201).render("realTimeCarts", { carts: carlinea, user, products: products, lTotal: total, canAddToCart });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}
/**
 * This function creates a new cart, retrieves all existing carts, and renders them in a real-time
 * view.
 */
export async function createRealCart(req, res) {
  try {
    //const { body } = req;
    let user = new UserDto(req.user);
    const carts = await CartService.createCart({ uid: user._id });
    let canAddToCart = null;
    if (user.roll === "USER" || user.roll === "PREMIUM") canAddToCart = true;
    return res.status(201).render("realTimeCarts", { carts: carts, user, canAddToCart });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}
/**
 * This function deletes a cart with a specific ID and returns a rendered view of all remaining carts.
 */
export async function deleteRealCart(req, res) {
  try {
    let user = new UserDto(req.user);
    await CartService.deleteRealCart(user._id);
    return res.status(200).redirect("/products/realTimeCarts/");
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}
/**
 * This function saves a product to a cart and returns a rendered view of all carts.
 */
export async function saveProductToCart(req, res) {
  try {
    const { body } = req;
    let user = new UserDto(req.user);
    //let id = parseInt(body.id);
    let pid = parseInt(body.product);
    let Quantity = parseInt(body.Quantity);
    const product = await ProductModel.findOne({ id: pid });
    if (product.Owner == user.email) {
      return res.status(201).render("nopage", { messagedanger: "The user Premiun can't add his own Product." });
    }
    if (!product) {
      return res.status(201).render("nopage", { messagedanger: "Product doesn't Exist." });
    }
    let T_pid = product._id;
    let pTitle = product.Title;
    if (Quantity > product.Stock) {
      Quantity === product.Stock;
    }
    let cart = await CartModel.findOne({ uid: user._id }).populate("products");
    if (!cart) {
      await CartModel.create({
        uid: user._id,
        products: { pid: pid, Quantity: Quantity, _pid: T_pid, Title: pTitle },
      });
    } else {
      let cartUpdated = await CartModel.findOneAndUpdate(
        { uid: user._id, "products.pid": pid },
        { $inc: { "products.$.Quantity": Quantity } },
        { new: true }
      ).populate("products.product");
      if (!cartUpdated) {
        cartUpdated = await CartModel.findOneAndUpdate(
          { uid: user._id },
          { $push: { products: { pid: pid, Quantity: Quantity, _pid: T_pid, Title: pTitle } } },
          { new: true }
        );
      }
    }
    return res.status(200).redirect("/products/realTimeCarts/");
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}

/**
 * This function handles the purchase of products by a user, updates the stock of purchased products,
 * generates a unique code for the purchase, creates a ticket with the purchase details, sends an email
 * to the user with the purchase details, and redirects the user to the real-time carts page.
 */
export async function purchaseProducts(req, res) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  try {
    let user = new UserDto(req.user);
    const transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      ca: null,
      secure: false,
      auth: {
        user: config.GOOGLE_CLIENT_EMAIL,
        pass: config.GOOGLE_CLIENT_SECRET,
      },
    });
    transport.verify(function (error) {
      if (error) {
        res.status(400).render("nopage", { messagedanger: `${error.message}` });
      } else {
        //console.log("Server is ready to send emails");
      }
    });
    let cart = await CartModel.findOne({ uid: user._id }).populate("products").lean();
    const productsarray = await ProductModel.find().select("id Title Price Stock Quantity").lean();
    let productPurchased = [];
    let cartProducts = cart.products;
    let totalbuyed = 0;
    cartProducts.map(async (element) => {
      const productto = productsarray.find((prod) => prod.id === element.pid);
      if (element.Quantity <= productto.Stock) {
        productto.Stock = productto.Stock - element.Quantity;
        productPurchased.push({
          Quantity: element.Quantity,
          _pid: productto._id,
          pid: productto.id,
          Title: productto.Title,
          Price: productto.Price,
          Total: productto.Price * element.Quantity,
        });
        totalbuyed = totalbuyed + productto.Price * element.Quantity;
        try {
          await ProductModel.findOneAndUpdate({ _id: productto._id }, { $set: { Stock: productto.Stock } }, { new: true }).exec();
          cartProducts.splice(cartProducts.indexOf(element), 1);
          await CartModel.updateOne({ uid: user._id }, { $pull: { products: { pid: productto.id } } }).exec();
        } catch (error) {
          res.status(400).render("nopage", { messagedanger: `${error.message}` });
        }
      }
    });
    const code = CartService.generateUniqueCode();
    const newTicket = new TicketModel({
      uid: user._id,
      code: code,
      amount: totalbuyed,
      purchaser: user.email,
      products: productPurchased,
    });
    CartService.saveTicket(newTicket);
    let html = `<h2 color="red">Shop detail #${code}</h2>`;
    html += `<h4 color="blue"> Purchaser: ${user.email}</h4>`;
    html += `<h4 color="blue"> Purchaser id: ${user._id}</h4>`;
    html += "<hr width='100%' color='gray' size='1'></hr><ul>";
    for (let i = 0; i < productPurchased.length; i++) {
      html += `<li> Line # ${i + 1} Title: ${productPurchased[i].Title}, Qua: ${productPurchased[i].Quantity}, id: ${productPurchased[i].pid}, Price: ${
        productPurchased[i].Price
      }, sub-Total: ${productPurchased[i].Total} </li>`;
    }
    html += "</ul>";
    html += "<hr width='100%' color='gray' size='1'></hr>";
    html += `<h3>Total: ${totalbuyed}</h3>`;
    html += "<hr width='100%' color='gray' size='1'></hr>";
    const sendMail = async () => {
      await transport.sendMail({
        from: "eCommerce shop 🛒 " + config.GOOGLE_CLIENT_EMAIL,
        to: user.email,
        subject: `Shop detail #${code}`,
        html: html,
      });
    };

    sendMail();

    return res.status(200).redirect("/products/realTimeCarts/");
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}
