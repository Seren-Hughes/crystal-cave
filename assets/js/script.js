// Global variables
let currentSequence = []; // Store the sequence globally
let playersInput = []; // Store the player's input globally
let isSequencePlaying = false; // Flag to check if the sequence is playing
let isModalClosing = false; // Flag to check if the modal is closing
let isPlayerTurn = false; // Flag to check if it's the player's turn
let level = 1; // Initialize level

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

    // Open the modal and activate the overlay
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
        }, 600); // 600ms = 0.6 seconds
    };

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
            if (!isPlayerTurn) {
                console.log("Crystal interaction blocked: Not player's turn."); // Debugging message
                event.preventDefault();
                return;
            }
            activateGlow(container);
        });
    });
});

// --------------------- GAME FUNCTIONS ---------------------- //

// Function to start the game
function startGame() {
    console.log("Starting game..."); // Debugging message
    level = 1;
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
    isPlayerTurn = true; // Set flag to indicate it's the player's turn

    playersInput = []; // Reset player's input for new round    

    const crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers
    console.log("Crystals available for player input:", crystals); // Debugging message

    function handleCrystalClick(event) {
        if (!isPlayerTurn) return; // Ignore clicks if it's not the player's turn
    
        let clickedColor = event.currentTarget.dataset.color; // Get the crystal's assigned color
        playersInput.push(clickedColor); // Store the clicked crystal
        
        console.log(`Player clicked: ${clickedColor}`); // Debugging message
        console.log(`Current input sequence: ${playersInput}`); // Debugging message
    
        // If player's input matches the required sequence length, stop capturing
        if (playersInput.length === currentSequence.length) {
          isPlayerTurn = false; // Prevent further input
          checkPlayerInput(); // Compare with the correct sequence
        }
      }
    
      // Add event listeners to each crystal button
      crystals.forEach(crystal => {
        crystal.addEventListener("click", handleCrystalClick);
      });
    }


function checkPlayerInput() {
    console.log("Checking player input..."); // Debugging message
    // Compare player's input with the correct sequence
    // Use JSON.stringify to compare arrays - more reliable than .join() 
    if (JSON.stringify(playersInput) === JSON.stringify(currentSequence)) {
        console.log("Correct input"); // Debugging message
        nextLevel(); // Proceed to the next level
    }
    else {
        console.log("Incorrect input"); // Debugging message
        showPlayAgainModal(); // Show play again modal
    }
}

function nextLevel() {
    console.log("Great memory! Let's see what the crystals play next... Proceeding to next level..."); // Debugging message
}

function showPlayAgainModal() {
    console.log("Showing play again modal..."); // Debugging message
    alert("Never give up. Never surrender. Play again?"); // Alert the player
}