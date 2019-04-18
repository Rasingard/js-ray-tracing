class Viewport {
    constructor() {
        this.width = (window.innerWidth % 10 === 0) ? window.innerWidth : (Math.floor(window.innerWidth / 10) * 10);
        this.height = (window.innerHeight % 10 === 0) ? window.innerHeight : (Math.floor(window.innerHeight / 10) * 10);

        const _buffer = new SharedArrayBuffer(this.height * this.width * 4);
        (new Uint8ClampedArray(_buffer)).fill(255);
        const _renderBuffer = new ArrayBuffer(this.height * this.width * 4);
        (new Uint8ClampedArray(_renderBuffer)).fill(255);
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
            
            for(let i = 0, len = array1.length; i < len; i += 4) {
                array2[i] = array1[i];
                array2[i + 1] = array1[i + 1];
                array2[i + 2] = array1[i + 2];
            }

            //CONTEXT.putImageData(new ImageData(array2, this.width, this.height), 0, 0);
            this.updateView(new ImageData(array2, this.width, this.height));
        };
    }
}