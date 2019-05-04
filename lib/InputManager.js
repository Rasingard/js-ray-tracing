class InputManager {
    constructor() {
        const pressedKeys = {};

        const disableEvent = (e) => {
            if (e.stopPropagation) e.stopPropagation();
            else if (window.event) window.event.cancelBubble = true;
            
            e.preventDefault();
            return false;
        }

        window.addEventListener('keydown', (event) => {
            pressedKeys[event.key] = true;
            disableEvent(event);
        }, false);

        window.addEventListener('keyup', (event) => {
            pressedKeys[event.key] = false;
            disableEvent(event);
        }, false);

        window.addEventListener('mousedown', (event) => {
            pressedKeys[`mouse${event.button}`] = true;
            disableEvent(event);
        }, false);

        window.addEventListener('mouseup', (event) => {
            pressedKeys[`mouse${event.button}`] = false;
            disableEvent(event);
        }, false);

        window.addEventListener('wheel', (event) => {
            pressedKeys[`mouseWheelUp`] = event.deltaY > 0;
            pressedKeys[`mouseWheelDown`] = event.deltaY < 0;
        }, false);

        this.wheelRelease = () => {
            pressedKeys[`mouseWheelUp`] = false;
            pressedKeys[`mouseWheelDown`] = false;
        }
    
        this.keyPressed = (name) => {
            return !!pressedKeys[name];
        }
    }
}