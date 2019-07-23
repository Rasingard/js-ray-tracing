class Viewport {
    constructor() {
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.pixelScale = 1 / (this.width > this.height ? this.width : this.height);

        // RENDER SPACE 
        const CANVAS = document.createElement('canvas');
        CANVAS.height = this.height;
        CANVAS.width = this.width;
        CANVAS.style.position = 'absolute';
        CANVAS.style.top = '0px';
        CANVAS.style.left = '0px';
        document.body.appendChild(CANVAS);
        const CONTEXT = CANVAS.getContext('2d');

        window.onresize = () => {
            this.height = window.innerHeight;
            this.width = window.innerWidth;
            this.pixelScale = 1 / (this.width > this.height ? this.width : this.height);

            CANVAS.height = this.height;
            CANVAS.width = this.width;
        }

        this.updateView = (image, camera, tris) => {
            if(tris.p.length > 0) this.drawTris(image, camera, tris);
            const tempCanvas = new OffscreenCanvas(image.width, image.height);
            const tempContext = tempCanvas.getContext('2d');
            tempContext.putImageData(image, 0, 0);
            tempContext.scale(this.width / image.width, this.height / image.height);
            
            CONTEXT.clearRect(0, 0, this.width, this.height);
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

        this.getPointXFromCenter = () => (pointer.x - (this.width / 2)) * this.pixelScale;
        this.getPointYFromCenter = () => (pointer.y - (this.height / 2)) * this.pixelScale;
    }

    changePixelColor(image, x, y, color) {
        const pixelIndex = (x + (y * image.width)) * 4;
        if(image.data[pixelIndex + 2] > color.b) return;
        image.data[pixelIndex] = color.r;
        image.data[pixelIndex + 1] = color.g;
        image.data[pixelIndex + 2] = color.b;
        image.data[pixelIndex + 3] = 255;
    }

    // setPixelColor(image, x, y, color) {
    //     const pixelIndex = (x + (y * image.width)) * 4;
    //     image.data[pixelIndex] = color.r;
    //     image.data[pixelIndex + 1] = color.g;
    //     image.data[pixelIndex + 2] = color.b;
    //     image.data[pixelIndex + 3] = 255;
    // }

    pointInsidePoly2d(a, b, c) {
        return ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) <= 0;
    }

    // drawLine(image, x0, y0, x1, y1) {
    //     let
    //     dx = Math.abs(x1 - x0),
    //     sx = x0 < x1 ? 1 : -1,
    //     dy = Math.abs(y1 - y0),
    //     sy = y0 < y1 ? 1 : -1,
    //     err = (dx > dy ? dx : -dy) / 2,
    //     e2 = err;

    //     while(true) {
    //         if(x0 >= 0 && x0 < image.width && y0 >= 0 && y0 < image.height) this.setPixelColor(image, x0, y0, new Color(0, 255, 0));
    //         if (x0 === x1 && y0 === y1) break;
    //         e2 = err;
    //         if (e2 > -dx) { err -= dy; x0 += sx; }
    //         if (e2 < dy) { err += dx; y0 += sy; }
    //     }
    // }

    // drawPoly(image, ax, ay, az, bx, by, bz, cx, cy, cz) {
    //     let v1, v2, v3,
    //     minx = Math.max(Math.round(Math.min(ax, bx, cx)), 0),
    //     maxx = Math.min(Math.round(Math.max(ax, bx, cx)), image.width),
    //     miny = Math.max(Math.round(Math.min(ay, by, cy)), 0),
    //     maxy = Math.min(Math.round(Math.max(ay, by, cy)), image.height);

    //     v1 = Vector2d.fromCoords(ax, ay, bx, by).normalize();
    //     v2 = Vector2d.fromCoords(bx, by, cx, cy).normalize();
    //     v3 = Vector2d.fromCoords(cx, cy, ax, ay).normalize();

    //     const color = new Color(0, 0, 255).blend(Color.black(), (az + bz + cz / 3) / RENDER_DISTANCE);

    //     for(let x = minx; x < maxx; x++) {
    //         for(let y = miny; y < maxy; y++) {
    //             const pv1 = Vector2d.fromCoords(ax, ay, x + 0.5, y + 0.5).normalize();
    //             const pv2 = Vector2d.fromCoords(bx, by, x + 0.5, y + 0.5).normalize();
    //             const pv3 = Vector2d.fromCoords(cx, cy, x + 0.5, y + 0.5).normalize();
                
    //             if(
    //                 this.pointInsidePoly2d(v1, v2, pv1) &&
    //                 this.pointInsidePoly2d(v2, v3, pv2) &&
    //                 this.pointInsidePoly2d(v3, v1, pv3)
    //             ) { this.changePixelColor(image, x, y, color) };
    //         }   
    //     }
    // }

    drawPoly(image, p1, p2, p3, color) {
        let v1, v2, v3,
        minx = Math.max(Math.round(Math.min(p1.x, p2.x, p3.x)), 0),
        maxx = Math.min(Math.round(Math.max(p1.x, p2.x, p3.x)), image.width),
        miny = Math.max(Math.round(Math.min(p1.y, p2.y, p3.y)), 0),
        maxy = Math.min(Math.round(Math.max(p1.y, p2.y, p3.y)), image.height);

        v1 = Vector2d.fromCoords(p1.x, p1.y, p2.x, p2.y).normalize();
        v2 = Vector2d.fromCoords(p2.x, p2.y, p3.x, p3.y).normalize();
        v3 = Vector2d.fromCoords(p3.x, p3.y, p1.x, p1.y).normalize();

        p1.color = color.getCopy().blend(Color.black(), p1.z / RENDER_DISTANCE);
        p2.color = color.getCopy().blend(Color.black(), p2.z / RENDER_DISTANCE);
        p3.color = color.getCopy().blend(Color.black(), p3.z / RENDER_DISTANCE);

        for(let x = minx; x < maxx; x++) {
            for(let y = miny; y < maxy; y++) {
                const pv1 = Vector2d.fromCoords(p1.x, p1.y, x + 0.5, y + 0.5).normalize();
                const pv2 = Vector2d.fromCoords(p2.x, p2.y, x + 0.5, y + 0.5).normalize();
                const pv3 = Vector2d.fromCoords(p3.x, p3.y, x + 0.5, y + 0.5).normalize();
                
                if(
                    this.pointInsidePoly2d(v1, v2, pv1) &&
                    this.pointInsidePoly2d(v2, v3, pv2) &&
                    this.pointInsidePoly2d(v3, v1, pv3)
                ) { this.changePixelColor(image, x, y, this.baricentricBlend(x, y, p1, p2, p3)) };
            }   
        }
    }

    // toCameraSpace(camera, points) {
    //     const transform = Matrix4.invertTransformation(camera.axis.x, camera.axis.y, camera.axis.z, camera.location);
        
    //     for(let i = 0, len = points.length; i < len; i += 3) {
    //         const currentPoint = new Point(
    //             points[i],
    //             points[i + 1],
    //             points[i + 2]
    //         );
    //         transform.transform3D(currentPoint);
    //         points[i]     = currentPoint.x;
    //         points[i + 1] = currentPoint.y;
    //         points[i + 2] = currentPoint.z;
    //     }
    // }

    // toRasterSpace(image, points, polys, width, height) {
    //     const cex = width / 2;
    //     const cey = height / 2;

    //     let p1, p2, p3,
    //         ax, ay, az,
    //         bx, by, bz,
    //         cx, cy, cz;
            
    //     for(let i = 0, len = polys.length; i < len; i += 3) {
    //         p1 = polys[i] * 3;
    //         az = points[p1 + 2];
    //         if(az < 1) continue;
    //         ax = cex + (points[p1] * width) / az;
    //         ay = cey + (points[p1 + 1] * width) / az;
            
    //         p2 = polys[i + 1] * 3;
    //         bz = points[p2 + 2];
    //         if(bz < 1) continue;
    //         bx = cex + (points[p2] * width) / bz;
    //         by = cey + (points[p2 + 1] * width) / bz;
            
    //         p3 = polys[i + 2] * 3;
    //         cz = points[p3 + 2];
    //         if(cz < 1) continue;
    //         cx = cex + (points[p3] * width) / cz;
    //         cy = cey + (points[p3 + 1] * width) / cz;

    //         //this.drawPoly(image, ax, ay, az, bx, by, bz, cx, cy, cz);

    //         this.drawLine(image, Math.round(ax), Math.round(ay), Math.round(bx), Math.round(by));
    //         this.drawLine(image, Math.round(bx), Math.round(by), Math.round(cx), Math.round(cy));
    //         this.drawLine(image, Math.round(cx), Math.round(cy), Math.round(ax), Math.round(ay));
    //     }
    // }

    baricentricBlend(x, y, p1, p2, p3) {
        const dy23 = p2.y - p3.y;
        const dx32 = p3.x - p2.x;
        const dx13 = p1.x - p3.x;
        const dy31 = p3.y - p1.y;
        const dy13 = p1.y - p3.y;

        const b = (dy23 * dx13) + (dx32 * dy13);
        const bx = x - p3.x;
        const by = y - p3.y;
        const w1 = ((dy23 * bx) + (dx32 * by)) / b;
        const w2 = ((dy31 * bx) + (dx13 * by)) / b;
        const w3 = 1 - w1 - w2;

        return new Color(
            w1 * p1.color.r + w2 * p2.color.r + w3 * p3.color.r,
            w1 * p1.color.g + w2 * p2.color.g + w3 * p3.color.g,
            w1 * p1.color.b + w2 * p2.color.b + w3 * p3.color.b,
        );
    }

    polyFill(image, p1, p2, p3, color) {
        p1.color = new Color(0, 0, 255).blend(Color.black(), p1.z / RENDER_DISTANCE);
        p2.color = new Color(0, 0, 255).blend(Color.black(), p2.z / RENDER_DISTANCE);
        p3.color = new Color(0, 0, 255).blend(Color.black(), p3.z / RENDER_DISTANCE);

        if(p1.y > p2.y) {
            const t = p1;
            p1 = p2;
            p2 = t
        }

        if(p1.y > p3.y) {
            const t = p1;
            p1 = p3;
            p3 = t
        }

        if(p2.y > p3.y) {
            const t = p2;
            p2 = p3;
            p3 = t
        }

        let m, m2;
        const vr = p2.y - p1.y;
        m = (p3.x - p1.x) / (p3.y - p1.y);
        const p4 = new Point((vr * m) + p1.x, p2.y, 0);
        const p2r = Math.round(p2.y);
        

        if(p2.x < p4.x) {
            m = vr / (p2.x - p1.x);
            m2 = vr / (p4.x - p1.x);

            for(let 
                y = Math.max(Math.round(p1.y), 0),
                len = Math.min(p2r, image.height); 
                y < len;
                y++
            ){
                for(
                    let 
                    x = Math.max(Math.round(((y - p2.y) / m) + p2.x), 0), 
                    len = Math.min(Math.round(((y - p2.y) / m2) + p4.x), image.width);
                    x < len;
                    x++
                ) {
                    this.changePixelColor(image, x, y, this.baricentricBlend(x, y, p1, p2, p3));
                }
            }

            m = (p3.y - p2.y) / (p3.x - p2.x);
            m2 = (p3.y - p2.y) / (p3.x - p4.x);

            for(
                let 
                y = Math.max(p2r, 0),
                len = Math.min(p3.y, image.height); 
                y < len;
                y++
            ){
                for(
                    let 
                    x = Math.max(Math.round(((y - p2.y) / m) + p2.x), 0), 
                    len = Math.min(Math.round(((y - p2.y) / m2) + p4.x), image.width);
                    x < len;
                    x++
                ) {
                    this.changePixelColor(image, x, y, this.baricentricBlend(x, y, p1, p2, p3));
                }
            }
        } else {
            m = vr / (p2.x - p1.x);
            m2 = vr / (p4.x - p1.x);

            for(let 
                y = Math.max(Math.round(p1.y), 0),
                len = Math.min(p2r, image.height); 
                y < len;
                y++
            ){
                for(
                    let 
                    x = Math.max(Math.round(((y - p2.y) / m2) + p4.x), 0), 
                    len = Math.min(Math.round(((y - p2.y) / m) + p2.x), image.width);
                    x < len;
                    x++
                ) {
                    this.changePixelColor(image, x, y, this.baricentricBlend(x, y, p1, p2, p3));
                }
            }

            m = (p3.y - p2.y) / (p3.x - p2.x);
            m2 = (p3.y - p2.y) / (p3.x - p4.x);

            for(
                let 
                y = Math.max(p2r, 0),
                len = Math.min(p3.y, image.height); 
                y < len;
                y++
            ){
                for(
                    let 
                    x = Math.max(Math.round(((y - p2.y) / m2) + p4.x), 0), 
                    len = Math.min(Math.round(((y - p2.y) / m) + p2.x), image.width);
                    x < len;
                    x++
                ) {
                    this.changePixelColor(image, x, y, this.baricentricBlend(x, y, p1, p2, p3));
                }
            }
        }
    }

    filterOcclusion(map, camera, points, polys) {
        const notOccluded = new Uint32Array(30000);
        let count = 0;

        for(let i = 0, len = polys.length; i < len; i += 3) {
            if(
                map.occluded(camera.location, new Point(points[(polys[i] * 3)],     points[(polys[i] * 3) + 1],     points[(polys[i] * 3) + 2]))        &&
                map.occluded(camera.location, new Point(points[(polys[i + 1] * 3)], points[(polys[i + 1] * 3) + 1], points[(polys[i + 1] * 3) + 2]))    &&
                map.occluded(camera.location, new Point(points[(polys[i + 2] * 3)], points[(polys[i + 2] * 3) + 1], points[(polys[i + 2] * 3) + 2]))
            ) continue;

            notOccluded[count++] = polys[i];
            notOccluded[count++] = polys[i + 1];
            notOccluded[count++] = polys[i + 2];
        }

        return notOccluded.slice(0, count);
    }

    renderPoly(image, p1, p2, p3, matrix, color) {
        matrix.transform3D(p1);
        matrix.transform3D(p2);
        matrix.transform3D(p3);

        if(p1.z < 1 || p2.z < 1 || p3.z < 1) return;

        const w2 = (image.width / 2);
        const h2 = (image.height / 2);

        p1.x = w2 + (p1.x * image.width) / p1.z;
        p1.y = h2 + (p1.y * image.width) / p1.z;

        p2.x = w2 + (p2.x * image.width) / p2.z;
        p2.y = h2 + (p2.y * image.width) / p2.z;

        p3.x = w2 + (p3.x * image.width) / p3.z;
        p3.y = h2 + (p3.y * image.width) / p3.z;

        this.polyFill(image, p1, p2, p3, color);
        // this.drawPoly(image, p1, p2, p3, color);

        // this.drawLine(image, Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y));
        // this.drawLine(image, Math.round(p2.x), Math.round(p2.y), Math.round(p3.x), Math.round(p3.y));
        // this.drawLine(image, Math.round(p3.x), Math.round(p3.y), Math.round(p1.x), Math.round(p1.y));
    }

    // renderPoly2(image, p1, p2, p3, matrix) {
    //     matrix.transform3D(p1);
    //     matrix.transform3D(p2);
    //     matrix.transform3D(p3);

    //     if(p1.z < 1 || p2.z < 1 || p3.z < 1) return;

    //     const w2 = (image.width / 2);
    //     const h2 = (image.height / 2);

    //     const ax = w2 + (p1.x * image.width) / p1.z;
    //     const ay = h2 + (p1.y * image.width) / p1.z;

    //     const bx = w2 + (p2.x * image.width) / p2.z;
    //     const by = h2 + (p2.y * image.width) / p2.z;

    //     const cx = w2 + (p3.x * image.width) / p3.z;
    //     const cy = h2 + (p3.y * image.width) / p3.z;

    //     const color = new Color(0, 0, 255).blend(Color.black(), (p1.z + p2.z + p3.z / 3) / RENDER_DISTANCE);

    //     this.drawPoly(image, ax, ay, p1.z, bx, by, p2.z, cx, cy, p3.z);

    //     // this.drawLine(image, Math.round(ax), Math.round(ay), Math.round(bx), Math.round(by));
    //     // this.drawLine(image, Math.round(bx), Math.round(by), Math.round(cx), Math.round(cy));
    //     // this.drawLine(image, Math.round(cx), Math.round(cy), Math.round(ax), Math.round(ay));
    // }

    // raster2(map, camera, points, polys, width, height) {
    //     const image = new ImageData(width, height);
    //     // const newPolys = this.filterOcclusion(map, camera, points, polys);
    //     this.toCameraSpace(camera, points);
    //     this.toRasterSpace(image, points, polys, width, height);
    //     this.updateView(image, camera, {p: []});
    // }

    raster(map, camera, points, polys, width, height) {
        const image = new ImageData(width, height);
        const matrix = Matrix4.invertTransformation(camera.axis.x, camera.axis.y, camera.axis.z, camera.location);
        const color = new Color(0, 0, 255);

        let p1, p2, p3, p1i, p2i, p3i;
        for(let i = 0, len = polys.length; i < len; i += 3) {
            p1i = polys[i] * 3;
            p2i = polys[i + 1] * 3;
            p3i = polys[i + 2] * 3;

            p1 = new Point(points[p1i], points[p1i + 1], points[p1i + 2]);
            p2 = new Point(points[p2i], points[p2i + 1], points[p2i + 2]);
            p3 = new Point(points[p3i], points[p3i + 1], points[p3i + 2]);

            if(
                map.occluded(camera.location, p1) &&
                map.occluded(camera.location, p2) &&
                map.occluded(camera.location, p3)
            ) continue;

            this.renderPoly(image, p1, p2, p3, matrix, color);
        }

        this.updateView(image, camera, {p: []});
    }
}