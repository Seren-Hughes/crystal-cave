// Global variables
let currentSequence = []; // Store the sequence globally
let playersInput = []; // Store the player's input globally
let isSequencePlaying = false; // Flag to check if the sequence is playing
let isModalClosing = false; // Flag to check if the modal is closing
let isPlayerTurn = false; // Flag to check if it's the player's turn
let level = 1; // Initialize level
let isWaitingForInput = false; // Flag to prevent multiple calls to waitForPlayerInput
let crystalTimeouts = {}; // Store timeout IDs for each crystal



// -------------------------------- MODAL AND CRYSTAL INTERACTIONS --------------------------------- //
// Function to handle modal opening and closing
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.querySelector(".speech-bubble");
    const overlay = document.querySelector(".overlay");

    // Function to close the modal
    function closeModal(event) {
        if (isModalClosing) return; // Prevent multiple triggers
        isModalClosing = true; // Set the flag to true

        if (event) {
            event.stopPropagation(); // Stop the click event from propagating to other elements
            event.preventDefault(); // Prevent any default behavior
        }

        console.log("Closing modal...");
        modal.classList.add("hidden");
        overlay.classList.remove("active"); // Deactivate the overlay
        console.log("Overlay class list after closing modal:", overlay.classList); // Debugging message

        setTimeout(() => {
            isModalClosing = false; // Reset the flag after the modal is closed
            startGame(); // Start the game immediately
        }, 500); // slight delay for hiding the modal
    }

    // Open the modal and activate the overlay - *this is set up for other modals to be added later*
    function openModal() {
        console.log("Opening modal..."); // Debugging message
        modal.classList.remove("hidden");
        overlay.classList.add("active"); // Activate the overlay
    }

    // Close modal when clicking on the overlay
    overlay.addEventListener("click", function (event) {
        console.log("Overlay clicked"); // Debugging message
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
        if (!isPlayerTurn) {
            console.log("Crystal interaction blocked: Not player's turn."); // Debugging message
            return;
        }

        // Add active classes for glow and light-crystal
        container.querySelector('.glow').classList.add('active');
        container.querySelector('.light-crystal').classList.add('active');

        // Remove active classes after 0.6 seconds to return to the default state
        setTimeout(() => {
            container.querySelector('.glow').classList.remove('active');
            container.querySelector('.light-crystal').classList.remove('active');
            console.log("Player interaction glow deactivated."); // Debugging message
        }, 600); // 600ms = 0.6 seconds
    };

    // Event listeners to the crystal containers for click and touch events 
    document.querySelectorAll('.crystal-container').forEach(container => {
        container.addEventListener('click', function (event) {
            if (!isPlayerTurn) {
                console.log("Crystal interaction blocked: Not player's turn."); // Debugging message
                event.stopPropagation();
                return;
            }
            activateGlow(container);
        });

        container.addEventListener('touchstart', function (event) {
            event.preventDefault(); // Prevent default touch behavior
            
            if (!isPlayerTurn) {
                console.log("Crystal interaction blocked: Not player's turn."); // Debugging message
                
                return;
            }
            activateGlow(container);
        });
    });
});

// ------------------------------------ GAME FUNCTIONS ------------------------------------------ //

