document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById(
        "forgotPasswordForm"
    );

    const emailInput = document.getElementById(
        "forgotEmail"
    );

    const sendCodeButton = document.getElementById(
        "sendCodeButton"
    );

    const message = document.getElementById(
        "forgotPasswordMessage"
    );


    if (
        !form ||
        !emailInput ||
        !sendCodeButton ||
        !message
    ) {
        console.error(
            "Forgot password: required elements are missing."
        );

        return;
    }


    function showMessage(
        text,
        type = ""
    ) {

        message.textContent = text;

        message.className = "form-message";

        if (type) {
            message.classList.add(type);
        }
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email = emailInput.value
                .trim()
                .toLowerCase();


            if (!email) {

                showMessage(
                    "Please enter your email.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            if (!email.includes("@")) {

                showMessage(
                    "Please enter a valid email.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            sendCodeButton.disabled = true;

            sendCodeButton.textContent =
                "Sending...";

            showMessage("");


            try {

                const response = await fetch(
                    "/api/forgot-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email
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
                        "Unable to send the verification code.",
                        "error"
                    );

                    return;
                }


                /*
                 * Keep the email only for this
                 * password-reset flow.
                 */
                sessionStorage.setItem(
                    "financeflow_reset_email",
                    email
                );


                /*
                 * Move to verification page.
                 */
                window.location.href =
                    `/verify-code?email=${encodeURIComponent(email)}`;

            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );

                showMessage(
                    "Could not connect to FinanceFlow. Please try again.",
                    "error"
                );

            } finally {

                sendCodeButton.disabled = false;

                sendCodeButton.textContent =
                    "Send verification code";
            }

        }
    );

});