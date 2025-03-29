// This script handles the modal functionality for the speech bubble
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.querySelector(".speech-bubble");

    function closeModal() {
        modal.classList.add("hidden");
    }

    // Close when clicking anywhere
    document.addEventListener("click", closeModal);
    
    // Close with spacebar
    document.addEventListener("keydown", function(event) {
        if (event.key === " ") {
            closeModal();
        }
    });
});