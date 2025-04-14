/* 
TABLE OF CONTENTS:
1. Global Variables
2. Modal Functions
3. Event Listeners
4. Game Functions
5. Player Interaction
6. Utility Functions
7. Speech Bubble Functions
*/

// --------------------------------------------------------------------------------- //
// ------------------------------- GLOBAL VARIABLES -------------------------------- //
// --------------------------------------------------------------------------------- //

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

// Speech bubble messages
const speechBubbleMessages = [
    "Oh hi! I didn't know anyone else knew about this place...",
    "It's so magical here. The crystals... they glow and sing.",
    "When I copy their melody, they all light up!",
    "I don't know why... but it feels important.",
    "Oh! I'm Brucey by the way.",
    "Want to see what the crystals do?",
    "Give it a try... I'll be right here!", 
    "See how many you can remember!",
];

let currentMessageIndex = 0; // Track the current message

// Global variable for the overlay so it can be accessed in all modal functions
const overlay = document.querySelector(".overlay");

// ---------------------------------------------------------------------------------- //
// -------------------------------- MODAL FUNCTIONS --------------------------------- //
// ---------------------------------------------------------------------------------- //

/** Modal & overlay functionality adapted and inspired by the following resources:
* - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
* - CSS Tricks: https://css-tricks.com/considerations-styling-modal/ 
*  (particularly the section on dealing with overlays: https://css-tricks.com/considerations-styling-modal/#aa-dealing-with-the-overlay)
* - FreeCodeCamp: https://www.freecodecamp.org/news/how-to-build-a-modal-with-javascript/
*/

// Function to open modals (speechBubble or gameModal)
function openModal(type, title = "", text = "", buttons = [], useOverlay = true) {
    const modal = document.querySelector(
        type === "speechBubble" ? ".speech-bubble" : ".modal-container"
    );

    // Update modal content dynamically for game modals
    if (type === "gameModal") {
        modal.querySelector(".modal-title").textContent = title;
        modal.querySelector(".modal-text").innerHTML = text; // Use innerHTML to allow HTML content update to the modal

        // Clear existing buttons
        const buttonsContainer = modal.querySelector(".modal-buttons");
        buttonsContainer.innerHTML = "";

        // Add new buttons
        buttons.forEach(button => {
            const btn = document.createElement("button");
            btn.textContent = button.text;
            btn.className = "modal-button";
            btn.addEventListener("click", function (event) {
                event.stopPropagation(); // Prevent the click from propagating to the overlay
                button.action(); // Execute the button's action
            });
            buttonsContainer.appendChild(btn);
        });
    }

    // Show modal
    modal.classList.remove("hidden");

    if (useOverlay) {
        activateOverlay(); 
    } else {
        deactivateOverlay(); // Explicitly remove the overlay. Passing false to the function will deactivate the overlay
    }

    console.log(`Opened ${type} modal. Overlay used: ${useOverlay}`);
}

// Event listener for the "How to Play" button and innerHTML content
document.querySelector(".game-button.how-to-play").addEventListener("click", () => {
    openModal(
        "gameModal",
        "🕹️ How to Play",
        `<p>🎵 <strong>Echoes of the Crystal Cave</strong> is a memory game with a musical twist!</p>
         <p>Brucey the bat will guide you through glowing crystal sequences—watch and listen carefully.</p>
         <p>✨ <strong>Your goal:</strong> Repeat the sequence of crystal notes correctly and see how many levels you can complete!</p>
         <p>🧠 Each level adds one more note to the sequence.</p>
         <h3>🖱️ Controls:</h3>
         <ul>
             <li>Use <strong>A W S E D</strong> keys (they match the crystal layout)</li>
             <li>Or click/tap the crystals</li>
             <li>Works on keyboard, mouse, and touchscreen</li>
         </ul>
         <h3>⭐ Freestyle Jam Mode:</h3>
         <p>Tap the star button to make your own music on the crystals—just for fun!</p>`,
        [{ text: "Close", action: () => closeModal("gameModal") }],
        false // Pass false to disable the overlay
    );
});

