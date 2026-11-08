async function api(url, options = {}) {

    const response = await fetch(
        url,
        options
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong."
        );
    }

    return data;
}


function money(
    value,
    currency = "USD"
) {

    try {

        return new Intl.NumberFormat(
            undefined,
            {
                style: "currency",
                currency: currency
            }
        ).format(
            Number(value) || 0
        );

    } catch {

        return `${currency} ${(Number(value) || 0).toFixed(2)}`;

    }
}


function openModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("hidden");
    }
}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.add("hidden");
    }
}


function escapeHtml(value) {

    return String(value).replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );
}


document.addEventListener(
    "click",
    event => {

        const close =
            event.target.closest(
                "[data-close-modal]"
            );

        if (!close) {
            return;
        }

        const modal =
            close.closest(".modal");

        if (modal) {
            modal.classList.add("hidden");
        }

    }
);