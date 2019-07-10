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

        this.getCanvas = () => CANVAS;

        this.updateView = (image) => {
            const tempCanvas = new OffscreenCanvas(image.width, image.height);

            // Light blur
            // const tc = new OffscreenCanvas(image.width, image.height);
            // const tx = tc.getContext('2d');
            // tx.putImageData(image, 0, 0);
            // tx.scale(0.10, 0.10);
            // let imgD = tx.getImageData(0, 0, image.width, image.height);
            // const basec = new Color(0, 0, 0);
            // Image2D.eachImageData(
            //     imgD,
            //     (c) => { if(c.luminosity() < 210) c.set(basec); }
            // );
            // boxBlur(imgD, 5, 3);
            // tx.putImageData(imgD, 0, 0);
            // tx.scale(10, 10);
            // imgD = tx.getImageData(0, 0, image.width, image.height);
            // //

            // const tempContext = tempCanvas.getContext('2d');
            // tempContext.putImageData(
            //     Image2D.blendImageDatas(image, imgD, (c1, c2) => {
            //         return c1.add(c2, 0.5);
            //     }), 
            //     0, 
            //     0
            // );
            
            const tempContext = tempCanvas.getContext('2d');
            tempContext.putImageData(image, 0, 0);
            CONTEXT.drawImage(tempCanvas, 0, 0, this.width, this.height);
        }

        this.addToView = (canvas, x, y, width, height) => {
            CONTEXT.drawImage(canvas, x, y, width || canvas.width, height || canvas.height);
        }

        this.pointer = {x: 0, y: 0};

        CANVAS.addEventListener('mousemove', (e) => {
            const rect = CANVAS.getBoundingClientRect();
            this.pointer.x = e.clientX - rect.left;
            this.pointer.y = e.clientY - rect.top;
        }, false);

        this.getPointer = () => this.pointer;
        this.getPointerRelative = () => {
            return {
                x: this.pointer.x / this.width, 
                y: this.pointer.y / this.height,
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