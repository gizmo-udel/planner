const mailField = document.getElementById('mail');
const resetPassword = document.getElementById('resetPassword');

const auth = firebase.auth();

resetPassword.addEventListener ('click', (e) => {
    e.preventDefault();
    const email = mailField.value;
    auth.sendPasswordResetEmail(email)
    .then(() =>{
        window.location = 'login.html';
        console.log('Password reset email sent successfully!');
    })
    .catch(error => {
        alert("Email not found.");
        console.error(error);
    });
});