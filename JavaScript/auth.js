// Firebase Sign-Up Function

// TODO: Display errors to user such as ->
// 1. Email already taken
// 2. Passwork too weak (Firebase requires [reccomends?] 6 characters)

// For now errors are displayed in console only (CTRL+Shift+i)
$("#sign-up-button").click(function() {

    const signupForm = document.querySelector('#signup-form');
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

    const auth = firebase.auth();
  
    var userEmail = document.getElementById("new-user-email").value;
    var userPassword = document.getElementById("new-user-password").value;
    var confirmPass = document.getElementById("confirm-password").value;
    if (userPassword === confirmPass) { 
      auth.createUserWithEmailAndPassword(userEmail, userPassword)
        .then((userCredential) => {
        // Signed in 
          const user = userCredential.user;
          signupForm.reset();
          
        db.collection("users").add({
            email: userEmail
        }).then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        })
        window.location = 'month.html';
      });
    } else {
      // Change this later, alerts are terrible.
      alert("Passwords must match");
    }
  })
});
  
  // Firebase log-in function
  
  // TODO: Display errors to user such as ->
  // 1. Only display ("Invalid Login") for security reasons?
  
  // For now errors are displayed in console only (CTRL+Shift+i)
  const loginForm = document.querySelector('#login-form');
  loginForm.addEventListener ('submit', (e) =>{
    e.preventDefault();
    let userEmail = document.getElementById("user-email").value;
    //console.log(u_email);
    let userPassword = document.getElementById("user-password").value;
    firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
        .then((userCredential) => {
        // Signed in 
        window.location = 'month.html';
        const user = userCredential.user;
        console.log(user);
        loginForm.reset();
      });
  });
  /*
  $("#login-button").click(function() {
    let userEmail = document.getElementById("user-email").value;
    //console.log(u_email);
    let userPassword = document.getElementById("user-password").value;
    firebase.auth().signInWithEmailAndPassword(userEmail, userPassword)
        .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user);
        alert("??");
      });
  });
*/

