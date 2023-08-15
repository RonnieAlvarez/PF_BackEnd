import { getAllTickets } from "../services/etickets.service.js";

/**
 * The function "showTickets" is an asynchronous function that retrieves all tickets and renders a view
 * with the tickets and the user information.
 * @param req - The `req` parameter is the request object, which contains information about the
 * incoming HTTP request from the client. It includes details such as the request method, URL, headers,
 * and any data sent in the request body.
 * @param res - The "res" parameter is the response object that is used to send the response back to
 * the client. It contains methods and properties that allow you to control the response, such as
 * setting the status code, headers, and sending the response body. In this case, it is used to render
 * a view
 */
export async function showTickets(req, res) {
  try {
    let etickets = await getAllTickets();
    let user = req.user;
    res.render("realTimeTickets", { etickets: etickets, user: user });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}

/**
 * The function "showTicketsSwagger" retrieves all tickets and sends them as a response, along with the
 * user information, if successful, otherwise it sends an error message.
 * @param req - The `req` parameter is the request object, which contains information about the
 * incoming HTTP request such as headers, query parameters, and request body. It is used to retrieve
 * information from the client and pass it to the server.
 * @param res - The "res" parameter is the response object that is used to send the response back to
 * the client. It is an instance of the Express response object.
 */
export async function showTicketsSwagger(req, res) {
  try {
    let etickets = await getAllTickets();
    let user = req.user;
    res.status(200).send({ etickets: etickets });
  } catch (error) {
    res.status(400).send({ messagedanger: `${error.message}` });
  }
}
