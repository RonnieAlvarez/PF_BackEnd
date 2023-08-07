const form = document.getElementById("loginForm");

/* This code is adding an event listener to the login form that listens for a submit event. When the
form is submitted, it prevents the default behavior (which is to refresh the page), creates a new
FormData object from the form data, converts it to a JSON object, and sends a POST request to the
"/api/jwt/current" endpoint with the JSON object as the request body. */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));
  fetch("/api/jwt/current", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((result) => {
      if (result.status === 200) {
        result.json().then(() => {
          window.location.replace("/users");
        });
      } else if (result.status === 401) {
        window.location.replace("/users/register");
      } else if (result.status === 403) {
        window.location.replace("/users/login");
      } else if (result.status === 403) {
        window.location.replace("/users/forgot");
      }
    })
    .then((result) => {
      if (result.status === 200) {
        window.location.replace("/users/login");
      }
    });
});
