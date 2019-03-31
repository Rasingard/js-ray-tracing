const RENDERER_WORKER = () => {
    const changePixelColor = (image, x, y, color) => {
        const pixelIndex = (x + (y * image.width)) * 4;
        image.data[pixelIndex] = color.r;
        image.data[pixelIndex + 1] = color.g;
        image.data[pixelIndex + 2] = color.b;
        image.data[pixelIndex + 3] = 255;
    }

    const renderData = (renderConfig) => {
        // render(map, height, width, fov, renderDistance) {}
        console.log(renderConfig);
        const image = new ImageData(renderConfig.width, renderConfig.height);
        const pixelSpace = (renderConfig.width * 30) / fov;
        const scaleX = renderConfig.camera.axis.x.getCopy().div(pixelSpace);
        const scaleY = renderConfig.camera.axis.y.getCopy().div(pixelSpace);
        const fixX = (renderConfig.width % 2 === 0) ? scaleX.getCopy().div(2) : new Vector(0,0,0);
        const fixY = (renderConfig.width % 2 === 0) ? scaleY.getCopy().div(2) : new Vector(0,0,0);
        const centerX = renderConfig.width / 2;
        const centerY = renderConfig.height / 2;

        const centerPoint = new Point(
            renderConfig.camera.axis.z.x + renderConfig.camera.location.x,
            renderConfig.camera.axis.z.y + renderConfig.camera.location.y,
            renderConfig.camera.axis.z.z + renderConfig.camera.location.z
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
                renderConfig.camera.location,
                new Point(px, py, pz),
            ).normalize();
        }

        let v, rayData, vr = new Vector(0,1,0), gc = new Color(255, 255, 255), gc2 = new Color(0, 0, 0);
        for (let y = 0; y < renderConfig.height; y++) {
            for (let x = 0; x < renderConfig.width; x++) {
                v = vectorTo(x, y);
                rayData = map.rayTrace(renderConfig.camera.location, vectorTo(x, y), renderConfig.renderDistance);

                if (rayData) changePixelColor(image, x, renderConfig.height - y, Shader.renderRayData(rayData, renderConfig.renderDistance, SUN));
                else { 
                    changePixelColor(
                        image,
                        x,
                        renderConfig.height - y,
                        ATMOSPHERE_COLOR.getCopy().blend(
                            gc,
                            v.angleTo(vr) / Math.PI,
                        ),
                    );
                };
            }
        }

        return image;
    }

    const loadMapData = (data) => {
        console.log('load map data');
        self.mapData = new Uint8Array(data[0]);
        self.renderHeight = data[1];
        self.renderWidth = data[2];
        self.renderZoom = data[3];
        self.renderDistance = data[4];

        self.removeEventListener('message', loadMapData, false);
        self.addEventListener('message', renderData, false);
    }
    
    self.addEventListener('message', loadMapData, false);
}

const BUILD_WORKER = (fn) => {
    let code = fn.toString();
        code = code.substring(
            code.indexOf("{") + 1,
            code.lastIndexOf("}")
        );

    return new Worker(
        URL.createObjectURL(
            new Blob(
                [code],
                {
                    type: "application/javascript"
                }
            )
        )
    );
}