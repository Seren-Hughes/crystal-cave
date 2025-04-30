/* 
1. Imports
2. Global Variables 
3. Modal Functions
4. Speech Bubble Modal Functions
5. Initialisation Functions
6. Event Listeners
7. Game Functions
8. Utility Functions
*/

// Imports
import { audioManager } from "./audio.js"; // Import the AudioManager class from audio.js

// --------------------------------------------------------------------------------- //
// ------------------------------- GLOBAL VARIABLES -------------------------------- //
// --------------------------------------------------------------------------------- //

/**
 * Global variables used to manage the game state, player input.
 * 
 * Notes:
 * - Flags are used to track the current state of the game (e.g., `isPlayerTurn`).
 * - Arrays store the current sequence and the player's input.
 * - Objects like `crystalTimeouts` manage crystal-specific timeouts.
 */
// Flags (boolean variables to manage game state)
let isSequencePlaying = false; // Indicates if the sequence is currently playing
let isModalClosing = false; // Prevents multiple triggers of modal close function
let isPlayerTurn = false; // Indicates if it's the player's turn
let isWaitingForInput = false; // Prevents multiple calls to waitForPlayerInput
let freestyleMode = false; // Indicates if the game is in freestyle mode
let skipTriggered = false; // Indicates if the skip button was triggered


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
    "What's your name?",
    "Nice to meet you!",
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

/**
 * Opens a modal (either "speechBubble" or "gameModal") and dynamically updates its content.
 * 
 * This function handles:
 * - Dynamically updating the modal's title, text, and buttons for "gameModal".
 * - Adding event listeners to modal buttons to execute their respective actions.
 * - Showing the modal and optionally activating or deactivating the overlay.
 * 
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [CSS Tricks: Considerations Styling Modal](https://css-tricks.com/considerations-styling-modal/)
 * - [FreeCodeCamp: How to Build a Modal with JavaScript](https://www.freecodecamp.org/news/how-to-build-a-modal-with-javascript/)
 * 
 * @param {string} type - The type of modal to open ("speechBubble" or "gameModal").
 * @param {string} [title=""] - The title of the modal (used for "gameModal").
 * @param {string} [text=""] - The text content of the modal (used for "gameModal").
 * @param {Array<Object>} [buttons=[]] - An array of button objects for "gameModal". Each object should have:
 *   - {string} text - The button's label.
 *   - {Function} action - The function to execute when the button is clicked.
 * @param {boolean} [useOverlay=true] - Whether to activate the overlay when the modal is opened.
 */
function openModal(
    type,
    title = "",
    text = "",
    buttons = [],
    useOverlay = true
) {
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
        buttons.forEach((button) => {
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
}

/**
 * Closes a modal and optionally executes a callback after closing.
 * 
 * This function handles modal closing behaviour, including:
 * - Hiding the modal.
 * - Deactivating the overlay unless another modal is still open.
 * - Resetting the scroll position of the modal to the top (for "gameModal").
 * - Executing a callback function after the modal is closed.
 * - Re-activating the overlay if the speech bubble modal is still visible.
 * 
 * * Behaviour:
 * - If the modal type is `"gameModal"`, the scroll position is reset to the top using `scrollTop = 0`.
 * - Prevents multiple triggers of the close action using the `isModalClosing` flag.
 * - Stops event propagation and prevents default behaviour if an event is provided.
 * - Deactivates the overlay unless another modal is still open.
 * - Executes a callback function if provided after the modal is closed.
 * - Re-activates the overlay if the speech bubble modal is still visible.
 * 
 *  A ternary operator (shorthand for a simple `if-else` statement) is used to determine which modal element to target:
 * ```javascript
 * type === "speechBubble" ? ".speechBubble" : ".modal-container"
 * ```
 * - If `type` is `"speechBubble"`, it selects the `.speechBubble` element.
 * - Otherwise, it selects the `.modal-container` element.
 * 
 * Event bubbling and propagation solution references:
 * - [FreeCodeCamp: Event Propagation](https://www.freecodecamp.org/news/event-propagation-event-bubbling-event-catching-beginners-guide/)
 * - [MDN Web Docs: Event.stopPropagation](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
 * - [Stack Overflow: Difference Between stopPropagation and preventDefault](https://stackoverflow.com/questions/5963669/whats-the-difference-between-event-stoppropagation-and-event-preventdefault)
 * 
 * Ternary operator reference:
 * - [MDN Web Docs: Conditional (Ternary) Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)
 * 
 * @param {string} [type="speechBubble"] - The type of modal to close (e.g., "speechBubble" or "gameModal").
 * @param {Event|null} [event=null] - The event triggering the modal close, if applicable.
 * @param {Function|null} [callback=null] - A callback function to execute after the modal is closed.
 * 
 * @example
 * // Close the "gameModal" without an associated event and execute a callback
 * closeModal("gameModal", null, () => {
 *     console.log("Modal closed. Callback executed.");
 * });
*/
function closeModal(type = "speechBubble", event = null, callback = null) {
    const modal = document.querySelector(
        type === "speechBubble" ? ".speechBubble" : ".modal-container"
    );

    if (type === "gameModal") {
        modal.scrollTop = 0; // Reset scroll to the top
    }

    if (isModalClosing) {
        return; // Prevent multiple triggers
    }

    isModalClosing = true; // Set the flag to prevent multiple triggers

    if (event) {
        event.stopPropagation(); // Stop the click event from propagating
        event.preventDefault(); // Prevent any default behavior
    }

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
            callback(); // showPlayAgainModal() callback is executed after the modal is closed to start the game
        }

        // Re-activate the overlay if the speech bubble is still visible
        const speechBubble = document.querySelector(".speech-bubble");
        if (speechBubble && !speechBubble.classList.contains("hidden")) {
            activateOverlay();
        }
    }, 500); // Slight delay for hiding the modal
}

/**
 * Opens a modal to prompt the player for their name.
 * 
 * This modal allows the player to input their name or skip the prompt. The player's name is stored in local storage if provided, 
 * and the speech bubble message is updated accordingly. If the player skips, an alternative message is used.
 * 
 * Behaviour:
 * - If the player enters their name, the speech bubble message at index 6 is updated to:
 *   `"Nice to meet you, [playerName]!"` (where `[playerName]` is the name entered by the player).
 * - If the player skips, the speech bubble message at index 6 is updated to:
 *   `"No name? You must be on a secret mission!"`.
 * 
 * The modal includes two buttons:
 * - "OK": Saves the player's name and progresses the dialogue inserting the player's name with template literal.
 * - "Skip": Skips the name input and progresses the dialogue with an alternative message.
 * 
 * Notes:
 * - The `closeModal` function is called with `null` as the second argument for the `event` parameter, 
 *   indicating that no event is associated with the modal close action.
 * 
 * References:
 * - [MDN Web Docs: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
 * - [MDN Web Docs: Element.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
 * - [FreeCodeCamp: How to use localStorage in JavaScript](https://www.freecodecamp.org/news/use-local-storage-in-modern-applications/)
 * 
 */
function openNameModal() {
    const modalTitle = "Players Name";
    const modalText = `<input type="text" id="player-name-input" placeholder="Enter your name"/>`;
    const modalButtons = [
        {
            text: "OK",
            action: () => {
                const nameInput = document
                    .querySelector("#player-name-input")
                    .value.trim(); // Get the value of the input field
                if (nameInput) {
                    localStorage.setItem("playerName", nameInput); // Store the name in local storage
                    speechBubbleMessages[6] = `Nice to meet you, ${nameInput}!`; // Update the message with the player's name
                }
                currentMessageIndex = 5;
                closeModal("gameModal", null, () => {
                    progressDialogue();
                });
            },
        },
        {
            text: "Skip",
            action: () => {
                skipTriggered = true; // prevents re-opening the modal
                speechBubbleMessages[6] = "No name? You must be on a secret mission!";
                currentMessageIndex = 5;
                closeModal("gameModal", null, () => {
                    progressDialogue();
                });
            },
        },
    ];
    openModal("gameModal", modalTitle, modalText, modalButtons, false);
}

/**
 * Displays a modal asking the player if they want to play again.
 * 
 * This modal provides two options:
 * - "Play Again": Closes the modal and starts the game using a callback.
 * - "Maybe Later": Closes the modal and redirects the player to the home page.
 * 
 * The "Play Again" button executes a callback function that:
 * - Closes the modal.
 * - Starts the game by calling `startGame()` after the modal is closed.
 * 
 * References:
 * - [TopCoder: Callback Method in JavaScript](https://www.topcoder.com/thrive/articles/callback-method-oop-null-and-string-in-javascript)
 * - [FreeCodeCamp: How to Use Callback Functions in JavaScript](https://www.freecodecamp.org/news/how-to-use-callback-functions-in-javascript/#heading-basic-structure-of-a-callback-function)
 * - [JavaScript.info: Callbacks](https://javascript.info/callbacks)
 */
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
                    closeModal("gameModal", null, () => {
                        console.log("Callback: Starting game after closing modal...");
                        startGame(); // Start the game after the modal is closed
                    });
                },
            },
            {
                text: "Maybe later",
                action: () => {
                    closeModal("gameModal", null, () => {
                        location.href = "index.html";
                    });
                },
            },
        ],
        false // Pass false so the overlay won't activate
    );
}

