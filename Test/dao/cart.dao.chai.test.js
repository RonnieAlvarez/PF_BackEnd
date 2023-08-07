import mongoose from "mongoose";
import config from "../../src/config/config.js";
import { ProductModel } from "../../src/dao/db/models/ecommerce.model.js";
import * as eproducts from "../../src/dao/db/services/eproducts.service.js";
import chai from "chai";

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

  const expect = chai.expect;
  describe("Testing Cart Dao", () => {
    beforeEach(() => {
      this.timeout(3000);
    });
    //***************************************** */
    // Test 01
    it("El dao debe devolver los productos en formato arreglo", async function () {
      // Given
      const emptyArray = [];

      // Then
      const result = await eproducts.getAllProducts(); // []

      //Expect
      expect(Array.isArray(result)).to.be.ok;
      expect(Array.isArray(result)).to.be.equal(true);
      expect(result.length).to.be.not.equal(emptyArray.length);
    });

    //***************************************** */
    // test 02
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

      // Expect
      expect(result).to.be.ok;
    });

    //************************************************/
    //     test 03
    it("El dao debe eliminar un Producto correctamente a la DB", async function () {
      // Given
      let pid = 64;

      // Then
      const result = await ProductModel.delete({ id: pid });

      // Expect
      expect(result).to.be.ok;
    });
  });
});
