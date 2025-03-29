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
    // Function to handle the glow and light effect for a short period
    const activateGlow = () => {
        // Add active classes for glow and light-crystal
        container.querySelector('.glow').classList.add('active');
        container.querySelector('.light-crystal').classList.add('active');

        // Remove active classes after 0.6 seconds to return to the default state
        setTimeout(() => {
            container.querySelector('.glow').classList.remove('active');
            container.querySelector('.light-crystal').classList.remove('active');
        }, 600); // 600ms = 0.6 seconds
    };

    // Trigger on click or tap
    container.addEventListener('click', activateGlow);

    // Mobile touch devices
    container.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevents the default touch action (optional)
        activateGlow();
    });
});