// --------------------------------------------------------------------------------- //
// -------------------------- SPEECH BUBBLE MODAL FUNCTIONS ------------------------ //
// --------------------------------------------------------------------------------- //

/**
 * Updates the speech bubble text and instructions based on the current message index.
 * 
 * This function dynamically updates the content of the speech bubble, including:
 * - The current message from the `speechBubbleMessages` array.
 * - Contextual instructions based on the device type (touch or non-touch) and the current message index.
 * 
 * Behaviour:
 * - If the current message is the last one in the array, the instructions prompt the player to start the game.
 * - Otherwise, the instructions prompt the player to continue to the next message.
 * - Instructions are tailored for touch devices (e.g., "Tap to continue...") or non-touch devices (e.g., "Click or press spacebar to continue...").
 * 
 * Device Detection:
 * - Uses `"ontouchstart" in window` to check for touch event support.
 * - Uses `navigator.maxTouchPoints > 0` for more accurate detection of touch-enabled devices.
 * - Combines both checks with the logical OR (`||`) operator:
 *   - If either condition is `true`, the device is considered a touch device.
 *   - Logical OR (`||`) returns `true` if at least one of the conditions is `true`.
 * - Credit: [GeeksforGeeks: How to Detect Touch Screen Device Using JavaScript](https://www.geeksforgeeks.org/how-to-detect-touch-screen-device-using-javascript/?itm_source=auth&itm_medium=contributions&itm_campaign=articles)
 * 
 * References:
 * - [MDN Web Docs: Element.innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)
 * - [MDN Web Docs: Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
 * 
 */
function updateSpeechBubbleText() {
    const speechBubble = document.querySelector(".speech-bubble");
    const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Add the current message to the speech bubble
    speechBubble.innerHTML = `
        <div class="text-container">
            <p>${speechBubbleMessages[currentMessageIndex]}</p>
            <span class="instructions">${currentMessageIndex === speechBubbleMessages.length - 1
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

/**
 * Handles interaction with the speech bubble.
 * 
 * This function manages the progression of speech bubble messages and determines the next action:
 * - If there are more messages in the `speechBubbleMessages` array, it updates the speech bubble with the next message.
 * - If the last message has been displayed, it closes the speech bubble and starts the game.
 * 
 * Behaviour:
 * - Increments the `currentMessageIndex` to track the next message.
 * - Calls `updateSpeechBubbleText()` to update the speech bubble content.
 * - Calls `closeModal("speechBubble")` and `startGame()` when the last message is reached.
 * 
 * Notes:
 * - Uses `event.stopPropagation()` to prevent the interaction event from bubbling up to parent elements.
 * 
 * References:
 * - [MDN Web Docs: Event.stopPropagation](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
 * 
 * @param {Event} event - The interaction event (e.g., click or touch) triggering the function.
 * 
 */
function handleSpeechBubbleInteraction(event) {
    event.stopPropagation(); // Prevent event bubbling

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

/**
 * Progresses the dialogue in the speech bubble based on the current message index.
 * 
 * This function handles the flow of dialogue messages and determines the next action:
 * - If the game modal is open, dialogue progression is blocked.
 * - If the player's name is not stored and the current message index is 6, the name input modal is opened.
 * - If the player's name is stored and the current message index is 0 (on page load), the dialogue skips to the last message index 9.
 * - Updates the speech bubble with the next message or starts the game if the last message is reached.
 * 
 * Behaviour:
 * - Increments the `currentMessageIndex` to track the next message.
 * - Updates the speech bubble content using `updateSpeechBubbleText()`.
 * - Opens the name input modal using `openNameModal()` if conditions are met.
 * - Starts the game using `startGame()` when the last message is reached.
 * 
 * Notes:
 * - The player's name is retrieved from `localStorage` and used to personalise the dialogue.
 * - The `skipTriggered` flag prevents reopening the name modal if the skip button was previously clicked.
 * -  Reference: [Geeks for Geeks: Use of FLAG in programming](https://www.geeksforgeeks.org/use-of-flag-in-programming/)
 * - The overlay is deactivated, and pointer events are reset when the dialogue ends.
 * 
 * Blocking Condition:
 * - If the game modal (`.modal-container`) is open (not hidden), dialogue progression is blocked.
 * - This is achieved with the condition:
 *   ```javascript
 *   if (!gameModal.classList.contains("hidden")) {
 *       return; // Block dialogue progression if the game modal is open
 *   }
 *   ```
 * References:
 * - [MDN Web Docs: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * 
 * @example
 * // Progress the dialogue when the speech bubble is clicked
 * speechBubble.addEventListener("click", progressDialogue);
 */
function progressDialogue() {
    const gameModal = document.querySelector(".modal-container");
    if (!gameModal.classList.contains("hidden")) {
        return; // Block dialogue progression if the game modal is open
    }

    // Check if a player name is stored
    const storedName = localStorage.getItem("playerName");

    currentMessageIndex++; // Increment the message index

    // if the player name is not stored, and the current message index is 6, and skipTriggered is false, open the name modal
    if (!storedName && currentMessageIndex === 6 && !skipTriggered) {
        openNameModal();
        return;
    }

    if (storedName && currentMessageIndex <= 0) {
        currentMessageIndex = 9;
        speechBubbleMessages[9] = `Hi again, ${storedName}! Let's play!`;
    }

    if (storedName) {
        speechBubbleMessages[6] = `Nice to meet you, ${storedName}!`;
    }

    if (currentMessageIndex < speechBubbleMessages.length) {
        // Update the speech bubble with the next message
        updateSpeechBubbleText();
    } else {
        // End of the messages, start the game
        const speechBubble = document.querySelector(".speech-bubble");
        const overlay = document.querySelector(".overlay");
        speechBubble.classList.add("hidden");
        overlay.classList.remove("active");
        overlay.style.pointerEvents = "none"; // Reset pointer events!
        startGame();
    }
}

// ------------------------------------------------------------ //
// ------------------- INITIALISATION FUNCTIONS --------------- //
// ------------------------------------------------------------ //

/**
 * Initialises the game site after the DOM is fully loaded.
 * 
 * This function sets up the game environment, initialises UI elements, and adds event listeners for user interactions. 
 * It ensures that all DOM elements are available before interacting with them and handles the initial overlay logic 
 * to prepare the game for the player.
 * 
 * Key Features:
 * - Hides the game container and shows an audio user event overlay to ensure user interaction before audio playback.
 * - Sets up animations, buttons, and event listeners for various game interactions.
 * - Handles audio context resumption for browsers that require user interaction to start audio playback.
 * - Starts the game introduction sequence after the user interacts with the audio overlay.
 * - Handles user interaction with the invisible overlay.
 * 
 * Behaviour:
 * - Removes fade-in animations from the game container and buttons to prevent automatic animations.
 * - Hides the game container until the audio user event overlay has been interacted with.
 * - Adds event listeners for:
 *   - Speech bubble interactions to progress dialogue.
 *   - Overlay clicks to close modals or progress dialogue.
 *   - Keyboard interactions (e.g., spacebar to progress dialogue).
 *   - Crystal interactions for both click and touch events.
 * 
 * Notes:
 * - _**Moving code out of this function may break the game because DOM elements might not exist yet!**_
 * - The logic encapsulated in initializeGameSite is only called after the DOM is fully loaded to ensure all elements are available.
 * - The `audioUserEventOverlay` is displayed to prompt the user for interaction before audio playback.
 * - The `audioContext` is resumed if it is in a suspended state, ensuring audio playback works as expected.
 * - The `startIntro` function is called after the audio user event overlay is dismissed. It handles the game introduction sequence.
 * 
 * References:
 * - [MDN Web Docs: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
 * - [MDN Web Docs: AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
 * - [MDN Web Docs: resume()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume)
 * - [MDN Web Docs: suspend()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/suspend)
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [MDN Web Docs: EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
 * - [FreeCodeCamp: DOM Manipulation Best Practices](https://www.freecodecamp.org/news/dom-manipulation-best-practices/)
 * 
 * @example
 * // Call the initializeGameSite function when the DOM is fully loaded
 * document.addEventListener("DOMContentLoaded", initializeGameSite);
 */
