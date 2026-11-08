let dashboardCurrency = "USD";


async function loadDashboard() {

    const [
        expenses,
        settings,
        categories
    ] = await Promise.all([

        fetch("/api/expenses")
            .then(response => response.json()),

        fetch("/api/settings")
            .then(response => response.json()),

        fetch("/api/categories")
            .then(response => response.json())

    ]);


    dashboardCurrency =
        settings.currency || "USD";


    const total =
        expenses.reduce(
            (sum, expense) =>
                sum + Number(expense.amount),
            0
        );


    const average =
        expenses.length
            ? total / expenses.length
            : 0;


    document.getElementById(
        "totalSpending"
    ).textContent =
        money(
            total,
            dashboardCurrency
        );


    document.getElementById(
        "expenseCount"
    ).textContent =
        `${expenses.length} recorded ${
            expenses.length === 1
                ? "expense"
                : "expenses"
        }`;


    document.getElementById(
        "averageExpense"
    ).textContent =
        money(
            average,
            dashboardCurrency
        );


    const groups = {};


    expenses.forEach(
        expense => {

            groups[expense.category] =
                (
                    groups[expense.category] ||
                    0
                ) +
                Number(expense.amount);

        }
    );


    const sorted =
        Object.entries(groups)
            .sort(
                (a, b) => b[1] - a[1]
            );


    document.getElementById(
        "topCategory"
    ).textContent =
        sorted[0]
            ? sorted[0][0]
            : "—";


    document.getElementById(
        "topCategoryAmount"
    ).textContent =
        sorted[0]
            ? money(
                sorted[0][1],
                dashboardCurrency
            )
            : "No spending yet";


    const categorySummary =
        document.getElementById(
            "categorySummary"
        );


    if (!sorted.length) {

        categorySummary.innerHTML = `
            <div class="empty-state compact">
                <div class="empty-icon">◈</div>
                <strong>No category data yet</strong>
                <span>Add an expense to see your breakdown.</span>
            </div>
        `;

    } else {

        const largest =
            sorted[0][1];

        categorySummary.innerHTML =
            sorted
                .slice(0, 6)
                .map(
                    ([name, amount]) => {

                        const percentage =
                            Math.max(
                                5,
                                (
                                    amount /
                                    largest
                                ) * 100
                            );

                        return `
                            <div class="category-line">

                                <div class="category-line-top">

                                    <div class="category-name">
                                        <span class="category-dot"></span>
                                        ${escapeHtml(name)}
                                    </div>

                                    <strong>
                                        ${money(
                                            amount,
                                            dashboardCurrency
                                        )}
                                    </strong>

                                </div>

                                <div class="bar">
                                    <i
                                        style="width:${percentage}%"
                                    ></i>
                                </div>

                            </div>
                        `;

                    }
                )
                .join("");

    }


    const recent =
        document.getElementById(
            "recentExpenses"
        );


    const empty =
        document.getElementById(
            "recentExpensesEmpty"
        );


    if (!expenses.length) {

        recent.innerHTML = "";

        empty.style.display =
            "flex";

    } else {

        recent.innerHTML =
            expenses
                .slice(0, 5)
                .map(
                    expense => `

                        <div class="expense-row">

                            <div class="expense-avatar">
                                ${escapeHtml(
                                    expense.category
                                        .slice(0, 1)
                                        .toUpperCase()
                                )}
                            </div>

                            <div class="expense-main">

                                <strong>
                                    ${escapeHtml(
                                        expense.title
                                    )}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        expense.category
                                    )}
                                    ·
                                    ${expense.date}
                                </small>

                            </div>

                            <strong class="expense-amount">
                                -${money(
                                    expense.amount,
                                    dashboardCurrency
                                )}
                            </strong>

                        </div>

                    `
                )
                .join("");

        empty.style.display =
            "none";

    }


    const categorySelect =
        document.getElementById(
            "dashboardExpenseCategory"
        );


    categorySelect.innerHTML =
        categories
            .map(
                category => `

                    <option
                        value="${escapeHtml(
                            category.name
                        )}"
                    >
                        ${escapeHtml(
                            category.name
                        )}
                    </option>

                `
            )
            .join("");

}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const today =
            new Date()
                .toISOString()
                .slice(0, 10);


        document.getElementById(
            "dashboardExpenseDate"
        ).value = today;


        document.getElementById(
            "openAddExpense"
        ).onclick = () => {

            openModal(
                "expenseModal"
            );

        };


        document.getElementById(
            "emptyAddExpense"
        ).onclick = () => {

            openModal(
                "expenseModal"
            );

        };


        document.getElementById(
            "dashboardExpenseForm"
        ).onsubmit =
            async event => {

                event.preventDefault();

                const error =
                    document.getElementById(
                        "dashboardExpenseError"
                    );

                error.textContent = "";


                try {

                    const response =
                        await fetch(
                            "/api/expenses",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        title:
                                            document
                                                .getElementById(
                                                    "dashboardExpenseTitle"
                                                )
                                                .value
                                                .trim(),

                                        amount:
                                            document
                                                .getElementById(
                                                    "dashboardExpenseAmount"
                                                )
                                                .value,

                                        category:
                                            document
                                                .getElementById(
                                                    "dashboardExpenseCategory"
                                                )
                                                .value,

                                        date:
                                            document
                                                .getElementById(
                                                    "dashboardExpenseDate"
                                                )
                                                .value

                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            "Unable to save expense."
                        );
                    }


                    closeModal(
                        "expenseModal"
                    );


                    event.target.reset();


                    document.getElementById(
                        "dashboardExpenseDate"
                    ).value = today;


                    await loadDashboard();

                } catch (errorObject) {

                    error.textContent =
                        errorObject.message;

                }

            };


        loadDashboard()
            .catch(console.error);

    }
);