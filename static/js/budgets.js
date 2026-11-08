let budgets = [];
let budgetCategories = [];
let expenses = [];
let budgetCurrency = "USD";


async function loadBudgets() {

    try {

        budgets =
            await fetch(
                "/api/budgets"
            ).then(
                response => response.json()
            );


        budgetCategories =
            await fetch(
                "/api/categories"
            ).then(
                response => response.json()
            );


        expenses =
            await fetch(
                "/api/expenses"
            ).then(
                response => response.json()
            );


        const settings =
            await fetch(
                "/api/settings"
            ).then(
                response => response.json()
            );


        budgetCurrency =
            settings.currency ||
            "USD";


        document.getElementById(
            "budgetCategory"
        ).innerHTML =
            budgetCategories
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


        renderBudgets();

    } catch (error) {

        console.error(
            "Failed to load budgets:",
            error
        );

    }

}


function getBudgetSpending(budget) {

    return expenses
        .filter(
            expense =>
                expense.category ===
                budget.category
        )
        .filter(
            expense => {

                if (!expense.date) {
                    return false;
                }


                const parts =
                    expense.date.split("-");


                const expenseYear =
                    Number(parts[0]);

                const expenseMonth =
                    Number(parts[1]);


                return (
                    expenseYear ===
                        Number(budget.year)
                    &&
                    expenseMonth ===
                        Number(budget.month)
                );

            }
        )
        .reduce(
            (
                total,
                expense
            ) =>
                total +
                Number(expense.amount || 0),
            0
        );

}


function renderBudgets() {

    const grid =
        document.getElementById(
            "budgetsGrid"
        );


    grid.innerHTML =
        budgets
            .map(
                budget => {

                    const spent =
                        getBudgetSpending(
                            budget
                        );


                    const amount =
                        Number(
                            budget.amount
                        );


                    const percentage =
                        amount > 0
                            ? (
                                spent /
                                amount
                            ) * 100
                            : 0;


                    const barWidth =
                        Math.min(
                            percentage,
                            100
                        );


                    const remaining =
                        amount -
                        spent;


                    let statusText;
                    let statusClass;


                    if (
                        remaining >= 0
                    ) {

                        statusText =
                            `${money(
                                remaining,
                                budgetCurrency
                            )} remaining`;

                        statusClass =
                            "budget-safe";

                    } else {

                        statusText =
                            `${money(
                                Math.abs(
                                    remaining
                                ),
                                budgetCurrency
                            )} over budget`;

                        statusClass =
                            "budget-over";

                    }


                    return `

                        <article class="budget-card">

                            <div class="budget-head">

                                <span class="pill">
                                    ${escapeHtml(
                                        budget.category
                                    )}
                                </span>

                                <button
                                    onclick="editBudget(${budget.id})"
                                >
                                    Edit
                                </button>

                            </div>


                            <strong>
                                ${money(
                                    amount,
                                    budgetCurrency
                                )}
                            </strong>


                            <small>
                                ${budget.month}/${budget.year}
                            </small>


                            <div class="budget-track">

                                <i
                                    style="width:${barWidth}%"
                                ></i>

                            </div>


                            <div class="budget-foot">

                                <span>
                                    ${money(
                                        spent,
                                        budgetCurrency
                                    )} spent
                                </span>

                                <span
                                    class="${statusClass}"
                                >
                                    ${statusText}
                                </span>

                            </div>


                            <div class="budget-foot">

                                <span>
                                    ${Math.round(
                                        percentage
                                    )}% used
                                </span>

                                <button
                                    class="danger-text"
                                    onclick="deleteBudget(${budget.id})"
                                >
                                    Delete
                                </button>

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    document.getElementById(
        "budgetsEmpty"
    ).style.display =
        budgets.length
            ? "none"
            : "flex";

}


window.editBudget =
    function(id) {

        const budget =
            budgets.find(
                item =>
                    item.id === id
            );


        if (!budget) {
            return;
        }


        document.getElementById(
            "budgetId"
        ).value =
            budget.id;


        document.getElementById(
            "budgetCategory"
        ).value =
            budget.category;


        document.getElementById(
            "budgetAmount"
        ).value =
            budget.amount;


        document.getElementById(
            "budgetMonth"
        ).value =
            budget.month;


        document.getElementById(
            "budgetYear"
        ).value =
            budget.year;


        document.getElementById(
            "budgetModalTitle"
        ).textContent =
            "Edit budget";


        document.getElementById(
            "budgetError"
        ).textContent =
            "";


        openModal(
            "budgetModal"
        );

    };


window.deleteBudget =
    async function(id) {

        if (
            !confirm(
                "Delete this budget?"
            )
        ) {
            return;
        }


        const response =
            await fetch(
                `/api/budgets/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const data =
                await response.json();

            alert(
                data.message ||
                "Unable to delete budget."
            );

            return;

        }


        await loadBudgets();

    };


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const now =
            new Date();


        document.getElementById(
            "budgetMonth"
        ).value =
            now.getMonth() + 1;


        document.getElementById(
            "budgetYear"
        ).value =
            now.getFullYear();


        document.getElementById(
            "addBudgetButton"
        ).onclick =
            () => {

                document.getElementById(
                    "budgetId"
                ).value = "";


                document.getElementById(
                    "budgetAmount"
                ).value = "";


                document.getElementById(
                    "budgetMonth"
                ).value =
                    now.getMonth() + 1;


                document.getElementById(
                    "budgetYear"
                ).value =
                    now.getFullYear();


                document.getElementById(
                    "budgetModalTitle"
                ).textContent =
                    "Add budget";


                document.getElementById(
                    "budgetError"
                ).textContent =
                    "";


                openModal(
                    "budgetModal"
                );

            };


        document.getElementById(
            "budgetForm"
        ).onsubmit =
            async event => {

                event.preventDefault();


                const errorElement =
                    document.getElementById(
                        "budgetError"
                    );


                errorElement.textContent =
                    "";


                const id =
                    document.getElementById(
                        "budgetId"
                    ).value;


                const response =
                    await fetch(
                        id
                            ? `/api/budgets/${id}`
                            : "/api/budgets",
                        {
                            method:
                                id
                                    ? "PUT"
                                    : "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    category:
                                        document
                                            .getElementById(
                                                "budgetCategory"
                                            )
                                            .value,

                                    amount:
                                        document
                                            .getElementById(
                                                "budgetAmount"
                                            )
                                            .value,

                                    month:
                                        document
                                            .getElementById(
                                                "budgetMonth"
                                            )
                                            .value,

                                    year:
                                        document
                                            .getElementById(
                                                "budgetYear"
                                            )
                                            .value

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    errorElement.textContent =
                        data.message ||
                        "Unable to save.";

                    return;

                }


                closeModal(
                    "budgetModal"
                );


                await loadBudgets();

            };


        loadBudgets();

    }
);