function initializeGameSite() {
    const gameContainer = document.querySelector(".game-container");
    const audioUserEventOverlay = document.querySelector(".audio-user-event-overlay");
    const speechBubble = document.querySelector(".speech-bubble");
    const overlay = document.querySelector(".overlay");
    const buttonsContainer = document.querySelector(".buttons-container"); // The container with fade-in-ui
    const allButtons = document.querySelectorAll(".game-button");

    // Remove fade-in so it doesn't start automatically
    gameContainer.classList.remove("fade-in-game-container");
    allButtons.forEach((btn) => btn.classList.add("hidden-on-audio-overlay"));
    buttonsContainer.classList.remove("fade-in-ui");

    // Hide game container visually until audio user event overlay is dismissed
    gameContainer.style.visibility = "hidden";

    // Show audio user event overlay
    audioUserEventOverlay.style.display = "flex";

    // Tap to continue - (may need to change click to touchstart for audio event on mobile devices)
    audioUserEventOverlay.addEventListener("click", () => {
        audioUserEventOverlay.style.display = "none";
        gameContainer.style.visibility = "visible"; // Show the game container
        // Restart css animations. Credit: https://www.harrytheo.com/blog/2021/02/restart-a-css-animation-with-javascript/ 
        // void gameContainer.offsetWidth; // force reflow if needed - test the fade-ins and animations on ios device on multi browsers 
        // ***commented out code don't forget to delete it later***
        gameContainer.classList.add("fade-in-game-container");
        // Show the buttons
        buttonsContainer.classList.add("fade-in-ui");
        allButtons.forEach((btn) => btn.classList.remove("hidden-on-audio-overlay"));
        // Resume audio context if suspended 
        if (audioManager.audioContext.state === "suspended") {
            audioManager.audioContext.resume().then(() => {
                console.log("AudioContext resumed");
            });
        }
        audioUserEventOverlay.style.display = "none";
        startIntro();
    });

    /**
     * Starts the game introduction sequence.
     * 
     * This function:
     * - Loads all audio files and starts background and ambient sounds.
     * - Handles user interaction with the overlay.
     * - Updates the speech bubble with the player's name if stored in `localStorage`.
     * - Delays the appearance of the speech bubble for a smoother introduction.
     */
    function startIntro() {
        audioManager.loadAllAudio().then(() => {
            audioManager.playBackgroundSound(); // Start the background cave sounds after loading audio
            audioManager.playAmbientSound(); // Start the ambient soundscape after loading audio
            const storedName = localStorage.getItem("playerName");

            if (storedName) {
                currentMessageIndex = 9;
                speechBubbleMessages[9] = `Hi again, ${storedName}! Let's play!`;
            }

            updateSpeechBubbleText();

            // Keep overlay visible but disable clicks initially
            overlay.classList.remove("hidden");
            overlay.classList.add("active");
            overlay.style.pointerEvents = "none";
            speechBubble.classList.add("hidden");

            // Delay appearance of speech bubble by 2 seconds
            setTimeout(() => {
                speechBubble.classList.remove("hidden");
                overlay.style.pointerEvents = "all";
                updateSpeechBubbleText();
            }, 1300);
        });
    }

    // Event listener for the speech bubble to handle interaction
    speechBubble.addEventListener("click", function (event) {
        event.stopPropagation();
        progressDialogue();
    });

    // Event listener for the overlay to close modals and handle clicks outside of them
    overlay.addEventListener("click", function (event) {
        if (
            event.target.closest(".modal") ||
            event.target.closest(".modal-button")
        ) {
            return;
        }

        const gameModal = document.querySelector(".modal-container");

        if (!speechBubble.classList.contains("hidden")) {
            progressDialogue();
        } else if (!gameModal.classList.contains("hidden")) {
            closeModal("gameModal", event);
        }
    });

    // Event listener for the "space" key to progress the dialogue
    document.addEventListener("keydown", function (event) {
        if (event.key === " " && !speechBubble.classList.contains("hidden")) {
            progressDialogue();
        }
    });

    // Event listener for player input on the crystals 
    document.querySelectorAll(".crystal-container").forEach((container) => {
        container.addEventListener("click", function (event) {
            if (!isPlayerTurn) {
                event.stopPropagation();
                return;
            }
            activateGlow(container);
        });
        // Touch event for mobile devices
        container.addEventListener("touchstart", function (event) {
            event.preventDefault();

            if (!isPlayerTurn) {
                return;
            }
            activateGlow(container);
        });
    });
}

// ------------------------------------------------------------ //
// ------------------- EVENT LISTENERS ------------------------ //
// ------------------------------------------------------------ //

/**
 * Event listeners for user interactions with the game.
 * 
 * This section defines event listeners for various game interactions, including:
 * - DOMContentLoaded to initialize the game site.
 * - Speech bubble clicks to progress dialogue.
 * - Keyboard input for crystal interactions.
 * - Button clicks for game controls (e.g., "How to Play", "Settings", "Restart").
 * - Overlay clicks to close modals or progress dialogue.
 * - Fullscreen toggle for the game.
 * 
 * Notes:
 * - Inline callbacks are used for some event listeners, while others reference named functions.
 * - Event listeners ensure responsive and interactive gameplay across devices.
 * 
 * References:
 * - [MDN Web Docs: EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
 * - [MDN Web Docs: KeyboardEvent](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
 */

// Call the initializeGameSite function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeGameSite);

/**
 * Event listener for keyboard input to handle crystal interactions.
 * 
 * This listener maps specific keys (e.g., A, W, S, E, D) to crystal colors and triggers the corresponding glow effect and sound.
 * 
 * Notes:
 * - The `keyToColorMap` object maps keys to crystal colors.
 * - The `handleCrystalClick` function is called to process the interaction.
 * 
 * References:
 * - [MDN Web Docs: KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
 */
document.addEventListener("keydown", function (event) {
    if (!isPlayerTurn) {
        return;
    }

    // object to map keys to the crystal colours - key value pairs
    // Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
    const keyToColorMap = {
        a: "blue", // A for Blue Crystal
        w: "green", // W for Green Crystal
        s: "pink", // S for Pink Crystal
        e: "yellow", // E for Yellow Crystal
        d: "orange", // D for Orange Crystal
    };

    const pressedKey = event.key.toLowerCase(); // Makes case insensitive - same action result
    const crystalColor = keyToColorMap[pressedKey];

    if (crystalColor) {
        console.log(`Key pressed: ${pressedKey} -> Crystal color: ${crystalColor}`);

        // Find the corresponding crystal container
        const crystal = document.querySelector(
            `.crystal-container[data-color="${crystalColor}"]`
        );
        if (crystal) {
            activateGlow(crystal); // Trigger the glow effect
            handleCrystalClick({ currentTarget: crystal }); // trigger the click event for matching the crystal
        }
    }
});

// Event listener for the "How to Play" button to open the instructions modal
document
    .querySelector(".game-button.how-to-play")
    .addEventListener("click", () => {
        // Detect if the user is on a mobile device
        const isMobile = window.innerWidth <= 768; // tablet mobile device breakpoint
        const modalTitle = "🕹️ How to Play";
        const modalText = `
            <p>🎵 <strong>Echoes of the Crystal Cave</strong> is a memory game with a musical twist!</p>
            <p>Brucey the bat will guide you through glowing crystal sequences—watch and listen carefully.</p>
            <p>✨ <strong>Your goal:</strong> Repeat the sequence of crystal notes correctly and see how many levels you can complete!</p>
            <p>🧠 Each level adds one more note to the sequence.</p>
            <h3>🖱️ Controls:</h3>
            <ul>
                <li>Use <strong>A W S E D</strong> keys (they match the crystal layout)</li>
                <li>Or click/tap the crystals</li>
                <li>Works on keyboard, mouse, and touchscreen</li>
            </ul>
            ${isMobile
                ? `<p class="mobile-note">📱 Keyboard and mouse controls are available on the desktop version. Try it out for a different experience!</p>`
                : "" // Show this note only on mobile devices
            }
            <h3>⭐ Freestyle Jam Mode:</h3>
            <p>Tap the star button to make your own music on the crystals—just for fun!</p>
            <p>Just click the restart button to reset the game to level 1 anytime.</p>
        `;

        // Open the modal with the content
        openModal(
            "gameModal",
            modalTitle,
            modalText,
            [{ text: "Close", action: () => closeModal("gameModal") }],
            false // Pass false to disable the overlay
        );
    });

