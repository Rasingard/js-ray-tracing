class CameraViewer {
    constructor(buffer, fov, sky) {
        const _view = new DataView(buffer);
        // 257 bits
        this.location = new PointViewer(_view, 0);
        this.xAxis = new VectorViewer(_view, 24);
        this.yAxis = new VectorViewer(_view, 48);
        this.zAxis = new VectorViewer(_view, 72);
        
        this.getFieldOfView = () => dataView.getInt8(96);

        const _skyview = new DataView(sky);
        this.skyHeight = _skyview.getUint16(0);
        this.skyH2 = this.skyHeight / 2;
        this.skyWidth = _skyview.getUint16(2);
        this.skyW2 = this.skyWidth / 2;
        this.skyData = new Uint8ClampedArray(sky, 4);

        this.lastLocation = this.location.get();
        this.lastRotation = this.zAxis.get();
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
   
    changeBufferPixelColor(image, i, color) {
        image[i] = color.r;
        image[i + 1] = color.g;
        image[i + 2] = color.b;
    }

    renderRay(i, image, v, rayData, simpleRender) {
        let sh, sw, skySI = 0, skyColor = new Color(0,0,0);

        if (rayData) {
            this.changeBufferPixelColor(image, i, Shader.renderRayData(rayData, this.skyData, this.skyHeight, this.skyWidth, simpleRender));
        } else if (!simpleRender) {
            sh = Math.ceil(this.skyH2 + (-v.y * this.skyH2));
            sw = Math.round((Math.atan2(v.x, v.z) / (2 * Math.PI)) * this.skyWidth);
            skySI = (sw + (sh * this.skyWidth)) * 3;
            // (x + (y * width)) * 3
            skyColor.r = this.skyData[skySI];
            skyColor.g = this.skyData[skySI + 1];
            skyColor.b = this.skyData[skySI + 2];

            this.changeBufferPixelColor(
                image,
                i,
                skyColor,
            );
        } else {
            this.changeBufferPixelColor(
                image,
                i,
                new Color(132, 235, 255),
            );
        }
    }

    renderToBuffer(buffer, map, height, width, fov, renderDistance, sx, sy) {
        const image = new Uint8ClampedArray(buffer);
        const pixelSpace = (width * 30) / fov;
        let scaleX = this.xAxis.get().div(pixelSpace);
        let scaleY = this.yAxis.get().div(pixelSpace);
        let fixX = (width % 2 === 0) ? scaleX.getCopy().div(2) : new Vector(0,0,0);
        let fixY = (width % 2 === 0) ? scaleY.getCopy().div(2) : new Vector(0,0,0);
        const centerX = width / 2;
        const centerY = height / 2;

        const centerPoint = new Point(
            this.zAxis.getX() + this.location.getX(),
            this.zAxis.getY() + this.location.getY(),
            this.zAxis.getZ() + this.location.getZ()
        );

        const rw = (width * 4);
        let x, y, cx, cy, px, py, pz;

        const vectorTo = (i) => {
            y = Math.floor(i / rw);
            x = (i - (y * rw)) / 4;
            cx = (x - centerX);
            cy = -(y - centerY);

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

        let skip = sx + (sy * 2), v, rayData;

        /*
        const loc = this.location.get();
        const rot = this.zAxis.get();
        let simpleRender = true;
        if(
            this.lastLocation.equals(loc) && 
            this.lastRotation.equals(rot)
        ) {
            simpleRender = false;
        }
        this.lastLocation = loc;
        this.lastRotation = rot;
        */ let simpleRender = false;

        const flowsCount = (height * width) / 400;
        for(let f = 0; f < flowsCount; f++) {

            scaleX = this.xAxis.get().div(pixelSpace);
            scaleY = this.yAxis.get().div(pixelSpace);
            fixX = (width % 2 === 0) ? scaleX.getCopy().div(2) : new Vector(0,0,0);
            fixY = (width % 2 === 0) ? scaleY.getCopy().div(2) : new Vector(0,0,0);
            centerPoint.x = this.zAxis.getX() + this.location.getX();
            centerPoint.y = this.zAxis.getY() + this.location.getY();
            centerPoint.z = this.zAxis.getZ() + this.location.getZ();

            const step = (16 * flowsCount);
            for(let i = (skip * 4) + (16 * f), len = image.length; i < len; i += step) {
                v = vectorTo(i);
                rayData = map.rayTrace(this.location.get(), v, renderDistance);
                this.renderRay(i, image, v, rayData, simpleRender);
            }
        }

        return true;
    }
}