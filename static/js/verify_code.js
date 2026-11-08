document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById(
        "verifyCodeForm"
    );

    const codeInput = document.getElementById(
        "verificationCode"
    );

    const verifyButton = document.getElementById(
        "verifyCodeButton"
    );

    const message = document.getElementById(
        "verifyCodeMessage"
    );


    if (
        !form ||
        !codeInput ||
        !verifyButton ||
        !message
    ) {
        console.error(
            "Verify code: required elements are missing."
        );

        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    let email =
        params.get("email");


    if (!email) {

        email =
            sessionStorage.getItem(
                "financeflow_reset_email"
            );
    }


    if (email) {
        email = email
            .trim()
            .toLowerCase();
    }


    if (!email) {

        message.textContent =
            "Your password reset session has expired. Please request a new code.";

        message.className =
            "form-message error";

        verifyButton.disabled = true;

        return;
    }


    /*
     * Keep the email available if the user
     * refreshes the verification page.
     */
    sessionStorage.setItem(
        "financeflow_reset_email",
        email
    );


    codeInput.focus();


    /*
     * Only allow numbers.
     */
    codeInput.addEventListener(
        "input",
        () => {

            codeInput.value =
                codeInput.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

        }
    );


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


            const code =
                codeInput.value.trim();


            if (!/^\d{6}$/.test(code)) {

                showMessage(
                    "Please enter the 6-digit verification code.",
                    "error"
                );

                codeInput.focus();

                return;
            }


            verifyButton.disabled = true;

            verifyButton.textContent =
                "Verifying...";

            showMessage("");


            try {

                const response = await fetch(
                    "/api/verify-reset-code",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            code: code
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
                        "Invalid verification code.",
                        "error"
                    );

                    codeInput.select();

                    return;
                }


                /*
                 * The Flask session now contains:
                 *
                 * password_reset_user_id
                 * password_reset_code_id
                 *
                 * so the next page does not need
                 * to trust the browser with the
                 * reset identity.
                 */
                window.location.href =
                    data.redirect ||
                    "/reset-password";

            } catch (error) {

                console.error(
                    "Verification error:",
                    error
                );

                showMessage(
                    "Could not connect to FinanceFlow. Please try again.",
                    "error"
                );

            } finally {

                verifyButton.disabled = false;

                verifyButton.textContent =
                    "Verify code";
            }

        }
    );

});