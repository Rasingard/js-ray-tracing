class Viewport {
    constructor() {
        this.height = window.innerHeight;
        this.width = window.innerWidth;

        // RENDER SPACE 
        const CANVAS = document.createElement('canvas');
        CANVAS.height = this.height;
        CANVAS.width = this.width;
        CANVAS.style.position = 'absolute';
        CANVAS.style.top = '0px';
        CANVAS.style.left = '0px';
        document.body.appendChild(CANVAS);
        const CONTEXT = CANVAS.getContext('2d');

        this.updateView = (image) => {
            const tempCanvas = new OffscreenCanvas(image.width, image.height);

            const tempContext = tempCanvas.getContext('2d');
            tempContext.putImageData(image, 0, 0);
            tempContext.scale(this.width / image.width, this.height / image.height);
            
            CONTEXT.drawImage(tempCanvas, 0, 0, this.width, this.height);
        }

        this.addToView = (canvas, x, y, width, height) => {
            CONTEXT.drawImage(canvas, x, y, width || canvas.width, height || canvas.height);
        }

        const pointer = {x: 0, y: 0};

        CANVAS.addEventListener('mousemove', (e) => {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        }, false);

        this.getPointer = () => pointer;
        this.getPointerRelative = () => {
            return {
                x: pointer.x / this.width, 
                y: pointer.y / this.height,
            };
        };
    }
}