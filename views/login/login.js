"use strict";

const { User } = require("./models/user")
const { auth } = require('./middleware/auth')

const id = document.querySelector("#id"), 
    password = document.querySelector("#password"),
    loginButton = document.querySelector("button");

loginButton.addEventListener("click", login);

function login() {
    const request = {
        id : id.value,
        password : password.value,
    };
    console.log(request);
}
fetch('/login',{
  method: "POST",
  headers: {
  	"Content-Type": "application/json"
  },
  body: JSON.stringify(request)
});