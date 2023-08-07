import { TicketModel } from "../models/ecommerce.model.js";

/**
 * This function retrieves all non-deleted tickets from a MongoDB database using the eticketsModel.
 */
export async function getAllTickets() {
  try {
    const Tickets = await TicketModel.find({ deletedAt: { $exists: false } }).lean();
    return Tickets;
  } catch (error) {
    throw new Error(error.message);
  }
}
