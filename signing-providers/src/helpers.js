/**
 * Displays a message and an optional outcome using console.log and alert.
 *
 * @param {string} message - The message to be displayed.
 * @param {Object} [outcome] - The optional outcome object to be displayed.
 * @returns {void}
 */
export const displayOutcome = (message, outcome) => {
    if (!outcome) {
        console.log(message);
        alert(message);
        return;
    }

    console.log(message, outcome);
    alert(`${message}\n${JSON.stringify(outcome, null, 4)}`);
};