/** Event bubbling and propagation solution references:
* Using event.stopPropagation() to prevent the click event from propagating (bubbling - still somewhat murky on this concept but it seems to be working)
* to other elements. This solution was inspired by:
* - Free Code Camp: https://www.freecodecamp.org/news/event-propagation-event-bubbling-event-catching-beginners-guide/
* - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation
* - Stack Overflow: https://stackoverflow.com/questions/5963669/whats-the-difference-between-event-stoppropagation-and-event-preventdefault
* - Additional Resource: https://example.com/another-resource
*/
function closeModal(type = "speechBubble", event = null, callback = null) {
  const modal = document.querySelector(
    type === "speechBubble" ? ".speechBubble" : ".modal-container"
  );

  if (isModalClosing) {
    console.log("closeModal: Modal is already closing. Exiting...");
    return; // Prevent multiple triggers
  }

  isModalClosing = true; // Set the flag to prevent multiple triggers

  if (event) {
    event.stopPropagation(); // Stop the click event from propagating
    event.preventDefault(); // Prevent any default behavior
  }

  console.log(`Closing ${type} modal...`);
  modal.classList.add("hidden");

  // Deactivate overlay unless another modal is still open
  const otherModalOpen = document.querySelector(
    ".modal-container:not(.hidden)"
  );

  if (!otherModalOpen && type !== "speechBubble") {
    deactivateOverlay(); // Use helper function
  }

  setTimeout(() => {
    isModalClosing = false; // Reset the flag after the modal is closed

    // Handle specific behavior for each modal type
    if (type === "speechBubble") {
      startGame(); // Start the game immediately after closing the speech bubble
    }

    if (callback) {
      console.log("Executing callback after closing modal...");
      callback();
    }

    // Re-activate the overlay if the speech bubble is still visible
    const speechBubble = document.querySelector(".speech-bubble");
    if (speechBubble && !speechBubble.classList.contains("hidden")) {
      console.log("Speech bubble is visible. Re-activating overlay...");
      activateOverlay();
    }
  }, 500); // Slight delay for hiding the modal
}

// ------------------------------------------------------------ //
// -------------------EVENT LISTENERS ------------------------- //
// ------------------------------------------------------------ //

// Event listener for DOMContentLoaded to ensure the script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const speechBubble = document.querySelector(".speech-bubble");
    const overlay = document.querySelector(".overlay");

    // Keep overlay visible but disable clicks initially
    overlay.classList.remove("hidden");
    overlay.classList.add("active");
    overlay.style.pointerEvents = "none";

    // Keep speech bubble hidden initially
    speechBubble.classList.add("hidden"); 
    
    // Delay appearance of speech bubble by 2 seconds
    setTimeout(() => {
        // Show the speech bubble
        speechBubble.classList.remove("hidden");
        // Enable overlay clicks
        overlay.style.pointerEvents = "all";
        // Initialize the first message
        updateSpeechBubbleText();
    }, 2000);

    // Add click listener directly to the speech bubble
    speechBubble.addEventListener("click", function(event) {
        event.stopPropagation(); // Prevent click from reaching the overlay
        progressDialogue();
    });

    overlay.addEventListener("click", function (event) {
        // Ignore clicks on modal buttons or the modal itself
        if (event.target.closest(".modal") || event.target.closest(".modal-button")) {
            console.log("Overlay click ignored: Click was on a modal or button.");
            return;
        }
    
        const speechBubble = document.querySelector(".speech-bubble");
        const gameModal = document.querySelector(".modal-container");
    
        if (!speechBubble.classList.contains("hidden")) {
            console.log("Overlay clicked. Progressing dialogue...");
            progressDialogue();
        } else if (!gameModal.classList.contains("hidden")) {
            console.log("Overlay clicked, closing game modal...");
            closeModal("gameModal", event);
        }
    });

    /* Add spacebar listener. Reference:
        https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
    */
    document.addEventListener("keydown", function(event) {
        if (event.key === " " && !speechBubble.classList.contains("hidden")) {
            progressDialogue();
        }
    });

    // Event listeners to the crystal containers for click and touch events 
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    document.querySelectorAll('.crystal-container').forEach(container => {
        container.addEventListener('click', function (event) {
            if (!isPlayerTurn) {
                console.log("Crystal interaction blocked: Not player's turn."); 
                event.stopPropagation();
                return;
            }
            activateGlow(container);
        });

        container.addEventListener('touchstart', function (event) {
            event.preventDefault(); // Prevent default touch behavior

            if (!isPlayerTurn) {
                console.log("Crystal interaction blocked: Not player's turn."); 

                return;
            }
            activateGlow(container);
        });
    });
});

