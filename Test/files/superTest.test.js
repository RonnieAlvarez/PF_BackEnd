import chai from "chai";
import supertest from "supertest";
import config from "../../src/config/config.js";

const expect = chai.expect;

const requester = supertest("http://localhost:3033");

describe("Testing Ecommerce App", () => {
  describe("Testing Register and Login Api", () => {
    //     // Test 01
    it("Login Current: El API POST /api/jwt/current login Admin correctamente.", async () => {
      //         // Given
      const email = config.adminName;
      const password = config.adminPassword;
      let user = {
        first_name: "Admin",
        last_name: "CoderHouse",
        email: email,
        age: 21,
        roll: "ADMIN",
      };

      // Then
      const { _body, ok, statusCode } = await requester.post("/api/jwt/current").send({ email: email, password: password });
      const result = await requester.post("/api/jwt/current").send({ email: email, password: password });
      console.log(result);

      // Expect
      expect(statusCode).is.eqls(200);
      expect(_body.message).is.eqls("Login successful!");
      expect(_body).is.ok;

      /*=============================================
        =                 Section 02                =
        =============================================*/
      describe("Testing login and session with Cookies:", () => {
        before(function () {
          this.cookie;
          this.mockUser = {
            first_name: "Usuario de prueba 3",
            last_name: "Apellido de prueba 3",
            email: "correodeprueba3@gmail.com",
            password: "123456",
            // age: 21,
            // roll: "User",
          };
        });

        //     // Test 01
        it("Test Registro Usuario /api/sessions/register: Debe poder registrar correctamente un usuario", async function () {
          //         //Given:
          console.log(this.mockUser);

          //         //Then:
          const { statusCode, ok, _body } = await requester
            .post("/api/sessions/register")
            .send(this.mockUser)
            .expect(function (res) {
              // Comprobamos el código de estado de la respuesta
              if (res.status === 302) {
                console.log("Usuario Registrado"); // Mensaje si el código de estado es 302
              } else {
                console.log("Código de estado desconocido:", res.status); // Mensaje para otros códigos de estado
              }
            });

          // console.log(statusCode);

          //         //Assert that:
          expect(statusCode).is.equal(302);
        });

        //     // Test 02
        it("Test Login Usuario: Debe poder hacer login correctamente con el usuario registrado previamente.", async function () {
          //         //Given:
          const mockLogin = {
            email: this.mockUser.email,
            password: this.mockUser.password,
          };

          //         //Then:
          const result = await requester.post("/api/jwt/current").send(mockLogin);
          console.log(result);
          console.log(result.headers);

          const cookieResult = result.headers["set-cookie"][0];
          console.log(cookieResult);

          //         //Assert that:
          expect(result.statusCode).is.equal(200);

          const cookieData = cookieResult.split("=");
          this.cookie = {
            name: cookieData[0],
            value: cookieData[1],
          };
          expect(this.cookie.name).to.be.ok.and.eql("jwtCookieToken");
          expect(this.cookie.value).to.be.ok;
        });
      });
    });
  });
});
