document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const error =
                document.getElementById(
                    "formError"
                );

            error.textContent = "";

            try {

                const response =
                    await fetch(
                        "/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email:
                                    document
                                        .getElementById("email")
                                        .value
                                        .trim(),

                                password:
                                    document
                                        .getElementById("password")
                                        .value
                            })
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                        "Unable to sign in."
                    );
                }

                location.href =
                    data.redirect ||
                    "/dashboard";

            } catch (errorObject) {

                error.textContent =
                    errorObject.message;

            }

        }
    );