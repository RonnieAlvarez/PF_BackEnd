import mongoose from "mongoose";
import { ProductModel } from "../../src/dao/db/models/ecommerce.model.js";
import Assert from "assert";
import config from "../../src/config/config.js";
import * as eproducts from "../../src/dao/db/services/eproducts.service.js";

describe("Test suite", function () {
  before(async function () {
    mongoose.set("strictQuery", true);
    mongoose.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Db Connected 🛒");
  });

  after(async function () {
    await mongoose.connection.close();
    console.log("Connection closed 🚪");
  });

  const assert = Assert.strict;

  describe("Testing Products Dao", () => {
    beforeEach(() => {
      this.timeout(3000);
    });

    //************************************************/
    // test 01
    it("El dao debe devolver los Productos ", async function () {
      //given
      const isArray = true;

      // Then
      const result = await eproducts.getAllProducts(); // [{}, {}]
      console.log(`El resultado es un array ?: ${Array.isArray(result)}`);
      console.log(`Cantidad de elementos en el array: ${result.length}`);
      //console.log(result);

      // Assert that
      assert.strictEqual(Array.isArray(result), isArray);
    });

    //************************************************/
    //     test 02
    it("El dao debe agregar un Producto correctamente a la DB", async function () {
      // Given
      let prodFaker = eproducts.generateProduct();
      let mockProd = {
        id: 64,
        Category: prodFaker.Category,
        Code: prodFaker.Code,
        Description: prodFaker.Description,
        Price: prodFaker.Price,
        Status: true,
        Stock: prodFaker.Stock,
        Title: prodFaker.Title,
      };

      // Then
      const result = await eproducts.createProduct(mockProd);

      // Assert that
      assert.ok(result._id);
    });

    //************************************************/
    //     test 03
    it("El dao debe eliminar un Producto correctamente a la DB", async function () {
      // Given
      let pid = 64;

      // Then
      const result = await ProductModel.delete({ id: pid });

      // Assert that
      assert.ok(result);
    });
  });
});
