// AudioManager singleton for all audio logic
/**
 * Singleton class for managing all game audio, including loading, playback, muting, and volume.
 *
 * Handles ambient, background, and effects channels with per-channel and global controls.
 * Provides methods for loading audio assets, playing sounds, and synchronising audio state with the UI.
 *
 * Properties:
 * - `audioContext`: The Web Audio API context.
 * - `buffers`: Stores decoded audio buffers for all sounds.
 * - `crystalSounds`, `celebrationSound`, `caveBackgroundSound`, `caveAmbienceSound`: Audio asset paths.
 * - `effectsGain`, `backgroundGain`, `ambientGain`: GainNodes for volume control.
 * - User volume and mute flags for each channel and globally.
 *
 * Usage:
 * Import and use the singleton `audioManager` for all audio operations in the game.
 *
 * @class
 */
class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};
        this.crystalSounds = {
            blue: "assets/audio/blue-crystal-c-placeholder.mp3",
            green: "assets/audio/green-crystal-d-placeholder.mp3",
            pink: "assets/audio/pink-crystal-e-placeholder.mp3",
            yellow: "assets/audio/yellow-crystal-f-placeholder.mp3",
            orange: "assets/audio/orange-crystal-g-placeholder.mp3",
        };
        this.celebrationSound = "assets/audio/c-major-celebration-placeholder.mp3";
        this.caveBackgroundSound = "assets/audio/cave-background-placeholder.mp3";
        this.caveAmbienceSound = "assets/audio/ambience-placeholder.mp3";

        // Gain nodes
        this.effectsGain = this.audioContext.createGain();
        this.backgroundGain = this.audioContext.createGain();
        this.ambientGain = this.audioContext.createGain();

        // User volumes
        this._userAmbientVolume = 0.7;
        this._userBackgroundVolume = 0.7;
        this._userEffectsVolume = 0.7;

        // Mute flags
        this._isMuted = false;
        this._isAmbientMuted = false;
        this._isBackgroundMuted = false;
        this._isEffectsMuted = false;

        // Connect gain nodes
        this.effectsGain.connect(this.audioContext.destination);
        this.backgroundGain.connect(this.audioContext.destination);
        this.ambientGain.connect(this.audioContext.destination);
    }

    // --- Getters/Setters for flags and volumes ---
    get isMuted() { return this._isMuted; }
    set isMuted(val) {
        this._isMuted = val;
        this.updateMuteStates();
    }
    get isAmbientMuted() { return this._isAmbientMuted; }
    set isAmbientMuted(val) {
        this._isAmbientMuted = val;
        this.updateMuteStates();
    }
    get isBackgroundMuted() { return this._isBackgroundMuted; }
    set isBackgroundMuted(val) {
        this._isBackgroundMuted = val;
        this.updateMuteStates();
    }
    get isEffectsMuted() { return this._isEffectsMuted; }
    set isEffectsMuted(val) {
        this._isEffectsMuted = val;
        this.updateMuteStates();
    }
    get userAmbientVolume() { return this._userAmbientVolume; }
    set userAmbientVolume(val) {
        this._userAmbientVolume = val;
        this.updateMuteStates();
    }
    get userBackgroundVolume() { return this._userBackgroundVolume; }
    set userBackgroundVolume(val) {
        this._userBackgroundVolume = val;
        this.updateMuteStates();
    }
    get userEffectsVolume() { return this._userEffectsVolume; }
    set userEffectsVolume(val) {
        this._userEffectsVolume = val;
        this.updateMuteStates();
    }

    // -------------------- Main Audio Methods --------------------- //
     /**
     * Loads all audio files required for the game and stores them in the `buffers` object.
     *
     * This method fetches and decodes audio files for crystal sounds, background music,
     * ambient sound, and celebration effects.
     *
     * Behaviour:
     * - Iterates through the `crystalSounds` object to load crystal-specific audio files.
     * - Loads additional sounds for background, ambient, and celebration effects.
     * - Stores decoded audio data in the `buffers` property for playback.
     *
     * Notes:
     * - This method is asynchronous and should be called with `await`.
     * - The `buffers` object stores the decoded audio data for playback.
     *
     * References:
     * - [MDN Web Docs: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
     * - [MDN Web Docs: AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer)
     * @returns {Promise<void>}
     */
    async loadAllAudio() {
        // Load crystal sounds
        for (const [color, filePath] of Object.entries(this.crystalSounds)) {
            this.buffers[color] = await this.loadAudioFile(filePath);
        }
        this.buffers.celebration = await this.loadAudioFile(this.celebrationSound);
        this.buffers.background = await this.loadAudioFile(this.caveBackgroundSound);
        this.buffers.ambient = await this.loadAudioFile(this.caveAmbienceSound);
    }

    /**
     * Fetches an audio file from the given URL and decodes it into an AudioBuffer object.
     * 
     * This method uses the Fetch API to retrieve the audio file and decodes it using the Web Audio API.
     * If the fetch or decoding process fails, `null` is returned.
     * 
     * Behaviour:
     * - Fetches the audio file from the provided URL.
     * - Converts the response into an ArrayBuffer.
     * - Decodes the ArrayBuffer into an AudioBuffer using `audioContext.decodeAudioData`.
     * - Returns null if the fetch or decoding process fails.
     * 
     * Notes:
     * - This method is asynchronous and should be called with `await` or `.then`.
     * - The returned AudioBuffer can be used for audio playback in the game.
     * - The `try...catch` block ensures that any errors during the decoding process are caught and handled gracefully, preventing the application from crashing.
     * 
     * References:
     * - [MDN Web Docs: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
     * - [MDN Web Docs: ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
     * - [MDN Web Docs: AudioContext.decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData)
     * - [W3Schools: Async/Await](https://www.w3schools.com/js/js_async.asp)
     * - [W3Schools: JavaScript Promises](https://www.w3schools.com/js/js_promise.asp)
     * - [FreeCodeCamp: Try/Catch in JavaScript – How to Handle Errors in JS](https://www.freecodecamp.org/news/try-catch-in-javascript/)
     * 
     * @param {string} url - The URL of the audio file to fetch and decode.
     * @returns {Promise<AudioBuffer|null>} A promise that resolves to the decoded AudioBuffer or `null` if an error occurs.
     * 
     * @example
     * // Inside the AudioManager class
     * const audioBuffer = await this.loadAudioFile("assets/audio/example.mp3");
     * if (audioBuffer) {
     *     console.log("Audio file loaded successfully.");
     * } else {
     *     console.error("Failed to load audio file.");
     * }
     */
    async loadAudioFile(url) {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        try {
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch {
            return null;
        }
    }

    /**
     * Plays a sound effect using the provided AudioBuffer.
     *
     * This method handles audio playback by creating a BufferSource, connecting it to the effects GainNode
     * for volume control, and starting playback. If the game is muted or no buffer is provided, playback is skipped.
     *
     * Behaviour:
     * - Checks if the game is muted (`isMuted` flag). If muted, skips playback.
     * - Validates the provided AudioBuffer. If no buffer is provided, exits early.
     * - Creates a BufferSource, connects it to the effects GainNode, and starts playback.
     *
     * Notes:
     * - The effects GainNode is used to control the volume of sound effects.
     * - This method is called whenever a crystal sound or celebration sound needs to be played.
     *
     * References:
     * - [MDN Web Docs: AudioContext.createBufferSource](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource)
     * - [MDN Web Docs: AudioNode.connect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect)
     * - [MDN Web Docs: AudioBufferSourceNode.start](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start)
     *
     * @param {AudioBuffer} buffer - The AudioBuffer containing the sound to play.
     *
     * @example
     * // Play a crystal sound
     * this.playSound(this.buffers["blue"]);
     */
    playSound(buffer) {
        if (this.isMuted || !buffer) return;
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.effectsGain);
        source.start(0);
    }

    /**
     * Plays the background sound for the game.
    *
    * This method handles playback of the background sound by:
    * - Creating a BufferSource for the background audio.
    * - Looping the background sound for continuous playback.
    * - Connecting the BufferSource to the persistent background GainNode for volume control.
    *
    * Behaviour:
    * - Checks if the background audio buffer is loaded. If not, exits early.
    * - Creates a BufferSource, sets it to loop, connects it to the background GainNode, and starts playback.
    *
    * Notes:
    * - The background GainNode is used to control the volume of the background sound.
    * - The background sound is looped to ensure continuous playback during the game.
    * - This method does not log or throw errors if the buffer is missing; it simply returns.
    *
    * References:
    * - [MDN Web Docs: AudioContext.createBufferSource](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource)
    * - [MDN Web Docs: AudioNode.connect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect)
    * - [MDN Web Docs: AudioBufferSourceNode.loop](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop)
    *
    * @example
    * // Play the background sound
    * this.playBackgroundSound();
    */
    playBackgroundSound() {
        if (!this.buffers.background) return;
        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers.background;
        source.loop = true;
        source.connect(this.backgroundGain);
        source.start(0);
    }

    /**
     * Plays the ambient soundscape for the game.
     *
     * This method handles playback of the ambient sound by:
     * - Creating a BufferSource for the ambient audio.
     * - Looping the ambient sound for continuous playback.
     * - Connecting the BufferSource to the persistent ambient GainNode for volume control.
     *
     * Behaviour:
     * - Checks if the ambient audio buffer is loaded. If not, exits early.
     * - Creates a BufferSource, sets it to loop, connects it to the ambient GainNode, and starts playback.
     *
     * Notes:
     * - The ambient GainNode is used to control the volume of the ambient sound.
     * - The ambient sound is looped to ensure continuous playback during the game.
     * - This method does not log or throw errors if the buffer is missing; it simply returns.
     *
     * References:
     * - [MDN Web Docs: AudioContext.createBufferSource](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource)
     * - [MDN Web Docs: AudioNode.connect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect)
     * - [MDN Web Docs: AudioBufferSourceNode.loop](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop)
     *
     * @example
     * // Play the ambient soundscape
     * this.playAmbientSound();
     */
    playAmbientSound() {
        if (!this.buffers.ambient) return;
        const source = this.audioContext.createBufferSource();
        source.buffer = this.buffers.ambient;
        source.loop = true;
        source.connect(this.ambientGain);
        source.start(0);
    }

    /**
     * Lowers the ambient sound volume gradually over a specified duration.
     *
     * This method reduces the volume of the ambient sound to 0.1 over 2 seconds using a linear ramp.
     * If the game is globally muted, the volume is immediately set to 0 and no ramping occurs.
     *
     * Behaviour:
     * - Checks if the game is globally muted (`isMuted`). If muted, sets the volume to 0 immediately.
     * - Gradually lowers the volume to 0.1 over 2 seconds using `linearRampToValueAtTime` if not muted.
     *
     * Notes:
     * - The `linearRampToValueAtTime` method ensures a smooth transition in volume.
     * - This method is typically called during gameplay events that require reduced ambient sound (e.g., crystal sequence playback).
     *
     * References:
     * - [MDN Web Docs: AudioParam.linearRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/linearRampToValueAtTime)
     *
     * @example
     * // Lower the ambient volume during a sequence
     * this.lowerAmbientVolume();
     */
    lowerAmbientVolume() {
        if (this.isMuted) {
            this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            return;
        }
        this.ambientGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 2);
    }

    /**
     * Restores the ambient sound volume gradually over a specified duration.
     *
     * This method increases the volume of the ambient sound to the user's intended ambient volume (`userAmbientVolume`)
     * over 2 seconds using a linear ramp. If the game is globally muted (`isMuted`), the volume is immediately set to 0
     * and no ramping occurs.
     *
     * Behaviour:
     * - Checks if the game is globally muted (`isMuted`). If muted, sets the volume to 0 immediately.
     * - Gradually restores the volume to `userAmbientVolume` over 2 seconds using `linearRampToValueAtTime` if not muted.
     *
     * Notes:
     * - The `linearRampToValueAtTime` method ensures a smooth transition in volume.
     * - This method is called after gameplay events that required reduced ambient sound (e.g., crystal sequence playback).
     *
     * References:
     * - [MDN Web Docs: AudioParam.linearRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/linearRampToValueAtTime)
     *
     * @example
     * // Restore the ambient volume after a sequence
     * this.restoreAmbientVolume();
     */
    restoreAmbientVolume() {
        if (this.isMuted) {
            this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            return;
        }
        this.ambientGain.gain.linearRampToValueAtTime(this.userAmbientVolume, this.audioContext.currentTime + 2);
    }

    /**
     * Updates the gain (volume) of all audio channels based on mute and volume settings.
     *
     * This method synchronises the gain values for background, ambient, and effects channels
     * according to the global mute flag (`isMuted`), per-channel mute flags, and user-set volumes.
     * If global mute is active, all channels are silenced. Otherwise, each channel's gain is set to
     * zero if its mute flag is active, or to its user-set volume if not.
     *
     * Behaviour:
     * - Cancels any scheduled gain ramps before setting new values to prevent conflicts (e.g., from linear ramps).
     * - If `isMuted` is true, sets all channel gains to 0.
     * - If `isMuted` is false, sets each channel's gain to 0 if its mute flag is true, or to its user volume otherwise.
     *
     * Notes:
     * - Cancelling scheduled values ensures that mute actions are not overridden by previously scheduled ramps.
     * - This method is called automatically by the setters for mute and volume properties.
     * - Does not update the UI; only affects audio output.
     *
     * References:
     * - [MDN Web Docs: AudioParam.setValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setValueAtTime)
     *
     */
    updateMuteStates() {
            // Cancel any scheduled ramps before changing gain values
            this.backgroundGain.gain.cancelScheduledValues(this.audioContext.currentTime);
            this.ambientGain.gain.cancelScheduledValues(this.audioContext.currentTime);
            this.effectsGain.gain.cancelScheduledValues(this.audioContext.currentTime);
        // Global mute overrides all
        if (this.isMuted) {
            this.backgroundGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.ambientGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.effectsGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        } else {
            this.backgroundGain.gain.setValueAtTime(this.isBackgroundMuted ? 0 : this.userBackgroundVolume, this.audioContext.currentTime);
            this.ambientGain.gain.setValueAtTime(this.isAmbientMuted ? 0 : this.userAmbientVolume, this.audioContext.currentTime);
            this.effectsGain.gain.setValueAtTime(this.isEffectsMuted ? 0 : this.userEffectsVolume, this.audioContext.currentTime);
        }
    }
}

/**
 * Singleton instance of the AudioManager class for managing all game audio.
 *
 * Import and use this instance (`audioManager`) throughout the game to control audio playback,
 * loading, muting, and volume for all channels.
 *
 * @type {AudioManager}
 */
export const audioManager = new AudioManager();