// Event listener for the "Settings" button to open the settings modal and update the innerHTML content
document.querySelector(".game-button.settings").addEventListener("click", () => {
    const highestLevel = localStorage.getItem("highestLevel");
    const playerName = localStorage.getItem("playerName") || "Unknown Player";
    const crystalsRemembered =
        highestLevel && parseInt(highestLevel) > 0
            ? parseInt(highestLevel) + 2
            : null;

    const highestLevelDisplay = highestLevel
        ? `Level ${highestLevel}`
        : "Not yet played";

    const crystalsRememberedDisplay = crystalsRemembered
        ? `${crystalsRemembered} Crystals!`
        : "No crystals remembered yet.";    
    /**
    * Explanation:
    * - `localStorage.getItem`: Retrieves data stored in the browser's localStorage.
    * - `||`: Provides a fallback value if the retrieved data is `null` or undefined. 
    * - `parseInt`: Converts the string value of `highestLevel` to an integer for calculations.
    * - The logic ensures that even if no data is stored in localStorage, the game can still display default values.
    * - The number of crystals remembered is based on the highest level. The formula is `highestLevel + 2` because the sequence starts with 3 crystals at level 1
    *
    * References:
    * - [MDN Web Docs: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
    * - [MDN Web Docs: parseInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)
    * - [MDN Web Docs: Logical OR (||) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR)
    * - [MDN Web Docs: Ternary operator: ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)
    * - [Stack Overflow: Default values with || operator](https://stackoverflow.com/questions/476436/is-there-a-null-coalescing-operator-in-javascript)
    * - [W3Schools: Range Slider](https://www.w3schools.com/howto/howto_js_rangeslider.asp)
    * - [MDN Web Docs: AudioParam.setValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setValueAtTime)
    */
    openModal(
        "gameModal",
        "Game Dashboard",
        `
        <hr class="section-divider">
        <div class="settings-section">
            <h3>Game Stats</h3>
            <p>Player Name: ${playerName}</p>
            <p>Highest Level Reached: ${highestLevelDisplay}</p>
            <p>Best Memory Streak: ${crystalsRememberedDisplay}</p>
        </div>
        <hr class="section-divider">
        <div class="settings-section">
            <h3>Audio Settings</h3>
            <div class="setting">
                <label>Ambient Sounds</label>
                <button class="mute-toggle" data-sound="ambient">M</button>
                <input type="range" class="volume-slider" data-sound="ambient" min="0" max="1" step="0.01" value="0.7">
            </div>
            <div class="setting">
                <label>Background Cave FX</label>
                <button class="mute-toggle" data-sound="background">M</button>
                <input type="range" class="volume-slider" data-sound="background" min="0" max="1" step="0.01" value="0.7">
            </div>
            <div class="setting">
                <label>Crystal FX</label>
                <button class="mute-toggle" data-sound="effects">M</button>
                <input type="range" class="volume-slider" data-sound="effects" min="0" max="1" step="0.01" value="0.7">
            </div>
        </div>
        <hr class="section-divider">
        <div class="settings-section">
            <h3>Display Settings</h3>
            <div class="setting">
                <label>Brightness</label>
                <input type="range" class="brightness-slider" min="0.9" max="1.6" step="0.01" value="1.3">
            </div>
        </div>
        <hr class="section-divider">
        <div class="settings-section">
            <h3>Saved Data</h3>
            <div class="setting" id="delete-data">
              <p>Delete saved data</p>
              <button class="delete-data-button">
                Delete Saved Data
                <span class="tooltiptext">Warning: This will delete your saved data and reload the page</span>
              </button>
            </div>
            <hr class="section-divider">
        </div>
        `,
        [{ text: "Close", action: () => closeModal("gameModal") }],
        false // Pass false to disable the overlay
    );
    // Sync the audio settings UI with the current state
    syncAudioSettingsUI();
    
    // Event listeners for volume sliders
    document.querySelectorAll(".volume-slider").forEach(slider => {
        slider.addEventListener("input", event => {
            const volume = parseFloat(event.target.value);
            const soundType = event.target.dataset.sound;
    
            if (soundType === "ambient") {
                audioManager.userAmbientVolume = volume;
            } else if (soundType === "background") {
                audioManager.userBackgroundVolume = volume;
            } else if (soundType === "effects") {
                audioManager.userEffectsVolume = volume;
            }
    
            // Unmute if slider is moved above 0
            if (soundType === "ambient" && volume > 0) audioManager.isAmbientMuted = false;
            if (soundType === "background" && volume > 0) audioManager.isBackgroundMuted = false;
            if (soundType === "effects" && volume > 0) audioManager.isEffectsMuted = false;
    
            syncAudioSettingsUI();
        });
    });
    // Event listeners for mute buttons in settings modal
    document.querySelectorAll(".mute-toggle").forEach(button => {
        button.addEventListener("click", event => {
            const soundType = event.target.dataset.sound;
    
            // If global mute is on and user unmutes a channel, unmute globally
            if (audioManager.isMuted) {
                audioManager.isMuted = false;
            }
    
            if (soundType === "ambient") {
                audioManager.isAmbientMuted = !audioManager.isAmbientMuted;
            } else if (soundType === "background") {
                audioManager.isBackgroundMuted = !audioManager.isBackgroundMuted;
            } else if (soundType === "effects") {
                audioManager.isEffectsMuted = !audioManager.isEffectsMuted;
            }
            syncAudioSettingsUI();
            updateSoundButtonUI();
        });
    });
    // Event listener for the delete data button
    document.querySelector(".delete-data-button").addEventListener("click", () => {
        deleteSavedData();
    });
    /**
     * Gets the current brightness value from the body's CSS filter property.
     * Splits the filter string and finds the brightness(...) value, defaulting to 1.3 if not set.
     *
     * References:
     * - https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
     * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
     * - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat
     */
    const brightnessSlider = document.querySelector(".brightness-slider");
    const bodyFilter = getComputedStyle(document.body).getPropertyValue("filter") || "";
    const brightnessPart = bodyFilter.trim().split(/\s+/).find(part => part.startsWith("brightness("));
    const currentBrightness = brightnessPart
    ? parseFloat(brightnessPart.replace("brightness(", "").replace(")", ""))
    : 1.3;

    brightnessSlider.value = currentBrightness;

    brightnessSlider.addEventListener("input", (event) => {
    const brightnessValue = event.target.value;
    document.body.style.filter = `brightness(${brightnessValue})`;
    });
});

// Restart button event listener to reset the game
document.querySelector(".game-button.restart").addEventListener("click", () => {
    const speechBubble = document.querySelector(".speech-bubble");
    const gameModal = document.querySelector(".modal-container");
    const levelIndicator = document.querySelector(".level-indicator");
    const freestyleButton = document.querySelector(".game-button.freestyle");

    if (levelIndicator) {
        levelIndicator.innerHTML = `Level <span id="level-number">1</span>`; // Reset to Level 1
    }

    // If either bubble or game modal is visible, hide them
    if (
        !speechBubble.classList.contains("hidden") ||
        !gameModal.classList.contains("hidden")
    ) {
        speechBubble.classList.add("hidden");
        gameModal.classList.add("hidden");
    }

    freestyleButton.classList.remove("mode"); // Ensure freestyle button is not in active mode
    activateOverlay(); // Activate overlay to block crystal interactions
    freestyleMode = false; // Reset freestyle mode
    startGame(); // Reset the game at level 1
    console.log("Game restarted and overlay activated.");
});

// sound button event listener to mute/unmute the game sounds
document.querySelector(".game-button.sound").addEventListener("click", () => {
    audioManager.isMuted = !audioManager.isMuted;
    updateSoundButtonUI();
});

// Home button event listener to redirect to the home page
document.querySelector(".game-button.home").addEventListener("click", () => {
    location.href = "index.html"; // Redirect to the home page
});

// Freestyle button event listener to activate freestyle mode
document
    .querySelector(".game-button.freestyle")
    .addEventListener("click", freestyle);

// Credit: https://www.freecodecamp.org/news/how-to-use-the-javascript-fullscreen-api/
// Select the fullscreen button
const fullscreenButton = document.querySelector(".game-button.full-screen");
const tooltipText = fullscreenButton.querySelector(".tooltiptext");
// Add a click event listener to toggle fullscreen
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
fullscreenButton.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        // Enter fullscreen mode
        document.documentElement
            .requestFullscreen()
            .then(() => {
                fullscreenButton.classList.remove("full-screen");
                fullscreenButton.classList.add("exit-full-screen");
                tooltipText.textContent = "Exit Fullscreen"; // Update tooltip text
                console.log("Entered fullscreen mode");
            })
            // safety mechanism to handle errors if fullscreen is not supported
            // reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#error_handling
            .catch((error) => {
                console.error(
                    `Error attempting to enable fullscreen: ${error.message}`
                );
            });
    } else {
        // Exit fullscreen mode
        document
            .exitFullscreen()
            .then(() => {
                fullscreenButton.classList.remove("exit-full-screen");
                fullscreenButton.classList.add("full-screen");
                tooltipText.textContent = "Enter Fullscreen"; // Update tooltip text
                console.log("Exited fullscreen mode");
            })
            .catch((error) => {
                console.error(`Error attempting to exit fullscreen: ${error.message}`);
            });
    }
});

// Event listener click to close the modal
overlay.addEventListener("click", function (event) {
    // Ignore clicks on modal buttons or the modal itself
    if (event.target.closest(".modal") || event.target.closest(".modal-button")) {
        return;
    }

    const gameModal = document.querySelector(".modal-container");

    // Handle closing the game modal
    if (!gameModal.classList.contains("hidden")) {
        closeModal("gameModal", event);
    }
});

