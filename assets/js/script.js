// -------------------- Global variables --------------------- //

// Flags (boolean variables to manage game state)
let isSequencePlaying = false; // Indicates if the sequence is currently playing
let isModalClosing = false; // Prevents multiple triggers of modal close function
let isPlayerTurn = false; // Indicates if it's the player's turn
let isWaitingForInput = false; // Prevents multiple calls to waitForPlayerInput

// Arrays (to store sequences and player's input)
let currentSequence = []; // Store the sequence globally
let playersInput = []; // Store the player's input globally

// Objects 
let crystalTimeouts = {}; // Store timeout IDs for each crystal (keyed by crystal color)

// Primitive data types 
let level = 1; // Initialize level

// -------------------------------- MODAL AND CRYSTAL INTERACTIONS --------------------------------- //

// ---- Function to handle modal opening and closing ---- //

    /* Modal & overlay functionality adapted and inspired by the following resources:
        - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
        - CSS Tricks: https://css-tricks.com/considerations-styling-modal/ 
         (particularly the section on dealing with overlays: https://css-tricks.com/considerations-styling-modal/#aa-dealing-with-the-overlay)
        - FreeCodeCamp: https://www.freecodecamp.org/news/how-to-build-a-modal-with-javascript/
    */
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.querySelector(".speech-bubble");
    const overlay = document.querySelector(".overlay");

    // Make the overlay active on page load
    overlay.classList.remove("hidden");
    overlay.classList.add("active");

    // Open the speech bubble modal on page load
    openModal("speechBubble");

    // Add a click event listener to close the speech bubble modal and deactivate the overlay
    modal.addEventListener("click", function () {
        closeModal("speechBubble");
        overlay.classList.remove("active"); // Deactivate the overlay
    });

    // Function to close the modal
    function closeModal(type = "speechBubble", event = null) {
        const modal = document.querySelector(
            type === "speechBubble" ? ".speech-bubble" : ".modal-container"
        );
        const overlay = document.querySelector(".overlay");

        if (isModalClosing) return; // Prevent multiple triggers
        isModalClosing = true; // Set the flag to true

        /*  Using event.stopPropagation() to prevent the click event from propagating (bubbling - still somewhat murky on this concept but it seems to be working)
            to other elements. This solution was inspired by:
            - Free Code Camp: https://www.freecodecamp.org/news/event-propagation-event-bubbling-event-catching-beginners-guide/
            - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
            - Stack Overflow: https://stackoverflow.com/questions/5963669/whats-the-difference-between-event-stoppropagation-and-event-preventdefault
        */
        if (event) {
            event.stopPropagation(); // Stop the click event from propagating
            event.preventDefault(); // Prevent any default behavior
        }

        console.log(`Closing ${type} modal...`); // Debugging message
        modal.classList.add("hidden");
        overlay.classList.remove("active"); // Deactivate the overlay

        setTimeout(() => {
            isModalClosing = false; // Reset the flag after the modal is closed
            if (type === "speechBubble") {
                startGame(); // Start the game immediately after closing the speech bubble
            }
        }, 500); // Slight delay for hiding the modal
    }

    // Open the modal and activate the overlay - *this is set up for other modals to be added later*
    function openModal(type, title = "", text = "", buttons = []) {
        console.log(`openModal called with type: ${type}`); // Debugging message
        const modal = document.querySelector(
            type === "speechBubble" ? ".speech-bubble" : ".modal-container"
        );
        const overlay = document.querySelector(".overlay");

        // Update modal content dynamically for general modals
        if (type === "gameModal") {
            modal.querySelector(".modal-title").textContent = title;
            modal.querySelector(".modal-text").textContent = text;

            // Clear existing buttons
            const buttonsContainer = modal.querySelector(".modal-buttons");
            buttonsContainer.innerHTML = "";

            // Add new buttons
            buttons.forEach(button => {
                const btn = document.createElement("button");
                btn.textContent = button.text;
                btn.className = "modal-button";
                btn.addEventListener("click", button.action); // Attach the action
                buttonsContainer.appendChild(btn);
            });
        }

        // Show modal and overlay
        modal.classList.remove("hidden");
        overlay.classList.add("active");
        console.log(`${type} modal opened.`); // Debugging message
    }

    // Close modal when clicking on the overlay
    document.querySelector(".overlay").addEventListener("click", function (event) {
        const speechBubble = document.querySelector(".speech-bubble");
        const gameModal = document.querySelector(".modal-container");

        if (!speechBubble.classList.contains("hidden")) {
            closeModal("speechBubble", event); // Close the speech bubble modal
        } else if (!gameModal.classList.contains("hidden")) {
            closeModal("gameModal", event); // Close the game modal
        }
    });

    // Close modal with spacebar - referenced from MDN Web Docs
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
    document.addEventListener("keydown", function (event) {
        if (event.key === " ") {
            closeModal("speechBubble", event);
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
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
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
    /* Sequence generation and playback references:
        - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        - Stack Overflow: https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
    */
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

    // Remove any existing event listeners to prevent duplication
    /* This ensures that no duplicate event listeners are attached to the crystals.
        Duplicated listeners can occur if `addEventListener` is called multiple times without
        removing the previous listeners. By using `removeEventListener` before adding new listeners,
        it ensures only one instance of the event handler is attached to each crystal.

        This issue and its resolution are documented in the development troubleshooting section of `testing.md`.

        Reference:
        - Stack Overflow: https://stackoverflow.com/questions/45723205/removing-duplicate-event-listeners
    */
    crystals.forEach(crystal => {
        crystal.removeEventListener("click", handleCrystalClick); // Remove previous listeners
        crystal.removeEventListener("touchend", handleCrystalClick); // Ensure no duplicates
        crystal.addEventListener("click", handleCrystalClick); // Add click event listener
        crystal.addEventListener("touchend", handleCrystalClick); // Add touch event listener
        console.log("Adding event listener to:", crystal.dataset.color); // Debugging message
    });
}

// Handle the player's click on a crystal during their turn
/* This function processes the player's input by:
   - Checking if it's the player's turn (using the `isPlayerTurn` flag).
   - Retrieving the clicked crystal's colour and storing it in the `playersInput` array.
   - Logging debugging information for the clicked crystal and the player's input sequence.
   - Validating the player's input against the correct sequence after a delay (to allow glow deactivation).
*/
function handleCrystalClick(event) {
    if (!isPlayerTurn) return; // Ignore clicks if it's not the player's turn

    let clickedColor = event.currentTarget.dataset.color; // Get the crystal's assigned color
    playersInput.push(clickedColor); // Store the clicked crystal color in the player's input array

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
    
    /* Compare player's input with the correct sequence using JSON.stringify.
        Strict comparison of both the order and values of the arrays.
        References:
        - Stack Overflow: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript & https://stackoverflow.com/questions/15376185/is-it-fine-to-use-json-stringify-for-deep-comparisons-and-cloning
        - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
        - GeeksforGeeks: https://www.geeksforgeeks.org/how-to-compare-two-arrays-in-javascript/
    */
    if (JSON.stringify(playersInput) === JSON.stringify(currentSequence)) {
        console.log("Correct input"); // Debugging message
        celebrateCorrectAnswer(); // Celebrate the correct answer
    }
    else {
        console.log("Incorrect input. Showing play again modal"); // Debugging message
        showPlayAgainModal(); // Show play again modal
    }
}

function celebrateCorrectAnswer() {
    let crystals = document.querySelectorAll(".crystal-container");
    console.log("Celebrating correct answer! All crystals will glow."); // Debugging message

    // Activate glow for all crystals
    setTimeout(() => {
        crystals.forEach(crystal => {
            crystal.querySelector('.glow').classList.add('active', 'celebration-active'); // Add glow and celebration-specific class
            crystal.querySelector('.light-crystal').classList.add('active', 'celebration-active'); // Add light-crystal and celebration-specific class
        });
        console.log("Glow activated for celebration.");
    }, 300); // 300ms delay before starting the celebration

    // Play celebratory music (placeholder for actual implementation)
    console.log("Playing celebratory twinkly music...");

    // Deactivate glow after a short delay 
    setTimeout(() => {
        crystals.forEach(crystal => {
            crystal.querySelector('.glow').classList.remove('active', 'celebration-active'); // Remove glow and celebration-specific class
            crystal.querySelector('.light-crystal').classList.remove('active', 'celebration-active'); // Remove light-crystal and celebration-specific class
        });
        clearAllGlows(); // Clear all glow effects
        console.log("Celebration glow deactivated."); // Debugging message

        // Add a breather before proceeding to the next level
        setTimeout(() => {
            nextLevel(); // Proceed to the next level
        }, 1000); // 1-second breather
    }, 2500); // 2.5 seconds delay for the celebration
}

function nextLevel() {
    console.log(`Great memory! Let's see what the crystals play next... Proceeding to level ${level + 1}`); // Debugging message
    level++; // Increase level
    playersInput = []; // Reset player's input for the new level
    isPlayerTurn = false; // Disable player input while playing the sequence
    isSequencePlaying = true; // Disable crystal clicks during the sequence

    // update the level number html
    const levelNumberElement = document.getElementById("level-number");
    levelNumberElement.textContent = level; // Update the text content to the current level

    clearAllTimeouts(); // Clear any lingering timeouts
    clearAllGlows(); // Clear any lingering glow effects

    storeSequence(level); // Generate and store the sequence
    playSequence(currentSequence); // Play the new sequence
    console.log("Current sequence:", currentSequence); // Debugging output

    isWaitingForInput = false; // Reset the flag to allow player input again
}

// ---- Managing lingering glow effects and timed celebrations ---- //

    /* The use of `setTimeout` for deactivating glow effects and adding delays to celebrations
    *  was inspired by the following resources: 
    *     - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
    *     - Stack Overflow: https://stackoverflow.com/questions/729921/settimeout-or-setinterval
    *     - FreeCodeCamp: https://www.freecodecamp.org/news/javascript-timing-events-settimeout-and-setinterval/
    *  The lingering glow issue and the delay for the last crystal glow are documented in `testing.md` under development troubleshooting notes.
    */
// Function to clear all timeouts and intervals
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

// Function to clear all global timeouts and crystal-specific timeouts
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
    console.log("showPlayAgainModal() called"); // Debugging message

    openModal("gameModal", "Game Over", "Never give up. Never surrender. Play again?", [
        {
            text: "Play Again",
            action: () => {
                console.log("Play Again button clicked"); // Debugging message
                closeModal("gameModal"); // Close the modal
                startGame(); // Restart the game programmatically
            }
        },
        {
            text: "Some Other Time",
            action: () => {
                console.log("Some Other Time button clicked"); // Debugging message
                closeModal("gameModal"); // Close the modal
                location.href = "index.html"; // Redirect to the home page
            }
        }
    ]);
}