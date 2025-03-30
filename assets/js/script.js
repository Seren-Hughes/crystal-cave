// Global variables
let currentSequence = []; // Store the sequence globally
let isSequencePlaying = false; // Flag to check if the sequence is playing
let isModalClosing = false; // Flag to check if the modal is closing

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.querySelector(".speech-bubble");

    // Function to close the modal
    function closeModal(event) {
        if (isModalClosing) return; // Prevent multiple triggers
        isModalClosing = true; // Set the flag to true

        if (event) {
            event.stopPropagation(); // Stop the click event from propagating to other elements
            event.preventDefault(); // Prevent any default behavior
        }

        modal.classList.add("hidden");

        setTimeout(() => {
            isModalClosing = false; // Reset the flag after the modal is closed
            startGame(); // Start the game immediately
        }, 500); // Keep the slight delay for hiding the modal
    }

    // Close modal when clicking anywhere
    document.addEventListener("click", function (event) {
        closeModal(event);
    });

    // Close modal with spacebar
    document.addEventListener("keydown", function (event) {
        if (event.key === " ") {
            closeModal(event);
        }
    });

    // Function to handle the glow effect on the crystal containers
    const activateGlow = (container) => {
        // Add active classes for glow and light-crystal
        container.querySelector('.glow').classList.add('active');
        container.querySelector('.light-crystal').classList.add('active');

        // Remove active classes after 0.6 seconds to return to the default state
        setTimeout(() => {
            container.querySelector('.glow').classList.remove('active');
            container.querySelector('.light-crystal').classList.remove('active');
        }, 600); // 600ms = 0.6 seconds
    };

    // Prevent clicking on crystals before sequence is finished or while modal is closing
    document.querySelectorAll('.crystal-container').forEach(container => {
        container.addEventListener('click', function (event) {
            if (isSequencePlaying || isModalClosing) {
                console.log("Crystal interaction blocked: Sequence playing or modal closing.");
                event.stopPropagation(); // Prevent the crystal click from doing anything
                return; // Do nothing if sequence is playing or modal is closing
            }
            activateGlow(container); // Handle normal click actions
        });

        // Mobile touch devices
        container.addEventListener('touchstart', function (event) {
            if (isSequencePlaying || isModalClosing) {
                console.log("Crystal interaction blocked: Sequence playing or modal closing.");
                event.preventDefault(); // Prevent the default touch action
                return; // Do nothing if sequence is playing or modal is closing
            }
            activateGlow(container); // Handle normal touch actions
        });
    });
});

// GAME FUNCTIONS

// Function to start the game
function startGame() {
    console.log("Starting game..."); // Debugging message
    let level = 1;
    isSequencePlaying = true; // Disable crystal clicks during the sequence
    storeSequence(level); // Generate and store the sequence
    console.log("Current sequence:", currentSequence); // Debugging output
}

// Generate and store a random sequence of numbers (1-5 for each crystal)
function storeSequence(level) {
    currentSequence = []; // Reset the sequence before generating a new one
    let crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers

    for (let i = 0; i < level + 2; i++) { // Start with 3 crystals at level 1
        let randomIndex = Math.floor(Math.random() * crystals.length);
        let selectedCrystal = crystals[randomIndex];
        currentSequence.push(selectedCrystal.dataset.color); // Store the crystal’s color in the global array
    }

    console.log("Generated sequence:", currentSequence); // Debugging output
    playSequence(currentSequence); // Play the sequence
}

// Function to play the sequence
function playSequence(sequence) {
    let crystals = document.querySelectorAll(".crystal-container");

    console.log("Sequence will start shortly..."); // Debugging message

    // Add a delay before starting the sequence
    setTimeout(() => {
        sequence.forEach((color, index) => {
            setTimeout(() => {
                let crystal = [...crystals].find(c => c.dataset.color === color);

                if (crystal) {
                    // Activate glow effect
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

        // Enable crystal clicks after the sequence finishes
        setTimeout(() => {
            isSequencePlaying = false; // Allow player interactions
            console.log("Sequence finished. Player can now interact with crystals.");
            waitForPlayerInput();
        }, sequence.length * 1200); // Ensure the timeout matches the total sequence duration
    }, 1000); // Add a 1-second delay before starting the sequence
}

// Function to wait for player input
function waitForPlayerInput() {
    console.log("Waiting for player input..."); // Debugging message
}

function checkPlayerInput() {

}

function nextLevel() {

}

function showPlayAgainModal() {

}