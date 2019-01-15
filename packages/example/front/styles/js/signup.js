/**
 * Launch the creation of the user account into the application
 */
async function signupUser(form) {
  await client.connect();
  try {
    await api.signup(
      {
        credentials: {
          login: form.login.value,
          password: form.password.value
        },
        profile: {
          email: form.email.value
        }
      },
      'user'
    );
    displayMessage(
      'Account created',
      'Your account has been created, please check your emails to confirm your account',
      'is-success'
    );
    goTo('login');
  } catch (e) {
    displayMessage('Account not created', `Your account could not been created. Cause: ${e.message}`, 'is-danger');
  }
}
