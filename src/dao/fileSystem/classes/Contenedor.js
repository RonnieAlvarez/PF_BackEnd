/********************************************************************************* */
//
//  RONNIE ALVAREZ CASTRO  CODERHOUSE PROGRAMA FULLSTACK CURSO BACKEND
//
/********************************************************************************* */
//
//
import fs from "fs";
/***************************************************************************** */
/* This is the class constructor. */
export default class prodManager {
  constructor(path) {
    this.path = path;
    //console.log(this.path)
    this.products = [];
  }
  /***************************************************************************** */
  //
  /* Reading the file and if it does not exist, it creates it with 10 elements. */
  init = async () => {
    try {
      let data = await fs.promises.readFile(this.path, "utf-8");
      this.products = JSON.parse(data);
      //console.log(this.path)
    } catch {
      this.products = [
        {
          id: 1,
          title: "Producto 1 Prueba",
          description: "Este es un producto prueba",
          code: "abc101",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 2,
          title: "Producto 2 Prueba",
          description: "Este es un producto prueba",
          code: "abc102",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 3,
          title: "Producto 3 Prueba",
          description: "Este es un producto prueba",
          code: "abc103",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 4,
          title: "Producto 4 Prueba",
          description: "Este es un producto prueba",
          code: "abc104",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 5,
          title: "Producto 5 Prueba",
          description: "Este es un producto prueba",
          code: "abc105",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 6,
          title: "Producto 6 Prueba",
          description: "Este es un producto prueba",
          code: "abc106",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 7,
          title: "Producto 7 Prueba",
          description: "Este es un producto prueba",
          code: "abc107",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 8,
          title: "Producto 8 Prueba",
          description: "Este es un producto prueba",
          code: "abc108",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 9,
          title: "Producto 9 Prueba",
          description: "Este es un producto prueba",
          code: "abc109",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
        {
          id: 10,
          title: "Producto 10 Prueba",
          description: "Este es un producto prueba",
          code: "abc110",
          price: 200,
          status: true,
          stock: 25,
          category: "shoes",
          thumbnail: ["sin imagen"],
        },
      ];
      this.save(this.products);
    }
    //console.log(this.products)
  };
    /***************************************************************************** */
  //
  /* Saving the data to a file. */
  save = async (array) => {
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(array));
      console.log('se guardo la info')
    } catch (error) {
      console.log(`Error (${error.code}) when trying to save data!`);
    }
  };

  /***************************************************************************** */
  //
  /* This method is returning all the products from the array. */
  getAll = async () => {
    let data = await fs.promises.readFile(this.path, "utf-8");
    this.products = JSON.parse(data);
    return this.products;
  };
  /***************************************************************************** */
  //
  /* This method is creating a file without data. */
  writeEmpty = async () => {
    this.products = [];
    try {
      await this.save(this.products);
    } catch {
      console.log(`File ${path} was created without data`);
    }
  };
  /***************************************************************************** */
  //
  /* This method is returning all the products from the array. */
  getProducts = async () => {
    const data = await fs.promises.readFile(this.path, "utf-8");
    this.products = await JSON.parse(data);
    return this.products;
  };
  /***************************************************************************** */
  //
  /* This method is returning a limited number of products from the array. */
  getProductsLimit = async (limit) => {
    const data = await fs.promises.readFile(this.path, "utf-8");
    this.products = await JSON.parse(data);
    const dataLimit = this.products.slice(0, limit);
    return dataLimit;
  };
  /***************************************************************************** */
  //
  /* Updating the product with the id that is passed in the newObj. */
  UpdateProductById = async (newObj) => {
    try {
      let pid = newObj.id;
      this.products = await this.getProducts();
      const existeProducto = this.products.findIndex((p) => p.id === pid);
      if (existeProducto >= 0) {
        this.products[existeProducto] = {
          ...this.products[existeProducto],
          ...newObj,
        };
        console.log(
          `The product with the id ${pid} already exist and was Updated.`
        );
        await this.save(this.products);
      } else {
        console.log("Product doesnt exist");
      }
    } catch (error) {
      console.log(
        `Error (${error.code}) when trying to Update the product with this id ${pid}.`
      );
    }
  };
  /***************************************************************************** */
  //
  /* Return an element from the array. */
  getProductById = async (id) => {
    try {
      this.products = await this.getProducts();
      return this.products.find((p) => p.id === id) ?? "Product not found";
    } catch {
      return "Product not found";
    }
  };
  /***************************************************************************** */
  //
  /* Deleting an element from the array. */
  deleteById = async (id) => {
    try {
      this.products = await this.getProducts();
      this.products = this.products.filter((idbuscado) => idbuscado.id != id);
      await this.save(this.products);
      console.log(`The element with id: ${id} was removed !`);
      return this.products;
    } catch (error) {
      console.log(`Error (${error.code}) when trying to delete id: ${id}.`);
    }
  };
  /***************************************************************************** */
  //
  /* Deleting all the data in the file. */
  deleteAll = async () => {
    try {
      setTimeout(async () => {
        this.products = [];
        await this.save(this.products);
        console.log(`All data was removed!!`);
      }, 1000);
    } catch (error) {
      console.log(
        `Error (${error.code}) when trying to delete the file content.`
      );
    }
  };
  /***************************************************************************** */
  //
  /* Adding a product to the products array. */
  addProduct = async (
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnail
  ) => {
    try {
      let productObj = {
        id: this.#getMaxId() + 1,
        title: title,
        description: description,
        code: code,
        price: price,
        status: status,
        stock: stock,
        category: category,
        thumbnail: thumbnail,
      };
      console.log(productObj);
      const requerido = Object.values(productObj).includes(null || undefined);
      if (requerido) {
        console.log("All fields are Requied... Please Check!");
      } else {
        const existeProducto = this.products.find((p) => p.code === code);
        if (existeProducto) {
          console.log(`The product with the code ${code} already exist.`);
        } else {
          this.products.push(productObj);
          await this.save(this.products);
          console.log(`The element with code: ${code} was added !`);
        }
      }
    } catch (error) {
      console.log(
        `Error (${error.code}) when trying to add id ${id} to the file content.`
      );
    }
  };
  /***************************************************************************** */
  //
  /* Getting the max id from the products array. */
  #getMaxId() {
    let maxId = 0;
    this.products.map((evento) => {
      if (evento.id > maxId) maxId = evento.id;
    });
    return maxId;
  }
}
/***************************************************************************** */
/*          FINAL DE LA CLASE Product Manager                                  */
/***************************************************************************** */
