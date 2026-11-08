document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const [
            expenses,
            settings
        ] = await Promise.all([

            fetch("/api/expenses")
                .then(
                    response =>
                        response.json()
                ),

            fetch("/api/settings")
                .then(
                    response =>
                        response.json()
                )

        ]);


        const currency =
            settings.currency ||
            "USD";


        const total =
            expenses.reduce(
                (sum, expense) =>
                    sum +
                    Number(
                        expense.amount
                    ),
                0
            );


        document.getElementById(
            "insightTotal"
        ).textContent =
            money(
                total,
                currency
            );


        document.getElementById(
            "insightCount"
        ).textContent =
            expenses.length;


        const largest =
            [...expenses]
                .sort(
                    (a, b) =>
                        Number(b.amount) -
                        Number(a.amount)
                )[0];


        document.getElementById(
            "insightLargest"
        ).textContent =
            largest
                ? money(
                    largest.amount,
                    currency
                )
                : "—";


        document.getElementById(
            "insightLargestName"
        ).textContent =
            largest
                ? largest.title
                : "No expenses yet";


        const groups = {};


        expenses.forEach(
            expense => {

                groups[expense.category] =
                    (
                        groups[
                            expense.category
                        ] || 0
                    ) +
                    Number(
                        expense.amount
                    );

            }
        );


        const sorted =
            Object.entries(groups)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                );


        const max =
            sorted[0]?.[1] ||
            1;


        document.getElementById(
            "insightBars"
        ).innerHTML =
            sorted
                .map(
                    ([name, amount]) => `

                        <div class="insight-row">

                            <div class="insight-label">

                                <span>
                                    ${escapeHtml(name)}
                                </span>

                                <strong>
                                    ${money(
                                        amount,
                                        currency
                                    )}
                                </strong>

                            </div>

                            <div class="bar">

                                <i
                                    style="width:${
                                        (
                                            amount /
                                            max
                                        ) * 100
                                    }%"
                                ></i>

                            </div>

                        </div>

                    `
                )
                .join("");

    }
);