// Function to start the game
function startGame() {
    console.log("Starting game..."); // Debugging message
    level = 1;
    isSequencePlaying = true; // Disable crystal clicks during the sequence
    clearAllTimeouts(); // Clear any lingering timeouts
    clearAllGlows(); // Clear any lingering glow effects
    storeSequence(level); // Generate and store the sequence
    console.log("Current sequence:", currentSequence); // Debugging output
    isWaitingForInput = false; // Reset this flag to allow player input
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
    clearAllTimeouts(); // Clear any lingering global timeouts
    clearAllGlows(); // Clear any lingering glow effects
    let crystals = document.querySelectorAll(".crystal-container");

    console.log("Sequence will start shortly..."); // Debugging message

    // Add a delay before starting the sequence
    setTimeout(() => {
        clearAllGlows(); // Clear any lingering glow effects
        console.log("Cleared all glows before starting the sequence."); // Debugging message
    }, 300); // Delay by 300ms

    setTimeout(() => {
        sequence.forEach((color, index) => {
            const glowTimeoutId = setTimeout(() => {
                let crystal = [...crystals].find(c => c.dataset.color === color);

                if (crystal) {
                    // Activate glow
                    console.log(`Activating glow for: ${color}`); // Debugging message
                    crystal.querySelector('.glow').classList.add('active');
                    crystal.querySelector('.light-crystal').classList.add('active');

                    // Deactivate glow after a short delay
                    crystalTimeouts[color] = setTimeout(() => {
                        console.log(`Deactivating glow for: ${color}`); // Debugging message
                        crystal.querySelector('.glow').classList.remove('active');
                        crystal.querySelector('.light-crystal').classList.remove('active');
                        delete crystalTimeouts[color]; // Remove the timeout reference
                    }, 600); // Same duration as glow effect
                }
            }, index * 1200); // Delay each crystal by 1.2 seconds

            console.log(`Glow timeout ID for ${color}:`, glowTimeoutId); // Debugging message
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
    isPlayerTurn = true; // Set flag to indicate it's the player's turn
    isWaitingForInput = false; // Reset the flag

    playersInput = []; // Reset player's input for the new round
    console.log("Player input reset:", playersInput); // Debugging message
    console.log("isPlayerTurn set to:", isPlayerTurn); // Debugging message

    let crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers
    console.log("Crystals available for player input:", crystals); // Debugging message

    // Remove any existing event listeners to avoid duplicates
    crystals.forEach(crystal => {
        crystal.removeEventListener("click", handleCrystalClick); // Remove previous listeners
        crystal.removeEventListener("touchend", handleCrystalClick); // Ensure no duplicates
        crystal.addEventListener("click", handleCrystalClick); // Add click event listener
        crystal.addEventListener("touchend", handleCrystalClick); // Add touch event listener
        console.log("Adding event listener to:", crystal.dataset.color); // Debugging message
    });
}

// Define handleCrystalClick globally
function handleCrystalClick(event) {
    if (!isPlayerTurn) return; // Ignore clicks if it's not the player's turn

    let clickedColor = event.currentTarget.dataset.color; // Get the crystal's assigned color
    playersInput.push(clickedColor); // Store the clicked crystal

    console.log(`Player clicked: ${clickedColor}`); // Debugging message
    console.log(`Current input sequence: ${playersInput}`); // Debugging message

    // If player's input matches the required sequence length, stop capturing
    if (playersInput.length === currentSequence.length) {
        isPlayerTurn = false; // Prevent further input
        console.log("Player input complete. Checking input after delay...");

        // Delay input validation to allow glow deactivation
        setTimeout(() => {
            checkPlayerInput(); // Compare with the correct sequence
        }, 600); // Match the glow deactivation duration
    }
}

function checkPlayerInput() {
    console.log("Checking player input..."); // Debugging message
    console.log("Player's input:", playersInput); // Debugging message
    console.log("Current sequence:", currentSequence); // Debugging message
    
    // Check if both arrays are the same length before comparing
    console.log(`Player's input length: ${playersInput.length}, Current sequence length: ${currentSequence.length}`); // Debugging message
    
    // Compare player's input with the correct sequence
    // Use JSON.stringify to compare arrays - more reliable than .join() 
    if (JSON.stringify(playersInput) === JSON.stringify(currentSequence)) {
        console.log("Correct input"); // Debugging message
        nextLevel(); // Proceed to the next level
    }
    else {
        console.log("Incorrect input. Showing play again modal"); // Debugging message
        showPlayAgainModal(); // Show play again modal
    }
}

function nextLevel() {
    console.log(`Great memory! Let's see what the crystals play next... Proceeding to level ${level + 1}`); // Debugging message
    level++; // Increase level
    playersInput = []; // Reset player's input for the new level
    isPlayerTurn = false; // Disable player input while playing the sequence
    isSequencePlaying = true; // Disable crystal clicks during the sequence

    clearAllTimeouts(); // Clear any lingering timeouts
    clearAllGlows(); // Clear any lingering glow effects

    storeSequence(level); // Generate and store the sequence
    playSequence(currentSequence); // Play the new sequence
    console.log("Current sequence:", currentSequence); // Debugging output

    isWaitingForInput = false; // Reset the flag to allow player input again
}

function clearTimeoutsAndIntervals() {
    // Clear all timeouts and intervals to prevent any lingering effects
    let highestTimeoutId = setTimeout(() => {}, 1000); // Get the highest timeout ID
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i); // Clear each timeout
    }

    let highestIntervalId = setInterval(() => {}, 1000); // Get the highest interval ID
    for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i); // Clear each interval
    }
    console.log("All timeouts and intervals cleared."); // Debugging message
}

function clearAllTimeouts() {
    let highestTimeoutId = setTimeout(() => {}, 0); // Get the highest timeout ID
    for (let i = 0; i <= highestTimeoutId; i++) {
        clearTimeout(i); // Clear each timeout
    }
    console.log("All global timeouts cleared."); // Debugging message

    // Clear all crystal-specific timeouts
    for (let color in crystalTimeouts) {
        clearTimeout(crystalTimeouts[color]);
        console.log(`Cleared timeout for crystal: ${color}`); // Debugging message
        delete crystalTimeouts[color];
    }
}

function clearAllGlows() {
    let crystals = document.querySelectorAll(".crystal-container");
    crystals.forEach(crystal => {
        crystal.querySelector('.glow').classList.remove('active');
        crystal.querySelector('.light-crystal').classList.remove('active');
    });
    console.log("All glow effects cleared."); // Debugging message
}

function showPlayAgainModal() {
    console.log("Showing play again modal..."); // Debugging message
    alert("Never give up. Never surrender. Play again?"); // Alert the player
}