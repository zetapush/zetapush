/**
 * Ask reset password
 */
async function askResetPassword(form) {
  await client.connect();

  try {
    await api.askResetPassword(
      {
        login: form.login.value
      },
      "user"
    );
    displayMessage(
      "Reset password",
      "A link was sent to reset your password",
      "is-success"
    );
    goTo("login");
  } catch (e) {
    displayMessage(
      "Reset password",
      `Failed to send the link to reset your password. Cause: ${e.message}`,
      "is-danger"
    );
  }
}

/**
 * Confirm reset password
 */
async function confirmResetPassword(form) {
  await client.connect();
  try {
    console.log("token : ", sessionStorage.getItem("token"));
    await api.confirmResetPassword(
      {
        token: sessionStorage.getItem("token"),
        firstPassword: form.firstPassword.value,
        secondPassword: form.secondPassword.value
      },
      "user"
    );
    displayMessage("Reset password", "Password changed", "is-success");
    goTo("login");
    sessionStorage.clear();
  } catch (e) {
    displayMessage(
      "Reset password",
      `Failed to reset the password. Cause: ${e.message}`,
      "is-danger"
    );
  }
}
