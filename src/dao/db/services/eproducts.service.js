import { sendEmails } from "../../../utils.js";
import { ProductModel } from "../models/ecommerce.model.js";
import { faker } from "@faker-js/faker";

/**
 * The function `getMockProducts` generates an array of mock products.
 * @returns an array of mock products.
 */
export async function getMockProducts() {
  try {
    let numOfProducts = 100;
    let products = [];
    for (let i = 0; i < numOfProducts; i++) {
      products.push(generateProduct());
    }
    return products;
  } catch (error) {
    throw new Error(error.message);
  }
}
/**
 * The function generates a random product object with various properties using the faker library.
 * @returns The function `generateProduct` returns an object with the following properties:
 */
export const generateProduct = () => {
  return {
    id: faker.number.int(100),
    Title: faker.commerce.product(),
    Description: faker.commerce.productName(),
    Code: generateproductCode(),
    Price: faker.commerce.price({ min: 100, max: 200 }),
    Stock: faker.number.int(100),
    Category: faker.commerce.department(),
    Status: faker.datatype.boolean(),
    _id: faker.database.mongodbObjectId(),
  };
};

/**
 * The function generates a random product code consisting of three letters followed by three numbers.
 * @returns a randomly generated product code consisting of three uppercase letters followed by three
 * numbers.
 */
export function generateproductCode() {
  let code = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
}
/**
 * This is an asynchronous function that retrieves a product from a database based on its ID and
 * returns it, or returns an error message if the product doesn't exist.
 */
export async function getProduct(pid) {
  try {
    const Products = await ProductModel.find({
      $and: [{ id: pid }, { deleted: false }],
    });
    if (Products.length === 0) {
      return "Record doesnt exist !!";
    }
    return Products;
  } catch (error) {
    throw new Error(error.message);
  }
}
//**************************************** */
/**
 * This function retrieves menu products from a database using pagination and error handling.
 */
export async function getmenuProducts(page, limit) {
  try {
    const Products = await ProductModel.paginate({ deletedAt: { $exists: false } }, { page: page, limit: limit, lean: true });
    return Products;
  } catch (error) {
    return {
      error: error.message,
      status: 400,
    };
  }
}
/**
 * This function retrieves all products that have not been deleted from a database using the
 * ProductModel.
 */
export async function getProducts() {
  try {
    const Products = await ProductModel.find({ deletedAt: { $exists: false } });
    return Products;
  } catch (error) {
    throw new Error(error.message);
  }
}
/**
 * This function retrieves all products that have not been deleted from a database using the
 * ProductModel.
 */
export async function getAllProducts() {
  try {
    const Products = await ProductModel.find({ deletedAt: { $exists: false } }).lean();
    return Products;
  } catch (error) {
    throw new Error(error.message);
  }
}
/**
 * This function creates a new product with a unique ID and sets its status to true.
 */
export async function createProduct(data) {
  try {
    const Products = await getAllProducts();
    const result = Products.find((evento) => evento.id === data.id);
    if (result) {
      if (data.Title === "") {
        data.Title = result.Title;
      }
      if (data.Description === "") {
        data.Description = result.Description;
      }
      if (data.Code === "") {
        data.Code = result.Code;
      }
      if (data.Category === "") {
        data.Category = result.Category;
      }
    }

    if (data.Owner === "") {
      data.Owner = "ADMIN";
    }
    data.Category = data.Category ? data.Category : "Ropa";
    if (data.Code === "") {
      data.Code = await generarCodigoUnico(data.Title);
    }
    data.Price = Number(data.Price);
    data.Stock = Number(data.Stock);
    data = { ...data, Status: true };
    const product = await ProductModel.findOneAndUpdate({ id: data.id }, data, {
      new: true,
      upsert: true,
    });
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
}

//************************************************ */
/**
 * This is an asynchronous function that updates a product in a database using its ID and returns the
 * updated product.
 */
export async function updateProduct(pid, data) {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(pid, data, {
      new: true,
      upsert: true,
    });
    return updatedProduct;
  } catch (error) {
    throw new Error(error.message);
  }
}

//***************************************************** */
/**
 * This is an asynchronous function that deletes a product with a given ID using a ProductModel and
 * throws an error if there is one.
 */
export async function deleteProduct(pid) {
  try {
    if (user.roll == "ADMIN") {
      await ProductModel.delete({ id: pid });
    } else if (user.roll == "PREMIUM") {
      await ProductModel.delete({ id: pid, Owner: user.email });
    }
  } catch (error) {
    throw new Error(error.message);
  }
}
//***************************************************** */
/**
 * This function deletes a real product from the database using its ID.
 */
export async function deleteRealProduct(id, user, req, res) {
  try {
    if (user.roll == "ADMIN") {
      await ProductModel.findOneAndDelete({ id: id });
    } else if (user.roll == "PREMIUM") {
      const subject = `The Product with the id: ${id} was deleted from products database `;
      await ProductModel.deleteOne({ id: id, Owner: user.email });
      sendEmails(req, res, user, subject);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * The function generates a unique code based on a given title, consisting of two uppercase letters and
 * three numbers.
 * @param title - The title is a string that represents the title of a product.
 * @returns a unique code generated based on the given title.
 */
async function generarCodigoUnico(Title) {
  let codigo = "";
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  if (typeof Title === "string" && Title.length >= 3) {
    codigo += Title.slice(0, 3).toUpperCase();
  } else {
    for (let i = 0; i < 3; i++) {
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
  }
  for (let i = 0; i < 3; i++) {
    codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }
  const existeCodigo = await ProductModel.findOne({ Code: codigo });
  if (existeCodigo) {
    return generarCodigoUnico();
  }
  return codigo;
}
