/**
 * This function returns a rendered real-time chat page with a 201 status code or a 400 status code
 * with an error message.
 */
export async function getchat(req, res) {
  try {
    let user = req.user;
    return res.status(201).render("realTimeChat", { user });
  } catch (error) {
    res.status(400).render("nopage", { messagedanger: `${error.message}` });
  }
}
