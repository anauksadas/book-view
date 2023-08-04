document.addEventListener("DOMContentLoaded", () => {
  const formOpenBtn = document.querySelector("#form-open"),
    home = document.querySelector(".home"),
    formContainer = document.querySelector(".form_container"),
    formCloseBtn = document.querySelector(".form_close"),
    signupBtn = document.querySelector("#signup"),
    loginBtn = document.querySelector("#login"),
    pwShowHide = document.querySelectorAll(".pw_hidden");
  const failAlert = document.querySelector("#fail-alert");
  const searchBtn = document.querySelector("#search-btn");
 

  formOpenBtn.addEventListener("click", () => {
    home.classList.add("show");
  });

  formCloseBtn.addEventListener("click", () => {
    home.classList.remove("show");
  });

  pwShowHide.forEach((icon) => {
    icon.addEventListener("click", () => {
      let getPwInput = icon.parentElement.querySelector("input");

      if (getPwInput.type === "password") {
        getPwInput.type = "text";
        icon.classList.replace("uil-eye-slash", "uil-eye");
      } else {
        getPwInput.type = "password";
        icon.classList.replace("uil-eye", "uil-eye-slash");
      }
    });
  });

  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.add("active");
  });
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    formContainer.classList.remove("active");
  });

  document
    .querySelector(".signup-form")
    .addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the form from submitting

      const pw1 = document.querySelector("#pw1").value;
      const pw2 = document.querySelector("#pw2").value;

      if (pw1 === pw2) {
        // Passwords match, submit the form
        document.querySelector(".signup-form").submit();
      } else {
        // Passwords don't match, show the failAlert
        failAlert.classList.add("fail_show");
      }
    });
});
