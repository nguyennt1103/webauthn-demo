const ui = {
    getSuccess: function () {
        return document.getElementById("success")
    },
    getError: function () {
        return document.getElementById("error")
    }
}

export function resetPopups() {
    const success = ui.getSuccess();
    const error = ui.getError();

    setVisibility(success, false);
    setVisibility(error, false);
}

export function setError(msg) {
    // reset pop up
    setVisibility(ui.getSuccess(), false);
    setVisibility(ui.getError(), false);

    ui.getError().textContent = msg;
    setVisibility(ui.getError(), true);
}

export function setSuccess(msg) {
    // reset pop up
    setVisibility(ui.getSuccess(), false);
    setVisibility(ui.getError(), false);

    ui.getSuccess().textContent = msg;
    setVisibility(ui.getSuccess(), true);
}

function setVisibility(element, value) {
    if (!element) {
        return;
    }
    element.style.display = value ? "block" : "none";
}
