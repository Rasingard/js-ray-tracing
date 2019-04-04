class CameraViewer {
    constructor(buffer, fov) {
        const _view = new DataView(buffer);
        // 257 bits
        this.location = new PointViewer(_view, 0);
        this.xAxis = new VectorViewer(_view, 24);
        this.yAxis = new VectorViewer(_view, 48);
        this.zAxis = new VectorViewer(_view, 72);
        
        this.getFieldOfView = () => dataView.getInt8(96);
    }

    rotate(quaternion) {
        // @TODO direct rotate buffer
        const x = this.xAxis.get();
        quaternion.rotateVector(x);
        this.xAxis.set(x);

        const y = this.yAxis.get();
        quaternion.rotateVector(y);
        this.yAxis.set(y);

        const z = this.zAxis.get();
        quaternion.rotateVector(z);
        this.zAxis.set(z);
    }

    changeBufferPixelColor(image, width, x, y, color) {
        const pixelIndex = (x + (y * width)) * 4;
        image[pixelIndex] = color.r;
        image[pixelIndex + 1] = color.g;
        image[pixelIndex + 2] = color.b;
        image[pixelIndex + 3] = 255;
    }

    renderToBuffer(buffer, map, height, width, fov, renderDistance, sx, sy) {
        const image = new Uint8ClampedArray(buffer);
        const pixelSpace = (width * 30) / fov;
        const scaleX = this.xAxis.get().div(pixelSpace);
        const scaleY = this.yAxis.get().div(pixelSpace);
        const fixX = (width % 2 === 0) ? scaleX.getCopy().div(2) : new Vector(0,0,0);
        const fixY = (width % 2 === 0) ? scaleY.getCopy().div(2) : new Vector(0,0,0);
        const centerX = width / 2;
        const centerY = height / 2;

        const centerPoint = new Point(
            this.zAxis.getX() + this.location.getX(),
            this.zAxis.getY() + this.location.getY(),
            this.zAxis.getZ() + this.location.getZ()
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
                this.location.get(),
                new Point(px, py, pz),
            ).normalize();
        }

        let v, rayData, vr = new Vector(0,1,0), gc = new Color(255, 255, 255);
        for (let y = 0; y < height / 2; y++) {
            for (let x = 0; x < width / 2; x++) {
                v = vectorTo((sx + (2*x)), (sy + (2*y)));
                rayData = map.rayTrace(this.location.get(), vectorTo((sx + (2*x)), (sy + (2*y))), renderDistance);

                if (rayData) this.changeBufferPixelColor(image, width, (sx + (2*x)), height - (sy + (2*y)), Shader.renderRayData(rayData, renderDistance));
                else { 
                    this.changeBufferPixelColor(
                        image,
                        width,
                        (sx + (2*x)),
                        height - (sy + (2*y)),
                        map.getAmbientLight().color.get().blend(
                            gc,
                            v.angleTo(vr) / Math.PI,
                        ),
                    );
                };
            }
        }

        return true;
    }
}