// Event listener for keydown events to handle keyboard input
document.addEventListener("keydown", function (event) {
    if (!isPlayerTurn) {
        console.log("Key press ignored: Not player's turn.");
        return;
    }

    // object to map keys to the crystal colours - key value pairs
    // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
    const keyToColorMap = {
        a: "blue",   // A for Blue Crystal
        w: "green",  // W for Green Crystal
        s: "pink",   // S for Pink Crystal
        e: "yellow", // E for Yellow Crystal
        d: "orange"  // D for Orange Crystal
    };

    const pressedKey = event.key.toLowerCase(); // Makes case insensitive - same action result
    const crystalColor = keyToColorMap[pressedKey];

    if (crystalColor) {
        console.log(`Key pressed: ${pressedKey} -> Crystal color: ${crystalColor}`);

        // Find the corresponding crystal container
        const crystal = document.querySelector(`.crystal-container[data-color="${crystalColor}"]`);
        if (crystal) {
            activateGlow(crystal); // Trigger the glow effect
            handleCrystalClick({ currentTarget: crystal }); // trigger the click event for matching the crystal
        }
    }
});

// Credit: https://www.freecodecamp.org/news/how-to-use-the-javascript-fullscreen-api/
// Select the fullscreen button
const fullscreenButton = document.querySelector('.game-button.full-screen');
const tooltipText = fullscreenButton.querySelector('.tooltiptext');
// Add a click event listener to toggle fullscreen
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        // Enter fullscreen mode
        document.documentElement.requestFullscreen()
            .then(() => {
                fullscreenButton.classList.remove('full-screen');
                fullscreenButton.classList.add('exit-full-screen');
                tooltipText.textContent = 'Exit Fullscreen'; // Update tooltip text
                console.log('Entered fullscreen mode');
            })
            // safety mechanism to handle errors if fullscreen is not supported
            // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#error_handling
            .catch((error) => {
                console.error(`Error attempting to enable fullscreen: ${error.message}`);
            });
    } else {
        // Exit fullscreen mode
        document.exitFullscreen()
            .then(() => {
                fullscreenButton.classList.remove('exit-full-screen');
                fullscreenButton.classList.add('full-screen');
                tooltipText.textContent = 'Enter Fullscreen'; // Update tooltip text
                console.log('Exited fullscreen mode');
            })
            .catch((error) => {
                console.error(`Error attempting to exit fullscreen: ${error.message}`);
            });
    }
});

// Event listener for overlay click to close the modal
overlay.addEventListener("click", function (event) {
    // Ignore clicks on modal buttons or the modal itself
    if (event.target.closest(".modal") || event.target.closest(".modal-button")) {
        console.log("Overlay click ignored: Click was on a modal or button.");
        return;
    }

    const gameModal = document.querySelector(".modal-container");

    // Handle closing the game modal
    if (!gameModal.classList.contains("hidden")) {
        console.log("Overlay clicked, closing game modal...");
        closeModal("gameModal", event);
    }
});

// Event listener for the "Escape" key to close the modal (accessibility feature)
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        const modal = document.querySelector(".modal-container");
        const overlay = document.querySelector(".overlay");

        // Close the modal only if it's currently visible
        if (!modal.classList.contains("hidden") && overlay.classList.contains("active")) {
            closeModal("gameModal", event);
        }
    }
});

function progressDialogue() {
    const gameModal = document.querySelector(".modal-container");
    if (!gameModal.classList.contains("hidden")) {
        console.log("Dialogue progression blocked: Game modal is open.");
        return; // Block dialogue progression if the game modal is open
    } 
    console.log("Progressing dialogue. Current index:", currentMessageIndex);
    currentMessageIndex++;

    if (currentMessageIndex < speechBubbleMessages.length) {
        // Update the speech bubble with the next message
        updateSpeechBubbleText();
    } else {
        // We've reached the end of the messages, start the game! :)
        const speechBubble = document.querySelector(".speech-bubble");
        const overlay = document.querySelector(".overlay");
        
        speechBubble.classList.add("hidden");
        overlay.classList.remove("active");
        overlay.style.pointerEvents = "none"; // Reset pointer events!
        console.log("Starting game after last message");
        startGame();
    }
}

// ------------------------------------------------------------------------ //
// ------------------------------ GAME FUNCTIONS -------------------------- //
// ------------------------------------------------------------------------ //

