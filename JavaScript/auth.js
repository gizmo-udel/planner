

/* still need to add firebase sdk to project 

// only handling signup  (adding new users)
// sign up form only for new users, not for returning users 

const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // sign up the user using firebase method
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    console.log(cred.user);
    // reset form
    signupForm.reset();
  });
});

*/