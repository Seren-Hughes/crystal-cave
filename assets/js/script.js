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

// This script handles the glow effect on the crystal containers
document.querySelectorAll('.crystal-container').forEach(container => {
    container.addEventListener('click', () => {
        container.querySelector('.glow').classList.toggle('active');
        container.querySelector('.light-crystal').classList.toggle('active');
    });
//mobile touch devices
    container.addEventListener('touchstart', () => {
        container.querySelector('.glow').classList.toggle('active');
        container.querySelector('.light-crystal').classList.toggle('active');
    });
    
});
