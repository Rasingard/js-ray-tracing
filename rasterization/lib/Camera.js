class Camera extends SpaceObject {
    constructor(world, location, fieldOfView) {
        super(location);
        this.fieldOfView = fieldOfView;
        this.emptyMaterial = world.getMaterial(0);
    }

    changePixelColor(image, x, y, color) {
        const pixelIndex = (x + (y * image.width)) * 4;
        if(image.data[pixelIndex + 2] > color.b) return;
        image.data[pixelIndex] = color.r;
        image.data[pixelIndex + 1] = color.g;
        image.data[pixelIndex + 2] = color.b;
        image.data[pixelIndex + 3] = 255;
    }

    renderSpheric(map, height, width, fov) {        
        const image = new ImageData(width, height);
        const step = (fov || this.fieldOfView) / width;
        const xFix = (width % 2 === 0) ? 0 : (step / 2);
        const yFix = (height % 2 === 0) ? 0 : (step / 2);
        const centerX = width / 2;
        const centerY = height / 2;

        const vectorTo = (viewX, viewY) => {
            return (Quaternion.fromAxisAngle(this.axis.y, (((viewX - centerX) * step) + xFix)))
            .multiply(Quaternion.fromAxisAngle(this.axis.x, (((centerY - viewY) * step) + yFix)))
            .rotateVector(this.axis.z.getCopy());
        }

        let rayData;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                rayData = map.rayTrace(this.location, vectorTo(x, y));

                if (rayData) this.changePixelColor(image, x, y, rayData.getMaterial().render(map, SUN, this, rayData));
                else this.changePixelColor(image, x, y, this.emptyMaterial.render(map, SUN, this, rayData));
            }
        }

        return image;
    }

    screenToWorldSpace(xRelativeCenter, yRelativeCenter, fov) {
        return Matrix4
            .tranformation(this.axis.x, this.axis.y, this.axis.z, this.location)
            .transform3D(new Point(xRelativeCenter, yRelativeCenter, 90 / fov));
    }

    render(map, height, width, fov) {
        const image = new ImageData(width, height);
        const transformM4 = Matrix4.tranformation(this.axis.x, this.axis.y, this.axis.z, this.location);

        const centerX = width / 2;
        const centerY = height / 2;
        const pixelScale = 1 / (width > height ? width : height);
        const focalDistance = 90 / fov;

        let tx, ty, rayData;
        const vectorTo = (viewX, viewY) => {
            tx = (viewX - centerX) * pixelScale;
            ty = (viewY - centerY) * pixelScale;
            return Vector.fromPoints(this.location, transformM4.transform3D(new Point(tx, ty, focalDistance)));
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                rayData = map.rayTrace(this.location, vectorTo(x, y), RENDER_DISTANCE);

                if (rayData) this.changePixelColor(image, x, y, rayData.getMaterial().render(map, SUN, this, rayData));
                else this.changePixelColor(image, x, y, this.emptyMaterial.render(map, SUN, this, rayData));
            }
        }

        return image;
    }

    getFaceTris(x, y, z, normal) {
        const out =  {
            p: [
                x, y, z, // p0 x0 y1  z2
                x, y, z, // p1 x3 y4  z5
                x, y, z, // p2 x6 y7  z8
                x, y, z  // p3 x9 y10 z11
            ],
            t: [0, 1, 2, 3, 0, 2]
        };

        if(normal.x) {
            if(normal.x > 0) {
                //p0
                out.p[0] += 1;  // x
                out.p[2] += 1;  // z
                //p1
                out.p[3] += 1;  // x
                //p2
                out.p[6] += 1;  // x
                out.p[7] += 1;  // y
                //p3
                out.p[9] += 1;  // x
                out.p[10] += 1; // y
                out.p[11] += 1; // z
            } else {
                //p0
                //p1
                out.p[5] += 1;  // z
                //p2
                out.p[7] += 1;  // y
                out.p[8] += 1;  // z
                //p3
                out.p[10] += 1; // y
            }
        } else if(normal.y) {
            if(normal.y > 0) {
                //p0
                out.p[1] += 1;  // y
                out.p[2] += 1;  // z
                //p1
                out.p[3] += 1;  // x
                out.p[4] += 1;  // y
                out.p[5] += 1;  // z
                //p2
                out.p[6] += 1;  // x
                out.p[7] += 1;  // y
                //p3
                out.p[10] += 1; // y
            } else {
                //p0
                //p1
                out.p[3] += 1;  // x
                //p2
                out.p[6] += 1;  // x
                out.p[7] += 1;  // y
                //p3
                out.p[11] += 1; // z
            }
        } else {
            if(normal.z > 0) {
                //p0
                out.p[2] += 1;  // z
                //p1
                out.p[3] += 1;  // x
                out.p[5] += 1;  // z
                //p2
                out.p[6] += 1;  // x
                out.p[7] += 1;  // y
                out.p[8] += 1;  // z
                //p3
                out.p[10] += 1; // y
                out.p[11] += 1; // z
            } else {
                //p0
                out.p[0] += 1;  // x
                //p1
                //p2
                out.p[7] += 1;  // y
                //p3
                out.p[9] += 1;  // x
                out.p[10] += 1; // y
            }
        }

        return out;
    }

    drawLine(image, x0, y0, x1, y1, color) {
        let
        dx = Math.abs(x1 - x0),
        sx = x0 < x1 ? 1 : -1,
        dy = Math.abs(y1 - y0),
        sy = y0 < y1 ? 1 : -1,
        err = (dx > dy ? dx : -dy) / 2,
        e2 = err;

        while(true) {
            if(x0 >= 0 && x0 < image.width && y0 >= 0 && y0 < image.height) this.changePixelColor(image, x0, y0, color);
            if (x0 === x1 && y0 === y1) break;
            e2 = err;
            if (e2 > -dx) { err -= dy; x0 += sx; }
            if (e2 < dy) { err += dx; y0 += sy; }
        }
    }

    pointInsidePoly2d(a, b, c) {
        return ((c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x)) <= 0;
    }

    drawPoly(image, ax, ay, bx, by, cx, cy, color) {
        let v1, v2, v3,
        minx = Math.max(Math.round(Math.min(ax, bx, cx)), 0),
        maxx = Math.min(Math.round(Math.max(ax, bx, cx)), image.width),
        miny = Math.max(Math.round(Math.min(ay, by, cy)), 0),
        maxy = Math.min(Math.round(Math.max(ay, by, cy)), image.height);

        v1 = Vector2d.fromCoords(ax, ay, bx, by).normalize();
        v2 = Vector2d.fromCoords(bx, by, cx, cy).normalize();
        v3 = Vector2d.fromCoords(cx, cy, ax, ay).normalize();

        for(let x = minx; x < maxx; x++) {
            for(let y = miny; y < maxy; y++) {
                const pv1 = Vector2d.fromCoords(ax, ay, x + 0.5, y + 0.5).normalize();
                const pv2 = Vector2d.fromCoords(bx, by, x + 0.5, y + 0.5).normalize();
                const pv3 = Vector2d.fromCoords(cx, cy, x + 0.5, y + 0.5).normalize();
                
                if(
                    this.pointInsidePoly2d(v1, v2, pv1) &&
                    this.pointInsidePoly2d(v2, v3, pv2) &&
                    this.pointInsidePoly2d(v3, v1, pv3)
                ) this.changePixelColor(image, x, y, color);
            }   
        }
    }

    drawFace(image, transform, cex, cey, width, tris, normal) {
        let 
        ax, ay,
        bx, by,
        cx, cy,
        p1, p2, p3,
        p1i, p2i, p3i;
        
        for(let i = 0, len = tris.t.length; i < len; i += 3) {
            p1i = tris.t[i] * 3;
            p2i = tris.t[i + 1] * 3;
            p3i = tris.t[i + 2] * 3;

            p1 = new Point(tris.p[p1i], tris.p[p1i + 1], tris.p[p1i + 2]);
            transform.transform3D(p1);
            if(!(p1.z > 1)) continue;
            ax = cex + (p1.x * width) / p1.z;
            ay = cey + (p1.y * width) / p1.z;

            p2 = new Point(tris.p[p2i], tris.p[p2i + 1], tris.p[p2i + 2]);
            transform.transform3D(p2);
            if(!(p2.z > 1)) continue;
            bx = cex + (p2.x * width) / p2.z;
            by = cey + (p2.y * width) / p2.z;

            p3 = new Point(tris.p[p3i], tris.p[p3i + 1], tris.p[p3i + 2]);
            transform.transform3D(p3);
            if(!(p3.z > 1)) continue;
            cx = cex + (p3.x * width) / p3.z;
            cy = cey + (p3.y * width) / p3.z;

            const color = new Color(0, 0, 255)
                .blend(Color.black(), (p1.z + p2.z + p3.z / 3) / RENDER_DISTANCE);

            this.drawPoly(image, ax, ay, bx, by, cx, cy, color, p1.z, p2.z, p3.z);

            // this.drawLine(image, Math.round(ax), Math.round(ay), Math.round(bx), Math.round(by), color);
            // this.drawLine(image, Math.round(bx), Math.round(by), Math.round(cx), Math.round(cy), color);
            // this.drawLine(image, Math.round(cx), Math.round(cy), Math.round(ax), Math.round(ay), color);
        }
    }

    raster(map, height, width) {
        const image = new ImageData(width, height);
        const transform = Matrix4.invertTransformation(this.axis.x, this.axis.y, this.axis.z, this.location);
        const centerX = width / 2;
        const centerY = height / 2;

        const cx = Math.floor(this.location.x);
        const cy = Math.floor(this.location.y);
        const cz = Math.floor(this.location.z);

        let currentVoxel;
        for (let x = cx - RASTER_DISTANCE, lenx = cx + RASTER_DISTANCE; x < lenx; x++) {
            for (let y = cy - RASTER_DISTANCE, leny = cy + RASTER_DISTANCE; y < leny; y++) {
                for (let z = cz - RASTER_DISTANCE, lenz = cz + RASTER_DISTANCE; z < lenz; z++) {
                    currentVoxel = map.in(x, y, z) ? map.getAt(x, y, z) : null;

                    if(!currentVoxel) continue;
                    if(!map.getAt(x, y + 1, z) && this.location.y > y + 1) this.drawFace(image, transform, centerX, centerY, width, this.getFaceTris(x, y, z, new Vector(0,1,0)), new Vector(x, y - 1, z));
                    if(!map.getAt(x, y - 1, z) && this.location.y < y) this.drawFace(image, transform, centerX, centerY, width, this.getFaceTris(x, y, z, new Vector(0,-1,0)), new Vector(x, y - 1, z));
                    if(!map.getAt(x + 1, y, z) && this.location.x > x + 1) this.drawFace(image, transform, centerX, centerY, width, this.getFaceTris(x, y, z, new Vector(1,0,0)), new Vector(x, y - 1, z));
                    if(!map.getAt(x - 1, y, z) && this.location.x < x) this.drawFace(image, transform, centerX, centerY, width, this.getFaceTris(x, y, z, new Vector(-1,0,0)), new Vector(x, y - 1, z));
                    if(!map.getAt(x, y, z + 1) && this.location.z > z + 1) this.drawFace(image, transform, centerX, centerY, width, this.getFaceTris(x, y, z, new Vector(0,0,1)), new Vector(x, y - 1, z));
                    if(!map.getAt(x, y, z - 1) && this.location.z < z) this.drawFace(image, transform, centerX, centerY, width, this.getFaceTris(x, y, z, new Vector(0,0,-1)), new Vector(x, y - 1, z));
                }
            }
        }

        return image;
    }
}