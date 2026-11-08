document.addEventListener(
    "DOMContentLoaded",
    () => {

        const button =
            document.getElementById(
                "saveSettingsButton"
            );


        const message =
            document.getElementById(
                "settingsMessage"
            );


        button.onclick =
            async () => {

                const name =
                    document
                        .getElementById("name")
                        .value
                        .trim();


                const currency =
                    document
                        .getElementById("currency")
                        .value;


                message.textContent = "";


                if (!name) {

                    message.textContent =
                        "Name cannot be empty.";

                    message.className =
                        "error-text";

                    return;

                }


                button.disabled =
                    true;


                button.textContent =
                    "Saving...";


                try {

                    const response =
                        await fetch(
                            "/api/settings",
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        name,
                                        currency
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Could not save settings."
                        );

                    }


                    message.textContent =
                        "Saved successfully ✓";


                    message.className =
                        "success-text";


                } catch (errorObject) {

                    message.textContent =
                        errorObject.message;


                    message.className =
                        "error-text";

                } finally {

                    button.disabled =
                        false;


                    button.textContent =
                        "Save changes";

                }

            };

    }
);