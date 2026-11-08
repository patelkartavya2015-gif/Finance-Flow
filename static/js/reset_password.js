document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById(
        "resetPasswordForm"
    );

    const newPasswordInput =
        document.getElementById(
            "newPassword"
        );

    const confirmPasswordInput =
        document.getElementById(
            "confirmPassword"
        );

    const resetButton =
        document.getElementById(
            "resetPasswordButton"
        );

    const message =
        document.getElementById(
            "resetPasswordMessage"
        );


    if (
        !form ||
        !newPasswordInput ||
        !confirmPasswordInput ||
        !resetButton ||
        !message
    ) {

        console.error(
            "Reset password: required elements are missing."
        );

        return;
    }


    function showMessage(
        text,
        type = ""
    ) {

        message.textContent = text;

        message.className =
            "form-message";

        if (type) {
            message.classList.add(type);
        }
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const password =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            if (password.length < 6) {

                showMessage(
                    "Your password must be at least 6 characters.",
                    "error"
                );

                newPasswordInput.focus();

                return;
            }


            if (
                password !==
                confirmPassword
            ) {

                showMessage(
                    "Passwords do not match.",
                    "error"
                );

                confirmPasswordInput.focus();

                return;
            }


            resetButton.disabled = true;

            resetButton.textContent =
                "Changing password...";

            showMessage("");


            try {

                const response = await fetch(
                    "/api/reset-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            password:
                                password,

                            confirm_password:
                                confirmPassword
                        })
                    }
                );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    data.success === false
                ) {

                    showMessage(
                        data.message ||
                        "Unable to change your password.",
                        "error"
                    );

                    return;
                }


                /*
                 * The reset flow is complete.
                 */
                sessionStorage.removeItem(
                    "financeflow_reset_email"
                );


                showMessage(
                    "Password changed successfully! Redirecting to login...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        data.redirect ||
                        "/login";

                }, 1200);

            } catch (error) {

                console.error(
                    "Reset password error:",
                    error
                );

                showMessage(
                    "Could not connect to FinanceFlow. Please try again.",
                    "error"
                );

            } finally {

                resetButton.disabled = false;

                resetButton.textContent =
                    "Change password";
            }

        }
    );

});