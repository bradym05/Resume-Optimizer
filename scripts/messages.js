/* Message container */
var messageContainerElement = document.getElementById("message-container");

/**
 * Class representing base message
 */
export class Message {
    text;
    duration;
    autoDisplay;
    #timeoutId = -1;
    /**
     * @param {string} messageText - The message to display
     * @param {boolean} autoDisplay - Display message immediately
     * @param {number} duration - How long to display the message (in seconds)
     */
    constructor(messageText, autoDisplay=true, duration=10) {
        /* Set params */
        this.messageText = messageText;
        this.duration = duration;
        this.autoDisplay = autoDisplay
        /* Create message element */
        this.messageElement = document.createElement("div");
        this.messageElement.classList.add("message");
        this.messageElement.style.marginTop = "1%"
        /* Create close button */
        this.closeButton = document.createElement("div");
        this.closeButton.classList.add("close");
        this.closeButton.innerText = "X";
        /* Create text element */
        this.textElement = document.createElement("p");
        this.textElement.innerText = this.messageText;
        /* Parent elements */
        this.messageElement.appendChild(this.closeButton);
        this.messageElement.appendChild(this.textElement);
        /* Destroy if close button is clicked */
        this.closeButton.addEventListener("click", () => {this.#destroy();});
        /* Check autoDisplay setting, display if true */
        if (autoDisplay === true){
            this.display();
        }
    }

    #destroy() {
        /* Check if timeout is pending */
        if (this.#timeoutId > -1){
            clearTimeout(this.#timeoutId);
        }
        /* Destroy element */
        this.messageElement.remove();
    }

    /**
     * Display the message by appending it to the message container
     * Only use one time
     */
    display() {
        /* Make sure message is not already displayed */
        if (this.messageElement.parentElement !== messageContainerElement) {
            /* Display */
            messageContainerElement.appendChild(this.messageElement);
            /* Animate in */
            messageContainerElement.animate(
                {
                    "marginTop": ["-5%", "1%"]
                }, 
                {
                    "duration": 100,
                    "easing": "ease-out"
                })
            /* Destroy after set duration */
            this.#timeoutId = setTimeout(() => { this.#timeoutId = -1; this.#destroy(); }, this.duration * 1000);
        }
    }

}