// Function to start the game
function startGame() {
    console.log("Starting game..."); 
    level = 1;
    isSequencePlaying = true; // Disable player input while playing the sequence
    clearAllTimeouts(); // Clear any lingering timeouts
    clearAllGlows(); // Clear any lingering glow effects
    storeSequence(level); // Generate and store the sequence
    console.log("Current sequence:", currentSequence);
    isWaitingForInput = false; // Reset the flag to allow player input again

    // Make sure the level indicator is visible
    const levelIndicator = document.querySelector(".level-indicator"); // Get the level indicator element
    levelIndicator.classList.remove("hidden"); // Hide the level indicator    
    levelIndicator.style.display = "block"; // Show the level indicator   

    const levelNumberElement = levelIndicator.querySelector("#level-number"); 
    if (levelNumberElement) {
        levelNumberElement.textContent = level; // Update the text content to the current level
    }
    console.log(`Level indicator displayed for level ${level}`); // debugging for play again issue
}

// Generate and store a random sequence of numbers (1-5 for each crystal)
/** Sequence generation and playback references:
* - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
* - Stack Overflow: https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
*/
function storeSequence(level) {
    currentSequence = []; // Reset the sequence before generating a new one
    let crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers

    for (let i = 0; i < level + 2; i++) { // Start with 3 crystals at level 1
        let randomIndex = Math.floor(Math.random() * crystals.length);
        let selectedCrystal = crystals[randomIndex];
        currentSequence.push(selectedCrystal.dataset.color); // Store the crystal’s color in the global array
    }

    console.log("Generated sequence:", currentSequence); 
    playSequence(currentSequence); // Play the sequence
}

// Function to play the sequence
function playSequence(sequence) {
    clearAllTimeouts(); // Clear any lingering global timeouts
    clearAllGlows(); // Clear any lingering glow effects
    let crystals = document.querySelectorAll(".crystal-container");

    console.log("Sequence will start shortly..."); 

    // Add a delay before starting the sequence
    setTimeout(() => {
        clearAllGlows(); // Clear any lingering glow effects
        console.log("Cleared all glows before starting the sequence."); 
    }, 300); // Delay by 300ms

    setTimeout(() => {
        sequence.forEach((color, index) => {
            const glowTimeoutId = setTimeout(() => {
                let crystal = [...crystals].find(c => c.dataset.color === color);

                if (crystal) {
                    // Activate glow
                    console.log(`Activating glow for: ${color}`); 
                    crystal.querySelector('.glow').classList.add('active');
                    crystal.querySelector('.light-crystal').classList.add('active');

                    // Deactivate glow after a short delay
                    crystalTimeouts[color] = setTimeout(() => {
                        console.log(`Deactivating glow for: ${color}`); 
                        crystal.querySelector('.glow').classList.remove('active');
                        crystal.querySelector('.light-crystal').classList.remove('active');
                        delete crystalTimeouts[color]; // Remove the timeout reference
                    }, 600); // Same duration as glow effect
                }
            }, index * 1200); // Delay each crystal by 1.2 seconds

            console.log(`Glow timeout ID for ${color}:`, glowTimeoutId); 
        });

        // Enable crystal clicks after the sequence finishes
        setTimeout(() => {
            isSequencePlaying = false; // Allow player interactions
            console.log("Sequence finished. Player can now interact with crystals.");
            waitForPlayerInput();
        }, sequence.length * 1200); // Ensure the timeout matches the total sequence duration
    }, 2000); // Add a 2-second delay before starting the sequence
}

// Function to wait for player input
function waitForPlayerInput() {
    console.log("Waiting for player input..."); 
    isPlayerTurn = true; // Set flag to indicate it's the player's turn
    isWaitingForInput = false; // Reset the flag

    playersInput = []; // Reset player's input for the new round
    console.log("Player input reset:", playersInput); 
    console.log("isPlayerTurn set to:", isPlayerTurn); 

    let crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers
    console.log("Crystals available for player input:", crystals); 

    /** Remove any existing event listeners to prevent duplication
    * This ensures that no duplicate event listeners are attached to the crystals.
    * Duplicated listeners can occur if `addEventListener` is called multiple times without
    * removing the previous listeners. By using `removeEventListener` before adding new listeners,
    * it ensures only one instance of the event handler is attached to each crystal.
    *
    * This issue and its resolution are documented in the development troubleshooting section of `testing.md`.
    *
    * Reference:
    * - Stack Overflow: https://stackoverflow.com/questions/45723205/removing-duplicate-event-listeners
    */
    crystals.forEach(crystal => {
        crystal.removeEventListener("click", handleCrystalClick); // Remove previous listeners
        crystal.removeEventListener("touchend", handleCrystalClick); // Ensure no duplicates
        crystal.addEventListener("click", handleCrystalClick); // Add click event listener
        crystal.addEventListener("touchend", handleCrystalClick); // Add touch event listener
        console.log("Adding event listener to:", crystal.dataset.color); 
    });
}

