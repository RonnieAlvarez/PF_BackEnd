const socket = io();

let ename = document.getElementById("ename");
let submit = document.getElementById("submit");
let message = document.getElementById("message");
let messages = document.getElementById("messages");
let userEmail = " ";
/* This code is listening for a "Welcome" event emitted from the server using the `socket.on()` method.
When the event is received, it logs the `arg` parameter to the console, which is an object
containing a `messages` property. It then assigns the value of the `messages` property to the
`newMessages` variable and logs it to the console. Finally, it calls the `imprimirMessages()`
function with the `newMessages` array as a parameter to display the messages on the page. */
let newMessages = [];
socket.on("Welcome", (arg) => {
  console.log(arg);
  newMessages = arg.messages;
  console.log(newMessages);
  printMessages(newMessages);
});

socket.on("userEmail", (userEmail) => {
  ename.innerText = userEmail;
  socket.emit("newUser", userEmail);
});

/* This code is adding an event listener to the "submit" button. When the button is clicked, it
prevents the default form submission behavior using `e.preventDefault()`. It then gets the value of
the "message" input field, trims any whitespace, and stores it in the `messageText` variable. It
clears the "message" input field by setting its value to an empty string. It then logs the message
to the console with the user's email address and the current time. Finally, it emits a "message"
event to the server with an object containing the user's email address, the message text, and the
current time. It also emits a "user" event to the server with the user's email address. */
submit.addEventListener("click", (e) => {
  e.preventDefault();
  const messageText = message.value.trim();
  message.value = "";
  console.log("Client: ", messageText);
  socket.emit("message", { userEmail, message: messageText, date: new Date().toLocaleTimeString() });
  socket.emit("user", { userEmail });
});

/* This code is listening for a "message" event emitted from the server using the `socket.on()` method.
When the event is received, it logs the message data to the console and pushes the message object
into the `newMessages` array. It then calls the `printMessages()` function with the updated
`newMessages` array to display the messages on the page. */
socket.on("message", (data) => {
  console.log("Message received: ", data);
  newMessages.push(data);
  printMessages(newMessages);
});

/**
 * The function takes an array of messages and prints them in a formatted string.
 * @param newMessages - The parameter `newMessages` is an array of objects, where each object
 * represents a message and contains the following properties:
 */
function printMessages(newMessages) {
  let _newMessages = "";
  for (const message of newMessages) {
    _newMessages += `${message.userEmail}: ${message.message} - ${message.date}\n`;
  }
  messages.innerText = _newMessages;
}

/* This code is listening for a "newUser" event emitted from the server using the `socket.on()` method.
When the event is received, it displays a toast notification using the SweetAlert library with the
message "New user [user email] connected!" at the top-right position of the screen. The `_name`
parameter is the email address of the new user that connected to the chat. */
socket.on("newUser", (_name) => {
  Swal.fire({
    text: `New user ${_name} conected!`,
    toast: true,
    position: "top-right",
  });
});
