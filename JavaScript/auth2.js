//logout

const logout = document.querySelector('#logout');
logout.addEventListener ('click', (e) => {
  e.preventDefault();
  firebase.auth().signOut()
    .then(() => {
    window.location = 'login.html';
    console.log('user signed out');
  });
});