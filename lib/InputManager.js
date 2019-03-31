class InputManager {
    constructor() {
        const pressedKeys = {};

        window.addEventListener('keydown', (event) => {
            pressedKeys[event.key] = true;
        }, false);

        window.addEventListener('keyup', (event) => {
            pressedKeys[event.key] = false;
        }, false);
    
        this.keyPressed = (name) => {
            return !!pressedKeys[name];
        }
    }
}