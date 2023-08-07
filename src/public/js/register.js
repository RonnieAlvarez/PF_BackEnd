const form = document.getElementById("registerForm");

/* This code is adding an event listener to the "submit" event of a form with the ID "registerForm".
When the form is submitted, it prevents the default behavior (which is to refresh the page), creates
a new FormData object from the form data, converts it to a JavaScript object, and sends it as a JSON
string in a POST request to the "/api/sessions/register" endpoint. If the response is successful
(status code 200-299), it logs a message to the console and redirects the user to the login page. If
there is an error, it logs the error to the console. Finally, it logs whether the response was
successful or not to the console. */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  console.log(data);
  try {
    const response = await fetch("/api/sessions/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });
    if (response.ok) {
      response.statusCode = 200;
      console.log("Registed: " + data);

      window.location.replace("/users/login");
    } else {
      throw new Error("Unable to log in");
    }
  } catch (error) {
    console.error(error);
  }
  (res) => console.log(res.ok);
});
