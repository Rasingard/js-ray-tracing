class Viewport {
    constructor() {
        this.width = 400; // window.innerWidth;
        this.height = 300; // window.innerHeight;

        const _buffer = new SharedArrayBuffer(this.height * this.width * 4);
        const _renderBuffer = new ArrayBuffer(this.height * this.width * 4);
        this.getBuffer = () => _buffer;

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

        this.renderBuffer = () => {
            const array1 = (new Uint8ClampedArray(_buffer));
            const array2 = (new Uint8ClampedArray(_renderBuffer));
            
            for(let i = 0, len = array1.length; i < len; i++) {
                array2[i] = array1[i];
            }

            CONTEXT.putImageData(new ImageData(array2, this.width, this.height), 0, 0);
        };
    }
}