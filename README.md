# Echoes of the Crystal Cave
#### A pixel art memory game
#### About:

This game takes the classic Simon and Bop It style memory challenge and gives it a unique twist with a cave setting, atmospheric audio, and a five-note scale system. Players interact with glowing crystals that light up and produce musical tones when activated. The game is designed to be accessible, engaging, and visually appealing, with pixel-art aesthetics and simple, responsive controls.

**Target Audience:**
- Casual gamers who enjoy quick, skill-based challenges.
- All age groups, from children to adults, due to simple controls and gameplay.
- Fans of retro and pixel art games looking for a nostalgic yet fresh experience.
- Fans of music based games.
- Fans of memory games and memory training games (music memory included).

## Design & Planning:

### Game Overview:
Echoes of the Crystal Cave is a memory-based puzzle game where players help Brucey the bat navigate a mysterious cave filled with glowing, musical crystals. Players must watch and listen to and repeat sequences of notes to progress, while enjoying a dynamic audio-visual experience.

### Concept:
Help Brucey the bat remember the sequence of crystals. 

### Game Mechanics:
#### Controls:
- **Mouse Click** – Click on the crystals to play their notes.
- **Touch Screen Tap** – Tap crystals on mobile for touch interaction.
- **Keyboard Keys (A, W, S, E, D)** – Alternative input for accessibility.
#### Visual & Audio Cues:
- Crystals glow in different colours when activated.
- Each crystal plays a distinct note in a five-note scale.
- Correct sequence all crystals glow and a rewarding sound plays before the next level sequence starts.
- Incorrect sequence results in modal pop up with encouraging 'try again' messages (_could have random inspiring messages_) and option to play again yes/no buttons. 

#### Win Conditions:
- Successfully repeat the full sequence to advance to the next round.

#### Lose Conditions:
- In Hard/Default Mode, a single mistake results in a game over. 
- _(could have feature)_ Easy Mode, players have three chances before restarting.

#### Could have features:
- **Easter egg** - Player name input. If name is equal to Brucey, Brucey the bat changes colour or wears a hat. 

#### Level Design & Sequence Length:
1. Level 1 = sequence of 3
2. Level 2 = sequence of 4
3. Level 3 = sequence of 5 
... and so on.


#### Reference Images:
- Music notes/scale and crystal colour correspondence layout:

![Index Home Page Design](assets/media/design-sketch-crystals-controls.png)


#### Layout sketches:
The game is designed to be intuitive and accessible across multiple devices:
#### Game inspiration: 
Brucey the plush bat, who inspired the creative process behind the game’s theme. 

![Brucey the Bat](assets/media/brucey.png)

## Wireframes

1. ### Index / Home Page:

<details><summary><em>Click to expand wireframes</em></summary>

   ![Index Home Page Design](assets/media/echoes-index-page-wireframes.png)

   </details>
  
2. ### Index / Home Page with modal view:

<details><summary><em>Click to expand wireframes</em></summary>

   ![Index Home Page with modal view](assets/media/echoes-index-page-modal-wireframes.png)

   </details>

3. ### Game Page:

<details><summary><em>Click to expand wireframes</em></summary>

   ![Game Page Design](assets/media/echoes-game-page-wireframes.png)

   </details>

4. ### Landscape View Small Devices:

<details><summary><em>Click to expand wireframes</em></summary>

   ![Landscape Small Devices](assets/media/echoes-game-landscape-wireframes.png)

   </details>

5. ### Greetings / Ready? Modal:

<details><summary><em>Click to expand wireframes</em></summary>

   ![Greetings Ready Modal](assets/media/modal-welcome-ready-wireframes.png)

   </details>

6. ### Game Page Modal View:

<details><summary><em>Click to expand wireframes</em></summary>

   ![Game Page Modal View](assets/media/echoes-game-page-modal-wireframes.png)

   </details>

6. ### 404 Error Page:

<details><summary><em>Click to expand wireframes</em></summary>

   ![404 Error Page](assets/media/echoes-error-page-wireframes.png)

   </details>

## Pseudocode 

Basic pseudocode was used during the early planning and development stage. It was helpful to write out the basic logic in order to visualise the game layout and html div containers needed in order to make dynamic changes to each componant. 

### Game Initialization:

- Start the game when the player clicks "Start".
- Set the initial level to 1.
- Determine sequence length based on the level (Level 1 = 3, Level 2 = 4, Level 3 = 5 etc.).
- Generate a random sequence of numbers (1 to 5), each representing a crystal.
- Store the sequence.
- Display (play) the sequence by making the corresponding crystals glow and play their notes.

### Player Input:

- Wait for the player to start inputting their sequence by clicking on crystals.
- Store each clicked crystal in an array in the order they are clicked.
- After the player has entered the full sequence, compare it to the generated sequence.

### Sequence Validation:

- _**If the player's input matches the generated sequence:**_
  - Play a success animation (all crystals glow, twinkly music plays).
  - Increase the level.
  - Generate a new sequence with an increased length.
  - Display the new sequence.

- _**If the player's input does not match:**_

  - Display "Game Over" modal with retry option.
  - Option to restart from Level 1.

### Additional Features:

- Implement difficulty modes (e.g., limited attempts in hard mode/lives in easy mode/faster sequence speed).
- Add settings like brightness and sound control.
- Store player progress (e.g., name and highest level reached) in local storage.
- Easter egg for special player name (e.g., "Brucey" replace bat pixel sprite).

## Function Structure (and game psuedocode refined)

1. `startGame()`

    - Resets level to 1
    - Generates an initial sequence of 3 crystals
    - Displays the sequence to the player

2. `storeSequence()`

    - Generates a random sequence of crystal notes for each level
    - Ensures each level has a completely new sequence (level + 2)

3. `playSequence()`

    - Loops through the stored sequence
    - Makes each crystal glow and plays the corresponding note

4. `waitForPlayerInput()`

    - Captures player clicks, keyboard keys / A,W,S,E,D / touch, on crystals
    - Stores their input sequence

5. `checkPlayerInput()`

    - Compares player’s input with the stored sequence
    - If correct: calls `nextLevel()`
    - If incorrect: calls `showPlayAgainModal()`

6. `nextLevel()`

    - Increments level by 1
    - Calls `storeSequence()` to generate a new, longer sequence (by 1)
    - Calls `playSequence()` to show the new sequence

7. `showPlayAgainModal()`

    - Displays a modal asking if the player wants to retry
    - If "Yes": Calls `startGame()` to reset
    - If "No": Ends the game - return to home page