// Event listener for the "Escape" key to close the modal (accessibility feature)
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        const modal = document.querySelector(".modal-container");

        // Close the modal only if it's currently visible
        if (!modal.classList.contains("hidden")) {
            closeModal("gameModal", event);
        }
    }
});

// ------------------------------------------------------------------------ //
// ------------------------------ GAME FUNCTIONS -------------------------- //
// ------------------------------------------------------------------------ //

/**
 * Starts the game by initialising the game state and preparing the first level.
 * 
 * This function handles the setup required to begin the game, including:
 * - Resetting the game state variables.
 * - Clearing any lingering timeouts or glow effects.
 * - Generating and storing the sequence for the current level.
 * - Displaying the level indicator and updating it with the current level.
 * 
 * Behaviour:
 * - If `freestyleMode` is active, the function exits early without executing normal game logic.
 * - Resets the game state to ensure a clean start.
 * - Disables player input while the sequence is playing.
 * - Updates the level indicator to reflect the current level.
 * 
 * Notes:
 * - The `freestyleMode` flag allows the player to interact with the crystals freely without following the game sequence.
 * - The `clearAllTimeouts` and `clearAllGlows` functions are used to ensure no lingering effects from previous levels.
 * 
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * 
 */
function startGame() {
    if (freestyleMode) {
        console.log("Freestyle mode active. Skipping normal game logic.");
        return;
    }

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

/**
 * Generates and stores a random sequence of crystal colours for the current level.
 * 
 * This function creates a sequence of crystal colours based on the current level and stores it in the global `currentSequence` array.
 * The sequence is then played back using the `playSequence` function.
 * 
 * Behaviour:
 * - Resets the `currentSequence` array to ensure no lingering data from previous levels.
 * - Generates a random sequence of crystal colours by selecting random crystals from the DOM.
 * - The length of the sequence is determined by the current level (`level + 2`).
 * - Stores the colour of each selected crystal in the `currentSequence` array.
 * - Calls `playSequence` to play back the generated sequence.
 * 
 * Notes:
 * - The sequence length starts at 3 crystals for level 1 and increases by 1 for each subsequent level.
 * - Crystal colours are retrieved from the `data-color` attribute of each crystal container.
 * 
 * References:
 * - [MDN Web Docs: Math.random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random)
 * - [Stack Overflow: Generate Random Number Between Two Numbers](https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript)
 * 
 * @param {number} level - The current game level, used to determine the sequence length.
 * 
 * @example
 * // Generate and store a sequence for level 1
 * storeSequence(1);
 */
function storeSequence(level) {
    currentSequence = []; // Reset the sequence before generating a new one
    let crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers

    for (let i = 0; i < level + 2; i++) {
        // Start with 3 crystals at level 1
        let randomIndex = Math.floor(Math.random() * crystals.length);
        let selectedCrystal = crystals[randomIndex];
        currentSequence.push(selectedCrystal.dataset.color); // Store the crystal’s color in the global array
    }

    console.log("Generated sequence:", currentSequence);
    playSequence(currentSequence); // Play the sequence
}

/**
 * Plays the sequence of crystal colours for the current level.
 * 
 * This function visually and audibly plays back the sequence of crystal colours stored in the `sequence` array.
 * It activates the glow effect on the crystals, plays the corresponding sounds, and ensures proper timing between each crystal.
 * 
 * Behaviour:
 * - Activates the overlay to block player interactions during the sequence.
 * - Clears any lingering timeouts or glow effects from previous sequences.
 * - Iterates through the `sequence` array and plays each crystal's glow and sound with a delay.
 * - Deactivates the glow effect after a short duration for each crystal.
 * - Enables player interactions after the sequence finishes.
 * 
 * Notes:
 * - The sequence playback is delayed by 2 seconds before starting to allow for a smoother transition.
 * - Each crystal in the sequence is played with a 1.2-second delay between them.
 * - The glow effect duration for each crystal is 600ms.
 * - If the game is muted (`isMuted` is `true`), no sound will be played.
 * 
 * References:
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * - [FreeCodeCamp: JavaScript Timing Events: setTimeout and setInterval](https://www.freecodecamp.org/news/javascript-timing-events-settimeout-and-setinterval/)
 * - [MDN Web Docs: Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
 * - [MDN Web Docs: Array.prototype.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
 * - [MDN Web Docs: HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)
 * - [FreeCodeCamp: JavaScript Array Find Tutorial - How to Iterate Through Elements in an Array](https://www.freecodecamp.org/news/javascript-array-find-tutorial-how-to-iterate-through-elements-in-an-array/)
 * - [Dev.to: Console Methods](https://dev.to/johongirr/consolelog-consoleerror-consoleassert-and-more-1lf)
 * 
 * @param {string[]} sequence - An array of crystal colours representing the sequence to be played.
 * 
 * @example
 * // Play a sequence of crystal colours
 * playSequence(["blue", "green", "pink"]);
 */
function playSequence(sequence) {
    activateOverlay(); // Activate overlay to block crystal interactions
    clearAllTimeouts(); // Clear any lingering global timeouts
    clearAllGlows(); // Clear any lingering glow effects

    let crystals = document.querySelectorAll(".crystal-container");

    // Add a delay before starting the sequence
    setTimeout(() => {
        clearAllGlows(); // Clear any lingering glow effects
        console.log("Cleared all glows before starting the sequence.");

    }, 300); // Delay by 300ms

    setTimeout(() => {
        sequence.forEach((color, index) => {
            setTimeout(() => {
                let crystal = [...crystals].find((c) => c.dataset.color === color);

                if (crystal) {
                    // Activate glow
                    crystal.querySelector(".glow").classList.add("active");
                    crystal.querySelector(".light-crystal").classList.add("active");

                    if (!audioManager.isMuted) {
                        audioManager.lowerAmbientVolume();
                    }

                    // Play the corresponding crystal sound
                    if (audioManager.buffers[color]) {
                        audioManager.playSound(audioManager.buffers[color]);
                    } else {
                        console.error(`No audio buffer found for crystal: ${color}`);
                    }

                    // Deactivate glow after a short delay
                    crystalTimeouts[color] = setTimeout(() => {
                        crystal.querySelector(".glow").classList.remove("active");
                        crystal.querySelector(".light-crystal").classList.remove("active");
                        delete crystalTimeouts[color]; // Remove the timeout reference
                    }, 600); // Same duration as glow effect
                }
            }, index * 1200); // Delay each crystal by 1.2 seconds
        });

        // Enable crystal clicks after the sequence finishes
        setTimeout(() => {
            isSequencePlaying = false; // Allow player interactions
            waitForPlayerInput();
        }, sequence.length * 1200); // Ensure the timeout matches the total sequence duration
    }, 2000); // Add a 2-second delay before starting the sequence
}

/**
 * Waits for the player to input their sequence by interacting with the crystals.
 * 
 * This function prepares the game for the player's turn by:
 * - Activating the crystals for interaction.
 * - Resetting the player's input array for the new round.
 * - Removing any duplicate event listeners to prevent unintended behavior.
 * 
 * Behaviour:
 * - Sets the `isPlayerTurn` flag to `true` to indicate it's the player's turn.
 * - Resets the `playersInput` array to ensure no lingering input from previous rounds.
 * - Deactivates the overlay to allow crystal interactions.
 * - Ensures no duplicate event listeners are attached to the crystals by removing existing listeners before adding new ones.
 * 
 * Notes:
 * - Duplicate event listeners can cause unintended behaviour, such as multiple triggers for a single interaction.
 * - The `removeEventListener` method is used to prevent duplication before attaching new listeners.
 * - This function is called after the sequence has been played back to the player.
 * 
 * References:
 * - [MDN Web Docs: EventTarget.removeEventListener() method](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)
 * - [FreeCodeCamp: The addEventListener() Method](https://www.freecodecamp.org/news/javascript-addeventlistener-example-code/)
 * - [Stack Overflow: Removing Duplicate Event Listeners](https://stackoverflow.com/questions/45723205/removing-duplicate-event-listeners)
 * 
 */
function waitForPlayerInput() {
    console.log("Waiting for player input...");
    isPlayerTurn = true; // Set flag to indicate it's the player's turn
    isWaitingForInput = false; // Reset the flag
    deactivateOverlay(); // Deactivate overlay to allow crystal interactions

    playersInput = []; // Reset player's input for the new round
    console.log("Player input reset:", playersInput);
    console.log("isPlayerTurn set to:", isPlayerTurn);

    let crystals = document.querySelectorAll(".crystal-container"); // Get all crystal containers
    console.log("Crystals available for player input:", crystals);

    // Add event listeners to each crystal for player input
    crystals.forEach((crystal) => {
        crystal.removeEventListener("click", handleCrystalClick); // Remove previous listeners
        crystal.removeEventListener("touchend", handleCrystalClick); // Ensure no duplicates
        crystal.addEventListener("click", handleCrystalClick); // Add click event listener
        crystal.addEventListener("touchend", handleCrystalClick); // Add touch event listener
    });
}

/**
 * Handles the player's click on a crystal during their turn.
 * 
 * This function processes the player's input by:
 * - Checking if it's the player's turn (using the `isPlayerTurn` flag).
 * - Retrieving the clicked crystal's colour and storing it in the `playersInput` array.
 * - Logging debugging information for the clicked crystal and the player's input sequence.
 * - Validating the player's input against the correct sequence after a delay (to allow glow deactivation).
 * 
 * Behaviour:
 * - If it's not the player's turn (`isPlayerTurn` is `false`), the function exits early.
 * - Adds the clicked crystal's colour to the `playersInput` array.
 * - Logs the clicked crystal's colour and the current input sequence for debugging purposes.
 * - If the player's input matches the required sequence length, input validation is triggered after a 600ms delay.
 * 
 * Notes:
 * - The `isPlayerTurn` flag prevents interactions when it's not the player's turn.
 * - The delay before input validation matches the glow deactivation duration to ensure smooth gameplay.
 * - This function is called whenever the player clicks or taps on a crystal.
 * 
 * References:
 * - [MDN Web Docs: Event.currentTarget](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)
 * - [W3Schools: JavaScript Array push()](https://www.w3schools.com/jsref/jsref_push.asp)
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * 
 * @param {Event} event - The click or touch event triggered by the player's interaction with a crystal.
 * 
 * @example
 * // Handle a player's click on a crystal
 * crystalElement.addEventListener("click", handleCrystalClick);
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

        // Delay input validation to allow glow deactivation
        setTimeout(() => {
            checkPlayerInput(); // Compare with the correct sequence
        }, 600); // Match the glow deactivation duration
    }
}
/**
 * Checks the player's input sequence against the correct sequence for the current level.
 * 
 * This function validates the player's input by:
 * - Restoring the ambient soundscape volume before performing the comparison.
 * - Comparing the `playersInput` array with the `currentSequence` array using `JSON.stringify` for strict equality.
 * - Logging debugging information about the lengths of both arrays and the comparison result.
 * - Triggering the appropriate response based on the comparison result:
 *   - Calls `celebrateCorrectAnswer` if the input is correct.
 *   - Calls `showPlayAgainModal` if the input is incorrect.
 * 
 * Behaviour:
 * - Logs the lengths of the player's input and the correct sequence for debugging purposes.
 * - Uses strict comparison to ensure both the order and values of the arrays match.
 * - Restores the ambient sound volume before performing the comparison.
 * - Calls the appropriate function to handle the result of the comparison.
 * 
 * Notes:
 * - The `JSON.stringify` method is used for deep comparison of arrays.
 * - This function is called after the player has completed their input sequence.
  * 
 * References:
 * - [MDN Web Docs: JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
 * - [Stack Overflow: How to compare arrays in JavaScript](https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript)
 * - [GeeksforGeeks: How to compare two arrays in JavaScript](https://www.geeksforgeeks.org/how-to-compare-two-arrays-in-javascript/)
 * 
 * @example
 * // Example of a correct input sequence
 * playersInput = ["blue", "green", "pink"];
 * currentSequence = ["blue", "green", "pink"];
 * checkPlayerInput(); // Logs "Correct input" and triggers celebration.
 * 
 * @example
 * // Example of an incorrect input sequence
 * playersInput = ["blue", "pink", "green"];
 * currentSequence = ["blue", "green", "pink"];
 * checkPlayerInput(); // Logs "Incorrect input" and shows the play again modal.
 */
function checkPlayerInput() {
    audioManager.restoreAmbientVolume(); // Restore ambient soundscape volume
    // Check if both arrays are the same length before comparing
    console.log(
        `Player's input length: ${playersInput.length}, Current sequence length: ${currentSequence.length}`
    );

    if (JSON.stringify(playersInput) === JSON.stringify(currentSequence)) {
        console.log("Correct input");
        celebrateCorrectAnswer();
    } else {
        console.log("Incorrect input. Showing play again modal");
        showPlayAgainModal();
    }
}

/**
 * Celebrates the player's correct input by activating a glowing effect on all crystals, 
 * playing a celebration sound, and transitioning to the next level.
 * 
 * This function handles the celebration sequence by:
 * - Activating glow effects on all crystals with a delay.
 * - Playing a celebration sound if available.
 * - Blocking player interactions during the celebration using an overlay.
 * - Deactivating the glow effects after a short duration.
 * - Adding a brief pause before transitioning to the next level.
 * 
 * Behaviour:
 * - Activates the glow and celebration-specific classes for all crystals.
 * - Plays the celebration sound if the `audioBuffers.celebration` buffer is loaded.
 * - Deactivates the glow effects after 2.5 seconds.
 * - Proceeds to the next level after a 1-second breather following the glow deactivation.
 * 
 * Notes:
 * - The overlay is activated during the celebration to block player interactions.
 * - The celebration sound is played only if the game is not muted and the audio buffer is available.
 * - This function is called when the player's input matches the correct sequence.
 * 
 * References:
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * 
 */
function celebrateCorrectAnswer() {
    let crystals = document.querySelectorAll(".crystal-container");
    console.log("Celebrating correct answer! All crystals will glow.");

    // Activate glow for all crystals
    setTimeout(() => {
        crystals.forEach((crystal) => {
            crystal
                .querySelector(".glow")
                .classList.add("active", "celebration-active"); // Add glow and celebration-specific class
            crystal
                .querySelector(".light-crystal")
                .classList.add("active", "celebration-active"); // Add light-crystal and celebration-specific class
        });
        activateOverlay(); // Activate overlay for the celebration to block crystal interactions
        console.log("Glow activated for celebration.");
        // Play the celebration sound
        if (audioManager.buffers.celebration) {
            audioManager.playSound(audioManager.buffers.celebration);
        }
    }, 300); // 300ms delay before starting the celebration

    // Play celebratory music (placeholder for actual implementation)
    console.log("Playing celebratory twinkly music...");

    // Deactivate glow after a short delay
    setTimeout(() => {
        crystals.forEach((crystal) => {
            crystal
                .querySelector(".glow")
                .classList.remove("active", "celebration-active"); // Remove glow and celebration-specific class
            crystal
                .querySelector(".light-crystal")
                .classList.remove("active", "celebration-active"); // Remove light-crystal and celebration-specific class
        });
        clearAllGlows(); // Clear all glow effects
        // Add a breather before proceeding to the next level
        setTimeout(() => {
            updateHighestLevel(); // Updates the highest level reached if a player name is stored
            nextLevel(); // Proceed to the next level
        }, 1000); // 1-second breather
    }, 2500); // 2.5 seconds delay for the celebration
}

/**
 * Prepares the game for the next level by resetting the game state, updating the level indicator, 
 * generating a new sequence, and playing it back to the player.
 * 
 * This function handles the transition to the next level by:
 * - Incrementing the `level` variable to reflect the new level.
 * - Resetting the player's input array for the new level.
 * - Disabling player interactions while the sequence is being played.
 * - Updating the level number displayed in the UI.
 * - Clearing any lingering timeouts or glow effects from the previous level.
 * - Generating and storing the new sequence for the current level.
 * - Playing the new sequence for the player.
 * 
 * Behaviour:
 * - Updates the level indicator in the DOM to reflect the current level.
 * - Logs the current sequence for debugging purposes.
 * - Ensures the game state is reset before starting the new level.
 * 
 * Notes:
 * - If the level indicator element is not found in the DOM, an error is logged, but the game continues.
 * - This function is called after the player successfully completes the current level.
 * 
 * References:
 * - [MDN Web Docs: Element.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * 
 */
function nextLevel() {
    console.log(
        `Great memory! Let's see what the crystals play next... Proceeding to level ${level + 1
        }`
    );
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

/**
 * Toggles freestyle mode, allowing the player to enter or exit freestyle mode.
 * 
 * This function handles both entering and exiting freestyle mode:
 * 
 * When entering freestyle mode:
 * - Cancels the current game logic and prepares the game for freestyle play.
 * - Clears all timeouts, intervals, and glow effects.
 * - Resets game state flags and player input.
 * - Hides the overlay and speech bubble.
 * - Updates the level indicator to display "Freestyle Mode."
 * - Updates the freestyle button to indicate the active mode.
 * - Changes the tooltip to "Exit Freestyle Mode."
 * 
 * When exiting freestyle mode:
 * - Resets the game state to level 1.
 * - Updates the level indicator to display "Level 1."
 * - Updates the freestyle button to its default state.
 * - Changes the tooltip to "Enter Freestyle Mode."
 * 
 * Behaviour:
 * - Ensures that freestyle mode is toggled correctly by checking the `freestyleMode` flag.
 * - Logs the activation or deactivation of freestyle mode for debugging purposes.
 * 
 * Notes:
 * - Freestyle mode is a non-competitive mode where the player can freely interact with the crystals.
 * - The overlay is deactivated to allow crystal interactions during freestyle mode.
 * - This function is triggered when the player clicks the freestyle button.
 * 
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * 
 */
function freestyle() {
    const freestyleButton = document.querySelector(".game-button.freestyle");
    const tooltipText = freestyleButton.querySelector(".tooltiptext");

    if (freestyleMode) {
        // Exit freestyle mode
        freestyleMode = false;
        freestyleButton.classList.remove("mode"); // Reset button to default state
        tooltipText.textContent = "Enter Freestyle Mode"; // Update tooltip

        const speechBubble = document.querySelector(".speech-bubble");
        const gameModal = document.querySelector(".modal-container");
        const levelIndicator = document.querySelector(".level-indicator");

        if (levelIndicator) {
            levelIndicator.innerHTML = `Level <span id="level-number">1</span>`; // Reset to Level 1
        }
        // If either bubble or game modal is visible, hide them
        if (
            !speechBubble.classList.contains("hidden") ||
            !gameModal.classList.contains("hidden")
        ) {
            speechBubble.classList.add("hidden");
            gameModal.classList.add("hidden");
        }
        activateOverlay(); // Activate overlay to block crystal interactions
        freestyleMode = false; // Reset freestyle mode
        startGame(); // Reset the game at level 1
        console.log("Game restarted and overlay activated.");
    } else {
        // Enter freestyle mode
        freestyleMode = true;

        // Clear all timeouts and intervals
        clearAllTimeouts();
        clearTimeoutsAndIntervals();

        // Clear all glow effects
        clearAllGlows();

        // Reset game state flags
        isPlayerTurn = true; // Allow crystal interactions
        isWaitingForInput = false;
        isSequencePlaying = false;

        // Reset player input and sequence
        playersInput = [];
        currentSequence = [];

        // Hide the overlay and disable pointer events
        overlay.classList.remove("active");
        overlay.style.pointerEvents = "none";

        // Hide the speech bubble
        const speechBubble = document.querySelector(".speech-bubble");
        if (speechBubble) {
            speechBubble.classList.add("hidden");
        }

        // Update the level indicator to show "Freestyle Mode"
        const levelIndicator = document.querySelector(".level-indicator");
        if (levelIndicator) {
            levelIndicator.textContent = "Freestyle"; // Change the text
            levelIndicator.classList.remove("hidden"); // Ensure it's visible
            levelIndicator.style.display = "block"; // Explicitly show it
        } else {
            console.error("Level indicator not found in the DOM!"); // catch error if the element is not found
        }

        // Update the freestyle button
        freestyleButton.classList.add("mode"); // Change button to yellow star
        tooltipText.textContent = "Exit Freestyle Mode"; // Update tooltip
        console.log("Freestyle mode activated. Game logic canceled.");
    }
}

// --------------------------------------------------------------------------------- //
// ------------------------------ UTILITY FUNCTIONS -------------------------------- //
// --------------------------------------------------------------------------------- //

/**
 * Activates the overlay by adding the 'active' class and enabling pointer events.
 * 
 * This function ensures that the overlay is visible and interactive, blocking user interactions with the game elements behind it.
 * 
 * Behaviour:
 * - Adds the 'active' class to the overlay element.
 * - Enables pointer events to make the overlay interactive.
 * - Logs the activation of the overlay for debugging purposes.
 * 
 * Notes:
 * - The overlay is used to block interactions during specific game states, such as sequence playback or modals.
 * 
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [MDN Web Docs: CSS pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events)
 * 
 * @example
 * // Activate the overlay to block user input
 * activateOverlay();
 */
function activateOverlay() {
    overlay.classList.add("active");
    overlay.style.pointerEvents = "all"; // Enable pointer events
    console.log("Overlay activated.");
}
/**
 * Deactivates the overlay by removing the 'active' class and disabling pointer events.
 * 
 * This function ensures that the overlay is hidden and non-interactive, allowing user interactions with the game elements behind it.
 * 
 * Behaviour:
 * - Removes the 'active' class from the overlay element.
 * - Disables pointer events to make the overlay non-interactive.
 * - Logs the deactivation of the overlay for debugging purposes.
 * 
 * Notes:
 * - The overlay is deactivated to allow user interactions during specific game states, such as the player's turn.
 * 
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [MDN Web Docs: CSS pointer-events](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events)
 * 
 * @example
 * // Deactivate the overlay to allow user input
 * deactivateOverlay();
 */
function deactivateOverlay() {
    overlay.classList.remove("active");
    overlay.style.pointerEvents = "none"; // Disable pointer events
    console.log("Overlay deactivated.");
}

/**
 * Activates the glow effect for a crystal container and plays the corresponding sound.
 * 
 * This function visually highlights the crystal by adding active classes to its glow and light-crystal elements.
 * It also plays the associated sound for the crystal's color and removes the glow effect after a short delay.
 * 
 * Behaviour:
 * - Checks if it is the player's turn (`isPlayerTurn` flag). If not, the function exits early.
 * - Adds the 'active' class to the glow and light-crystal elements of the container.
 * - Plays the corresponding sound for the crystal's color if the audio buffer is available.
 * - Logs the activation of the glow and any errors related to missing audio buffers.
 * - Removes the 'active' class from the glow and light-crystal elements after 600ms.
 * 
 * Notes:
 * - The glow effect duration is set to 600ms to match the game's visual timing.
 * - If the audio buffer for the crystal's color is not found, an error is logged, but the game continues.
 * 
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [MDN Web Docs: HTMLElement.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * 
 * @param {HTMLElement} container - The crystal container element to activate the glow for.
 * 
 * @example
 * // Activate the glow for a crystal container
 * const crystalContainer = document.querySelector(".crystal-container[data-color='blue']");
 * activateGlow(crystalContainer);
 */
const activateGlow = (container) => {
    if (!isPlayerTurn) {
        return;
    }

    // Add active classes for glow and light-crystal
    container.querySelector(".glow").classList.add("active");
    container.querySelector(".light-crystal").classList.add("active");

    // Play the corresponding crystal sound
    const crystalColor = container.dataset.color;
    console.log("Activating glow for crystal:", crystalColor);
    if (audioManager.buffers[crystalColor]) {
        audioManager.playSound(audioManager.buffers[crystalColor]);
    } else {
        console.error("No audio buffer found for crystal:", crystalColor);
    }

    // Remove active classes to return to the default state
    setTimeout(() => {
        container.querySelector(".glow").classList.remove("active");
        container.querySelector(".light-crystal").classList.remove("active");
    }, 600); // 600ms = 0.6 seconds
};

/**
 * Clears all active timeouts and intervals to prevent lingering effects in the game.
 * 
 * This function ensures that no timeouts or intervals from previous game states remain active,
 * which could interfere with the current game logic or cause unexpected behavior.
 * 
 * Behaviour:
 * - Retrieves the highest timeout ID currently in use and clears all timeouts up to that ID.
 * - Retrieves the highest interval ID currently in use and clears all intervals up to that ID.
 * - Logs the clearing process for debugging purposes.
 * 
 * Notes:
 * - This function is useful for resetting the game state or transitioning between game modes.
 * - Clearing timeouts and intervals ensures that no unintended callbacks are executed.
 * 
 * References:
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * - [MDN Web Docs: setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
 * - [MDN Web Docs: clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/clearTimeout)
 * - [MDN Web Docs: clearInterval](https://developer.mozilla.org/en-US/docs/Web/API/clearInterval)
 * 
 * @example
 * // Clear all timeouts and intervals before starting a new game
 * clearTimeoutsAndIntervals();
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
}

/**
 * Clears all global timeouts and crystal-specific timeouts.
 * 
 * This function ensures that no lingering timeouts from previous game states remain active,
 * which could interfere with the current game logic or cause unexpected behavior.
 * 
 * Behaviour:
 * - Retrieves the highest timeout ID currently in use and clears all timeouts up to that ID.
 * - Iterates through the `crystalTimeouts` object to clear timeouts specific to each crystal.
 * - Logs the clearing process for debugging purposes and removes references to cleared timeouts.
 * 
 * Notes:
 * - This function is more specific for managing crystal timeouts and ensures that no unintended glow effects persist.
 * 
 * References:
 * - [MDN Web Docs: setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * - [MDN Web Docs: clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/clearTimeout)
 * 
 * @example
 * // Clear all timeouts before starting a new game
 * clearAllTimeouts();
 */
function clearAllTimeouts() {
    let highestTimeoutId = setTimeout(() => { }, 0); // Get the highest timeout ID
    for (let i = 0; i <= highestTimeoutId; i++) {
        clearTimeout(i); // Clear each timeout
    }

    // Clear all crystal-specific timeouts
    for (let color in crystalTimeouts) {
        clearTimeout(crystalTimeouts[color]);
        console.log(`Cleared timeout for crystal: ${color}`);
        delete crystalTimeouts[color];
    }
}

/**
 * Clears all glow effects from the crystals.
 * 
 * This function ensures that no lingering glow effects remain active on any crystal,
 * resetting their visual state to default.
 * 
 * Behaviour:
 * - Selects all crystal containers in the DOM.
 * - Removes the 'active' class from the glow and light-crystal elements of each crystal.
 * 
 * Notes:
 * - This function is useful for resetting the visual state of crystals between game states or levels.
 * 
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [MDN Web Docs: querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll)
 * 
 * @example
 * // Clear all glow effects from the crystals
 * clearAllGlows();
 */
function clearAllGlows() {
    let crystals = document.querySelectorAll(".crystal-container");
    crystals.forEach((crystal) => {
        crystal.querySelector(".glow").classList.remove("active");
        crystal.querySelector(".light-crystal").classList.remove("active");
    });
}

/**
 * Sets the height of the body element to match the visible viewport height.
 * 
 * This function adjusts the height of the body to account for changes in the viewport height,
 * such as when the address bar on mobile devices hides or shows, which can affect the layout.
 * 
 * Behaviour:
 * - Retrieves the current viewport height using `window.innerHeight`.
 * - Sets the body's height style property to the calculated viewport height.
 * 
 * Notes:
 * - This function is particularly useful for ensuring consistent layout on mobile devices.
 * - It should be called on page load and whenever the window is resized.
 * 
 * References:
 * - [MDN Web Docs: Window.innerHeight](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight)
 * - [MDN Web Docs: Element.style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)
 * 
 * @example
 * // Set the body height on page load
 * window.addEventListener("load", setBodyHeight);
 * // Update the height when the window is resized (if the the address bar hides)
 * window.addEventListener("resize", setBodyHeight);
 */
function setBodyHeight() {
    document.body.style.height = `${window.innerHeight}px`;
}

// Set the height on page load
window.addEventListener("load", setBodyHeight);

// Update the height when the window is resized (if the the address bar hides)
window.addEventListener("resize", setBodyHeight);

/**
 * Updates the highest level reached by the player and stores it in localStorage.
 * 
 * This function checks if a player's name is stored in localStorage. If a name exists, it compares the current level 
 * with the stored highest level. If the current level is greater, it updates the highest level in localStorage.
 * 
 * Behaviour:
 * - Retrieves the player's name from localStorage.
 * - If no name is found, logs a message and exits the function.
 * - Retrieves the stored highest level from localStorage or defaults to 0 if not found.
 * - Compares the current level with the stored highest level.
 * - If the current level is higher, updates the highest level in localStorage.
 * 
 * Notes:
 * - This function is called after the player successfully completes a level within the celebrateCorrectAnswer() function.
 * - The highest level is only stored if a player's name is present in localStorage.
 * 
 * References:
 * - [MDN Web Docs: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
 * - [MDN Web Docs: parseInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)
 * 
 * @example
 * // Update the highest level after completing a level
 * updateHighestLevel();
 */
function updateHighestLevel() {
    const storedName = localStorage.getItem("playerName"); // Check if the player's name is stored
    if (!storedName) {
        console.log("Player name not found. Highest level will not be stored.");
        return; // Exit the function if no player name is stored
    }

    const storedHighestLevel = parseInt(localStorage.getItem("highestLevel")) || 0;
    if (level > storedHighestLevel) {
        localStorage.setItem("highestLevel", level);
        console.log(`New highest level saved: Level ${level}`);
    }
}

/**
 * Synchronises the audio settings UI in the settings modal.
 *
 * Updates the state of all audio-related UI controls in the settings modal (game dashboard),
 * including volume sliders and mute buttons for ambient, background, and effects channels.
 * Each slider is set to the user's intended volume (not the current GainNode value, which may be ducked or globally muted)
 * and is disabled if the corresponding channel or global mute is active.
 * The `.muted` class is applied or removed on each mute button based on the per-channel mute flags.
 *
 * Behaviour:
 * - Iterates over all `.volume-slider` elements and sets their value to the corresponding user volume variable.
 * - Disables each slider if the channel or global mute is active.
 * - Updates the `.mute-toggle` button style for each channel based on its mute flag.
 * - Ensures the UI always reflects the user's intended audio state, regardless of temporary changes to GainNode values.
 *
 * Notes:
 * - Should be called after opening the settings modal and after any user interaction with audio controls.
 * - Does not modify audio playback, only updates the UI.
 *
 * References:  
 * - [MDN Web Docs: NodeList: forEach() method](https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach)
 * - [MDN Web Docs: Element.dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)
 */
function syncAudioSettingsUI() {
    document.querySelectorAll(".volume-slider").forEach(slider => {
        const soundType = slider.dataset.sound;
        let userVolume = 1; 
        let isMuted = false; 

        if (soundType === "ambient") {
            userVolume = audioManager.userAmbientVolume;
            isMuted = audioManager.isAmbientMuted;
        } else if (soundType === "background") {
            userVolume = audioManager.userBackgroundVolume;
            isMuted = audioManager.isBackgroundMuted;
        } else if (soundType === "effects") {
            userVolume = audioManager.userEffectsVolume;
            isMuted = audioManager.isEffectsMuted;
        }

        slider.value = userVolume;
        slider.disabled = isMuted || audioManager.isMuted; // Disable if globally or channel muted

        const muteButton = document.querySelector(`.mute-toggle[data-sound="${soundType}"]`);
        if (muteButton) {
            if (isMuted) {
                muteButton.classList.add("muted");
            } else {
                muteButton.classList.remove("muted");
            }
        }
    });
}

/**
 * Updates the main sound button UI to reflect the current global and per-channel mute state.
 *
 * This function sets the appearance and tooltip of the main sound button based on whether the game is globally muted
 * or all individual channels (ambient, background, effects) are muted. If any channel is unmuted and global mute is off,
 * the button appears unmuted; otherwise, it appears muted.
 *
 * Behaviour:
 * - Removes the "muted" class and sets tooltip to "Mute Sound" if any channel is unmuted and global mute is off.
 * - Adds the "muted" class and sets tooltip to "Unmute Sound" if global mute is on or all channels are muted.
 *
 * Notes:
 * - Should be called after any mute/unmute action or when the audio state changes.
 * - Keeps the UI consistent with the actual audio playback state.
 *
 * References:
 * - [MDN Web Docs: Element.classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
 * - [MDN Web Docs: querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector)
 *
 * @example
 * // Update the sound button UI after toggling mute
 * updateSoundButtonUI();
 */
function updateSoundButtonUI() {
    const soundButton = document.querySelector(".game-button.sound");
    const tooltipText = soundButton.querySelector(".tooltiptext");
    // If any channel is unmuted and global mute is off, show as unmuted
    if (
        !audioManager.isMuted &&
        (!audioManager.isAmbientMuted || !audioManager.isBackgroundMuted || !audioManager.isEffectsMuted)
    ) {
        soundButton.classList.remove("muted");
        tooltipText.textContent = "Mute Sound";
    } else {
        soundButton.classList.add("muted");
        tooltipText.textContent = "Unmute Sound";
    }
}

/**
 * Deletes all saved data from localStorage and resets relevant game state and UI elements.
 * 
 * This function clears specific and all localStorage data, provides feedback to the user,
 * and resets any game state or UI elements affected by the deleted data.
 * 
 * Behaviour:
 * - Removes the player's name from localStorage.
 * - Clears all localStorage data.
 * - Clears the highest level in localStorage.
 * - Resets the speech bubble message and message index to their default values.
 * - Reloads the page to ensure all changes take effect.
 * 
 * Notes:
 * - This function is triggered by the settings modal and the "Delete Saved Data" button within it.
 * - The speech bubble message at index 6 is reset to "Nice to meet you!".
 * - The `currentMessageIndex` is reset to 0.
 * - Reloading the page ensures a clean state after data deletion.
 * 
 * References:
 * - [MDN Web Docs: localStorage.removeItem](https://developer.mozilla.org/en-US/docs/Web/API/Storage/removeItem)
 * - [MDN Web Docs: localStorage.clear](https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear)
 * - [MDN Web Docs: location.reload](https://developer.mozilla.org/en-US/docs/Web/API/Location/reload)
 * 
 */
function deleteSavedData() {
    // Clear specific data from localStorage
    localStorage.removeItem("playerName"); // Remove the player's name
    console.log("Player name removed from localStorage.");

    // Clear all localStorage data
    localStorage.clear();
    localStorage.removeItem("highestLevel"); // Reset the highest level

    // Reset any game state or UI elements affected by the deleted data
    speechBubbleMessages[6] = "Nice to meet you!"; // Reset the default message
    currentMessageIndex = 0; // Reset the message index

    // Reload the page to ensure a clean state
    console.log("Reloading the page after deleting saved data...");
    location.reload(); // Reload the page to apply changes
}

