class Camera extends SpaceObject {
    constructor(location, fieldOfView) {
        super(location);
        this.fieldOfView = fieldOfView;
    }

    changePixelColor(image, x, y, color) {
        const pixelIndex = (x + (y * image.width)) * 4;
        image.data[pixelIndex] = color.r;
        image.data[pixelIndex + 1] = color.g;
        image.data[pixelIndex + 2] = color.b;
        image.data[pixelIndex + 3] = 255;
    }

    // Flat render
    render(map, height, width, fov, renderDistance) {
        const image = new ImageData(width, height);
        const pixelSpace = (width * 30) / fov;
        const scaleX = this.axis.x.getCopy().div(pixelSpace);
        const scaleY = this.axis.y.getCopy().div(pixelSpace);
        const fixX = (width % 2 === 0) ? scaleX.getCopy().div(2) : new Vector(0,0,0);
        const fixY = (width % 2 === 0) ? scaleY.getCopy().div(2) : new Vector(0,0,0);
        const centerX = width / 2;
        const centerY = height / 2;

        const centerPoint = new Point(
            this.axis.z.x + this.location.x,
            this.axis.z.y + this.location.y,
            this.axis.z.z + this.location.z
        );

        let cx, cy, px, py, pz;

        const vectorTo = (viewX, viewY) => {
            cx = (viewX - centerX);
            cy = (viewY - centerY);

            px = centerPoint.x;
            py = centerPoint.y;
            pz = centerPoint.z;
            
            px += cx * scaleX.x + fixX.x;
            py += cx * scaleX.y + fixX.y;
            pz += cx * scaleX.z + fixX.z;

            px += cy * scaleY.x + fixY.x;
            py += cy * scaleY.y + fixY.y;
            pz += cy * scaleY.z + fixY.z;

            return Vector.fromPoints(
                this.location,
                new Point(px, py, pz),
            ).normalize();
        }

        let v, rayData, vr = new Vector(0,1,0), gc = new Color(255, 255, 255), gc2 = new Color(0, 0, 0);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                v = vectorTo(x, y);
                rayData = map.rayTrace(this.location, vectorTo(x, y), renderDistance);

                if (rayData) this.changePixelColor(image, x, height - y, Shader.renderRayData(rayData, renderDistance));
                else { 
                    this.changePixelColor(
                        image,
                        x,
                        height - y,
                        map.getAmbientLight().getColor().blend(
                            gc,
                            v.angleTo(vr) / Math.PI,
                        ),
                    );
                };
            }
        }

        return image;
    }
    
    // Vector render eye fish like
    render2(map, height, width, fov, renderDistance) {
        const image = new ImageData(width, height);
        const step = (fov || this.fieldOfView) / width;
        const xFix = (width % 2 === 0) ? 0 : (step / 2);
        const yFix = (height % 2 === 0) ? 0 : (step / 2);
        const centerX = width / 2;
        const centerY = height / 2;

        const vectorTo = (viewX, viewY) => {
            return (Quaternion.fromAxisAngle(this.axis.y, (((viewX - centerX) * step) + xFix)))
            .multiply(Quaternion.fromAxisAngle(this.axis.x, (((viewY - centerY) * step) + yFix)))
            .rotateVector(this.axis.z.getCopy());
        }

        let targetShader;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                targetShader = map.rayTrace(this.location, vectorTo(x, y), renderDistance);

                if (targetShader) this.changePixelColor(image, x, y, targetShader.render(map, SUN));
                else this.changePixelColor(image, x, y, ATMOSPHERE_COLOR);
            }
        }

        return image;
    }

    // renderVectorMap
    renderVectorMap(map, height, width, fov, renderDistance) {
        const image = new ImageData(width, height);
        const step = (fov || this.fieldOfView) / width;
        const xFix = (width % 2 === 0) ? 0 : (step / 2);
        const yFix = (height % 2 === 0) ? 0 : (step / 2);
        const centerX = width / 2;
        const centerY = height / 2;

        const vectorTo = (viewX, viewY) => {
            return (Quaternion.fromAxisAngle(this.axis.y, (((viewX - centerX) * step) + xFix)))
            .multiply(Quaternion.fromAxisAngle(this.axis.x, (((viewY - centerY) * step) + yFix)))
            .rotateVector(this.axis.z.getCopy());
        }

        let targetShader;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const v = vectorTo(x, y);
                this.changePixelColor(image, x, y, new Color(
                    v.x * 255,
                    v.y * 255,
                    v.z * 255,
                ));
            }
        }

        return image;
    }
}