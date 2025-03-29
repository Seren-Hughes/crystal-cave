// This script handles the modal functionality for the speech bubble
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.querySelector(".speech-bubble");

    function closeModal() {
        modal.classList.add("hidden");
        startGame(); // Start the game when the modal is closed

    }

    // Close when clicking anywhere
    document.addEventListener("click", closeModal);

    // Close with spacebar
    document.addEventListener("keydown", function (event) {
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

// GAME FUNCTIONS 
// **avoid creating too many variables in the global scope**

let currentSequence = []; // store the sequence globally

function startGame() {
    console.log("Starting game..."); // debugging message
    let level = 1; 
    currentSequence = storeSequence(level); // currentSequence stored in the global scope
    playSequence(currentSequence); // Play the generated sequence
    console.log("Current sequence:", currentSequence); // Debugging output
 }
    
// generate and store a random sequence of numbers (1-5 for each crystal)
function storeSequence(level) {
    let sequence = [];
    let crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers

    for (let i = 0; i < level + 2; i++) { // Start with 3 crystals at level 1
        let randomIndex = Math.floor(Math.random() * crystals.length);
        let selectedCrystal = crystals[randomIndex]; 
        sequence.push(selectedCrystal.dataset.color); // Store the crystal’s color
    }

    console.log("Generated sequence:", sequence); // Debugging output
    return sequence;
};


function playSequence(sequence) {
    let crystals = document.querySelectorAll(".crystal-container");

    sequence.forEach((color, index) => {
        setTimeout(() => {
            let crystal = [...crystals].find(c => c.dataset.color === color);

            if (crystal) {
                // Activate glow
                crystal.querySelector('.glow').classList.add('active');
                crystal.querySelector('.light-crystal').classList.add('active');

                // Placeholder: Play sound (to be added later)
                console.log(`Playing sound for: ${color}`);

                // Deactivate glow after a short delay
                setTimeout(() => {
                    crystal.querySelector('.glow').classList.remove('active');
                    crystal.querySelector('.light-crystal').classList.remove('active');
                }, 600); // Same duration as glow effect
            }
        }, index * 1200); // Delay each crystal by 1.2 seconds
    });

    // After sequence finishes, wait for player input
    setTimeout(waitForPlayerInput, sequence.length * 1000);
    console.log("playSequence() called"); // Debugging message
};

function waitForPlayerInput() {
    console.log("Waiting for player input..."); // Debugging message
}


function checkPlayerInput() {

}

function nextLevel() {

}

function showPlayAgainModal() {

}