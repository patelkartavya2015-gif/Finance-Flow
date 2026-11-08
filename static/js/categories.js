let cats = [];


async function loadCategories() {

    cats =
        await fetch(
            "/api/categories"
        ).then(
            response =>
                response.json()
        );


    renderCategories();

}


function renderCategories() {

    const grid =
        document.getElementById(
            "categoriesGrid"
        );


    grid.innerHTML =
        cats
            .map(
                category => `

                    <article class="category-card">

                        <div class="category-symbol">
                            ${escapeHtml(
                                category.name
                                    .slice(0, 1)
                                    .toUpperCase()
                            )}
                        </div>


                        <div class="category-info">

                            <h3>
                                ${escapeHtml(
                                    category.name
                                )}
                            </h3>

                            <small>
                                ${
                                    category.is_default
                                        ? "Default category"
                                        : "Custom category"
                                }
                            </small>

                        </div>


                        <div class="card-actions">

                            ${
                                !category.is_default
                                    ? `
                                        <button
                                            onclick="editCategory(${category.id})"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            class="danger-text"
                                            onclick="deleteCategory(${category.id})"
                                        >
                                            Delete
                                        </button>
                                      `
                                    : ""
                            }

                        </div>

                    </article>

                `
            )
            .join("");


    document.getElementById(
        "categoriesEmpty"
    ).style.display =
        cats.length
            ? "none"
            : "flex";

}


window.editCategory =
    function(id) {

        const category =
            cats.find(
                item =>
                    item.id === id
            );


        if (!category) {
            return;
        }


        document.getElementById(
            "categoryId"
        ).value =
            category.id;


        document.getElementById(
            "categoryName"
        ).value =
            category.name;


        document.getElementById(
            "categoryModalTitle"
        ).textContent =
            "Edit category";


        openModal(
            "categoryModal"
        );

    };


window.deleteCategory =
    async function(id) {

        if (
            !confirm(
                "Delete this category?"
            )
        ) {
            return;
        }


        await fetch(
            `/api/categories/${id}`,
            {
                method: "DELETE"
            }
        );


        await loadCategories();

    };


document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "addCategoryButton"
        ).onclick =
            () => {

                document.getElementById(
                    "categoryId"
                ).value = "";


                document.getElementById(
                    "categoryName"
                ).value = "";


                document.getElementById(
                    "categoryModalTitle"
                ).textContent =
                    "New category";


                openModal(
                    "categoryModal"
                );

            };


        document.getElementById(
            "categoryForm"
        ).onsubmit =
            async event => {

                event.preventDefault();


                const id =
                    document.getElementById(
                        "categoryId"
                    ).value;


                const response =
                    await fetch(
                        id
                            ? `/api/categories/${id}`
                            : "/api/categories",
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

                                    name:
                                        document
                                            .getElementById(
                                                "categoryName"
                                            )
                                            .value
                                            .trim()

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    document.getElementById(
                        "categoryError"
                    ).textContent =
                        data.message ||
                        "Unable to save.";

                    return;

                }


                closeModal(
                    "categoryModal"
                );


                await loadCategories();

            };


        loadCategories();

    }
);