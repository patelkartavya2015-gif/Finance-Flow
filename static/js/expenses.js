let expenses = [];
let categories = [];
let currency = "USD";

let deleteId = null;
let deleteCode = "";


async function loadExpenses() {

    expenses =
        await fetch(
            "/api/expenses"
        ).then(
            response =>
                response.json()
        );


    categories =
        await fetch(
            "/api/categories"
        ).then(
            response =>
                response.json()
        );


    const settings =
        await fetch(
            "/api/settings"
        ).then(
            response =>
                response.json()
        );


    currency =
        settings.currency ||
        "USD";


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    categoryFilter.innerHTML =
        `
        <option value="">
            All categories
        </option>
        ` +
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


    const categorySelect =
        document.getElementById(
            "expenseCategory"
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


    renderExpenses();

}


function renderExpenses() {

    const search =
        document.getElementById(
            "expenseSearch"
        )
        .value
        .toLowerCase();


    const filter =
        document.getElementById(
            "categoryFilter"
        ).value;


    const rows =
        expenses.filter(
            expense => {

                const matchesSearch =
                    !search ||
                    expense.title
                        .toLowerCase()
                        .includes(search) ||
                    expense.category
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    !filter ||
                    expense.category === filter;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    const table =
        document.getElementById(
            "expensesTableBody"
        );


    table.innerHTML =
        rows
            .map(
                expense => `

                    <tr>

                        <td>

                            <div class="table-expense">

                                <div class="expense-avatar">
                                    ${escapeHtml(
                                        expense.category
                                            .slice(0, 1)
                                            .toUpperCase()
                                    )}
                                </div>

                                <div>

                                    <div class="table-title">
                                        ${escapeHtml(
                                            expense.title
                                        )}
                                    </div>

                                    <small>
                                        Expense
                                    </small>

                                </div>

                            </div>

                        </td>


                        <td>

                            <span class="pill">
                                ${escapeHtml(
                                    expense.category
                                )}
                            </span>

                        </td>


                        <td>
                            ${expense.date}
                        </td>


                        <td class="amount-cell">
                            -${money(
                                expense.amount,
                                currency
                            )}
                        </td>


                        <td>

                            <div class="row-actions">

                                <button
                                    class="table-action"
                                    onclick="editExpense(${expense.id})"
                                >
                                    Edit
                                </button>

                                <button
                                    class="table-action danger-text"
                                    onclick="askDelete(${expense.id})"
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>

                `
            )
            .join("");


    document.getElementById(
        "expensesEmpty"
    ).style.display =
        rows.length
            ? "none"
            : "flex";

}


function resetExpenseForm() {

    document.getElementById(
        "expenseForm"
    ).reset();


    document.getElementById(
        "expenseId"
    ).value = "";


    document.getElementById(
        "expenseDate"
    ).value =
        new Date()
            .toISOString()
            .slice(0, 10);


    document.getElementById(
        "expenseModalTitle"
    ).textContent =
        "Add expense";

}


window.editExpense =
    function(id) {

        const expense =
            expenses.find(
                item =>
                    item.id === id
            );


        if (!expense) {
            return;
        }


        document.getElementById(
            "expenseId"
        ).value =
            expense.id;


        document.getElementById(
            "expenseTitle"
        ).value =
            expense.title;


        document.getElementById(
            "expenseAmount"
        ).value =
            expense.amount;


        document.getElementById(
            "expenseDate"
        ).value =
            expense.date;


        document.getElementById(
            "expenseCategory"
        ).value =
            expense.category;


        document.getElementById(
            "expenseModalTitle"
        ).textContent =
            "Edit expense";


        openModal(
            "expenseModal"
        );

    };


window.askDelete =
    function(id) {

        deleteId = id;


        deleteCode =
            Math.random()
                .toString(36)
                .slice(2, 8)
                .toUpperCase();


        document.getElementById(
            "deleteCode"
        ).textContent =
            deleteCode;


        document.getElementById(
            "deleteInput"
        ).value = "";


        openModal(
            "deleteModal"
        );

    };


document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "openExpenseModal"
        ).onclick =
            () => {

                resetExpenseForm();

                openModal(
                    "expenseModal"
                );

            };


        document.getElementById(
            "expenseSearch"
        ).oninput =
            renderExpenses;


        document.getElementById(
            "categoryFilter"
        ).onchange =
            renderExpenses;


        document.getElementById(
            "expenseForm"
        ).onsubmit =
            async event => {

                event.preventDefault();


                const id =
                    document.getElementById(
                        "expenseId"
                    ).value;


                const url =
                    id
                        ? `/api/expenses/${id}`
                        : "/api/expenses";


                const method =
                    id
                        ? "PUT"
                        : "POST";


                const response =
                    await fetch(
                        url,
                        {
                            method,

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    title:
                                        document
                                            .getElementById(
                                                "expenseTitle"
                                            )
                                            .value
                                            .trim(),

                                    amount:
                                        document
                                            .getElementById(
                                                "expenseAmount"
                                            )
                                            .value,

                                    category:
                                        document
                                            .getElementById(
                                                "expenseCategory"
                                            )
                                            .value,

                                    date:
                                        document
                                            .getElementById(
                                                "expenseDate"
                                            )
                                            .value

                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    document.getElementById(
                        "expenseError"
                    ).textContent =
                        data.message ||
                        "Unable to save.";

                    return;

                }


                closeModal(
                    "expenseModal"
                );


                await loadExpenses();

            };


        document.getElementById(
            "cancelDelete"
        ).onclick =
            () => {

                closeModal(
                    "deleteModal"
                );

            };


        document.getElementById(
            "confirmDelete"
        ).onclick =
            async () => {

                const entered =
                    document.getElementById(
                        "deleteInput"
                    ).value
                    .trim()
                    .toUpperCase();


                if (
                    entered !==
                    deleteCode
                ) {

                    return;

                }


                await fetch(
                    `/api/expenses/${deleteId}`,
                    {
                        method: "DELETE"
                    }
                );


                closeModal(
                    "deleteModal"
                );


                await loadExpenses();

            };


        loadExpenses();

    }
);