class Texture {
    constructor(image64) {
        this.load(image64, (imageData) => {
            this.image = imageData;
        });
    }

    load(image64, callback) {
        var image = new Image();
        image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            callback(context.getImageData(0, 0, canvas.width, canvas.height));
        }
        image.src = image64;
    }

    get(x, y) {
        const color = this.image.data[((y * this.image.width + x) * 4)];
        return new color(color[0], color[1], color[2]);
    }
}