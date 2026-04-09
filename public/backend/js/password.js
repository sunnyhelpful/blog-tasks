// document.addEventListener("DOMContentLoaded", function() {
//   var showHideElements = document.querySelectorAll(".show-hide");
//   var passwordInputs = document.querySelectorAll('input[name="password"], input[name="password_confirmation"]');
//   var submitButton = document.querySelector('form button[type="submit"]');

//   showHideElements.forEach(function(element) {
//     element.style.display = "block";
//   });

//   showHideElements.forEach(function(span, index) {
//     var passwordInput = passwordInputs[index];

//     // Toggle the password visibility
//     span.addEventListener("click", function() {
//       if (passwordInput.type === "password") {
//         passwordInput.setAttribute("type", "text");
//         span.classList.remove("show");
//       } else {
//         passwordInput.setAttribute("type", "password");
//         span.classList.add("show");
//       }
//     });
//   });

//   submitButton.addEventListener("click", function() {
//     passwordInputs.forEach(function(input) {
//       input.setAttribute("type", "password");
//     });
//   });
// });

document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('.password-field');
      const icon = button.querySelector('i');

      if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
      } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
      }
  });
});