// ------------------------------------------------------------------------------------- //
// -------------------------------- PLAYER INTERACTION --------------------------------- //
// ------------------------------------------------------------------------------------- //

/**  Handle the player's click on a crystal during their turn
*   This function processes the player's input by:
*   - Checking if it's the player's turn (using the `isPlayerTurn` flag).
*   - Retrieving the clicked crystal's colour and storing it in the `playersInput` array.
*  - Logging debugging information for the clicked crystal and the player's input sequence.
*  - Validating the player's input against the correct sequence after a delay (to allow glow deactivation).
*/
function handleCrystalClick(event) {
    if (!isPlayerTurn) return; // Ignore clicks if it's not the player's turn

    let clickedColor = event.currentTarget.dataset.color; // Get the crystal's assigned color
    playersInput.push(clickedColor); // Store the clicked crystal color in the player's input array

    console.log(`Player clicked: ${clickedColor}`); 
    console.log(`Current input sequence: ${playersInput}`); 

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
/** Checks the player's input against the correct sequence. References:
   * Compare player's input with the correct sequence using JSON.stringify.
   * Strict comparison of both the order and values of the arrays.
   * References:
   * - Stack Overflow: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
   * - Stack Overflow: https://stackoverflow.com/questions/15376185/is-it-fine-to-use-json-stringify-for-deep-comparisons-and-cloning
   * - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
   * - GeeksforGeeks: https://www.geeksforgeeks.org/how-to-compare-two-arrays-in-javascript/
   */
function checkPlayerInput() {
    console.log("Checking player input..."); 
    console.log("Player's input:", playersInput); 
    console.log("Current sequence:", currentSequence); 

    // Check if both arrays are the same length before comparing
    console.log(`Player's input length: ${playersInput.length}, Current sequence length: ${currentSequence.length}`); 

    if (JSON.stringify(playersInput) === JSON.stringify(currentSequence)) {
        console.log("Correct input"); 
        celebrateCorrectAnswer(); 
    }
    else {
        console.log("Incorrect input. Showing play again modal"); 
        showPlayAgainModal(); 
    }
}

function celebrateCorrectAnswer() {
    let crystals = document.querySelectorAll(".crystal-container");
    console.log("Celebrating correct answer! All crystals will glow."); 

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
        console.log("Celebration glow deactivated."); 
        // Add a breather before proceeding to the next level
        setTimeout(() => {
            nextLevel(); // Proceed to the next level
        }, 1000); // 1-second breather
    }, 2500); // 2.5 seconds delay for the celebration
}

function nextLevel() {
    console.log(`Great memory! Let's see what the crystals play next... Proceeding to level ${level + 1}`); 
    level++; // Increase level
    playersInput = []; // Reset player's input for the new level
    isPlayerTurn = false; // Disable player input while playing the sequence
    isSequencePlaying = true; // Disable crystal clicks during the sequence

    // update the level number html
    const levelNumberElement = document.getElementById("level-number");
    console.log("Level number element:", document.getElementById("level-number"));
    if (levelNumberElement) {
        levelNumberElement.textContent = level; // Update the text content to the current level
    } else {
        console.error("Level number element not found in the DOM!"); // catch error if the element is not found - stops the game from breaking while fixing - see troubleshooting notes
    }

    clearAllTimeouts(); // Clear any lingering timeouts
    clearAllGlows(); // Clear any lingering glow effects

    storeSequence(level); // Generate and store the sequence
    playSequence(currentSequence); // Play the new sequence
    console.log("Current sequence:", currentSequence); 

    isWaitingForInput = false; // Reset the flag to allow player input again
}

// --------------------------------------------------------------------------------- //
// ------------------------------ UTILITY FUNCTIONS -------------------------------- //
// --------------------------------------------------------------------------------- //

// overlay helper functions to manage the overlay state
function activateOverlay() {
    overlay.classList.add("active");
    overlay.style.pointerEvents = "all"; // Enable pointer events
    console.log("Overlay activated.");
}
function deactivateOverlay() {
    overlay.classList.remove("active");
    overlay.style.pointerEvents = "none"; // Disable pointer events
    console.log("Overlay deactivated.");
}

