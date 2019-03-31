class Texture {
    constructor(imageData) {
        this.streamData = new Array();
        this.streamData.push(imageData);

        let count = 0;
        do {
            let newImage = this.resize(this.streamData[count]);
            count++;
            this.streamData.push(newImage);
        } while(count < 4);
    }

    get(xperc, yperc, distance) {
        let imgr;

        if(distance > 2) {
            imgr = this.streamData[1];
        } else if (distance > 4) {
            imgr = this.streamData[2];
        } else if (distance > 8) {
            imgr = this.streamData[3];
        } else {
            imgr = this.streamData[0];
        }

        const x = Math.floor(imgr.width * xperc);
        const y = Math.floor(imgr.height * yperc);

        const index = ((y * imgr.width + x) * 4);
        return new Color(
            imgr.data[index],
            imgr.data[index + 1],
            imgr.data[index + 2]
        );
    }

    resize(imageData) { 
        const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
        const tempContext = tempCanvas.getContext('2d');
        tempContext.putImageData(imageData, 0, 0);
        tempContext.scale(0.5, 0.5);
        return tempContext.getImageData(0, 0, Math.floor(tempCanvas.width / 2), Math.floor(tempCanvas.height / 2));
    }
}