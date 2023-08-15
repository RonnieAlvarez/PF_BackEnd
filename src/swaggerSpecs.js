import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CoderHouse API Project with Swagger",
      description: "An eCommerce API application made with Express and documented with Swagger",
    },
  },
  // aqui van a estar todas las especificaciones tecnicas de mis apis
  apis: ["./src/docs/**/*.yaml"],
};

export const { swaggerSpecs } = swaggerJsdoc(options);