// Function to handle the glow effect on the crystal containers
const activateGlow = (container) => {
    if (!isPlayerTurn) {
        console.log("Crystal interaction blocked: Not player's turn."); 
        return;
    }

    // Add active classes for glow and light-crystal
    container.querySelector('.glow').classList.add('active');
    container.querySelector('.light-crystal').classList.add('active');

    // Remove active classes to return to the default state
    setTimeout(() => {
        container.querySelector('.glow').classList.remove('active');
        container.querySelector('.light-crystal').classList.remove('active');
        console.log("Player interaction glow deactivated."); 
    }, 600); // 600ms = 0.6 seconds
};

/**
* Clears all timeouts and intervals to prevent lingering effects.
*/
function clearTimeoutsAndIntervals() {
    // Clear all timeouts and intervals to prevent any lingering effects
    let highestTimeoutId = setTimeout(() => { }, 1000); // Get the highest timeout ID
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i); // Clear each timeout
    }

    let highestIntervalId = setInterval(() => { }, 1000); // Get the highest interval ID
    for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i); // Clear each interval
    }
    console.log("All timeouts and intervals cleared."); 
}

/** 
 * Clears all global timeouts and crystal-specific timeouts
 */
function clearAllTimeouts() {
    let highestTimeoutId = setTimeout(() => { }, 0); // Get the highest timeout ID
    for (let i = 0; i <= highestTimeoutId; i++) {
        clearTimeout(i); // Clear each timeout
    }
    console.log("All global timeouts cleared."); 

    // Clear all crystal-specific timeouts
    for (let color in crystalTimeouts) {
        clearTimeout(crystalTimeouts[color]);
        console.log(`Cleared timeout for crystal: ${color}`); 
        delete crystalTimeouts[color];
    }
}

/**
* Clears all glow effects from the crystals.
*/
function clearAllGlows() {
    let crystals = document.querySelectorAll(".crystal-container");
    crystals.forEach(crystal => {
        crystal.querySelector('.glow').classList.remove('active');
        crystal.querySelector('.light-crystal').classList.remove('active');
    });
    console.log("All glow effects cleared."); 
}

function showPlayAgainModal() {
    console.log("showPlayAgainModal() called");

    openModal(
        "gameModal",
        "So Close!",
        "Brucey believes in you! Want to try again?",
        [
            {
                text: "Play Again",
                action: () => {
                    console.log("Play Again button action triggered");
                    // Callback method to close the modal and start the game
                    // The callback is executed after the modal is closed
                    // Reference:  https://www.topcoder.com/thrive/articles/callback-method-oop-null-and-string-in-javascript
                    // and https://www.freecodecamp.org/news/how-to-use-callback-functions-in-javascript/#heading-basic-structure-of-a-callback-function
                    // Credit: https://javascript.info/callbacks
                    closeModal("gameModal", null, () => {
                        console.log("Callback: Starting game after closing modal...");
                        startGame(); // Start the game after the modal is closed
                    });
                },
            },
            {
                text: "Maybe later",
                action: () => {
                    console.log("Maybe later button action triggered");
                    closeModal("gameModal", null, () => {
                        console.log("Callback: Redirecting to home page...");
                        location.href = "index.html";
                    });
                },
            },
        ],
        false // Pass false so the overlay won't activate
    );
}

// --------------------------------------------------------------------------------- //
// ------------------------------ SPEECH BUBBLE FUNCTIONS ------------------------- //
// --------------------------------------------------------------------------------- //

// Function to update the speech bubble text
function updateSpeechBubbleText() {
    const speechBubble = document.querySelector(".speech-bubble");
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Add the current message to the speech bubble
    speechBubble.innerHTML = `
        <div class="text-container">
            <p>${speechBubbleMessages[currentMessageIndex]}</p>
            <span class="instructions">${
                currentMessageIndex === speechBubbleMessages.length - 1
                    ? isTouchDevice
                        ? "(Tap to start the game!)"
                        : "(Click or press spacebar to start the game!)"
                    : isTouchDevice
                    ? "(Tap to continue...)"
                    : "(Click or press spacebar to continue...)"
            }</span>
        </div>
    `;
}

// Function to handle speech bubble interaction
function handleSpeechBubbleInteraction(event) {
    event.stopPropagation(); // Prevent event bubbling

    const speechBubble = document.querySelector(".speech-bubble");
    currentMessageIndex++;

    if (currentMessageIndex < speechBubbleMessages.length) {
        // Update the speech bubble with the next message
        updateSpeechBubbleText();
    } else {
        // Close the speech bubble and start the game
        closeModal("speechBubble");
        startGame();
    }
}
