/**
 * Launch the connection of the user into the application
 */
async function connectUser(form) {
  if (!form.login.value || !form.password.value) {
    document.getElementById('login-errors').innerHTML += `<p>Login and password are required</p>`;
    return;
  }

  await client.setCredentials({ login: form.login.value, password: form.password.value });
  client
    .connect()
    .then(() => {
      displayMessage('Login success', 'Welcome to wonderful service', 'is-success');
      goTo('home');
    })
    .catch((e) => {
      displayMessage(
        'Login failed',
        'Your account is not validated, have you clicked on the link in the email ?',
        'is-warning'
      );
    });
}
