class RayPath {
    constructor (
        shaderRef,
        passCount,
    ) {
        this.shaderRef = shaderRef;
        this.passCount = passCount;
    }
}

class Ray {
    constructor (
        map,
        shaderRef,
        originx, originy, originz,
        vectorx, vectory, vectorz,
        stepx, stepy, stepz,
        directionx, directiony, directionz,
        targetx, targety, targetz,
        nextx, nexty, nextz,
        maxx, maxy, maxz,
        movex, movey, movez
    ) {
        this.target = false;
        this.map = map;
        this.shaderRef = shaderRef;
        this.originx = originx;
        this.originy = originy;
        this.originz = originz;
        this.vectorx = vectorx;
        this.vectory = vectory;
        this.vectorz = vectorz;
        this.stepx = stepx;
        this.stepy = stepy;
        this.stepz = stepz;
        this.directionx = directionx;
        this.directiony = directiony;
        this.directionz = directionz;
        this.targetx = targetx;
        this.targety = targety;
        this.targetz = targetz;
        this.nextx = nextx;
        this.nexty = nexty;
        this.nextz = nextz;
        this.maxx = maxx;
        this.maxy = maxy;
        this.maxz = maxz;
        this.movex = movex;
        this.movey = movey;
        this.movez = movez;

        this.getVector = () => {
            return new Vector(this.vectorx, this.vectory, this.vectorz);
        }

        this.getLength = () => {
            if (this.movex) return this.nextx - this.stepx;
            else if (this.movey) return this.nexty - this.stepy;
            return this.nextz - this.stepz;
        }

        this.getOutBoundary = () => {
            if (this.movex) return this.nextx;
            else if (this.movey) return this.nexty;
            return this.nextz;
        }

        this.getNormal = () => {
            return new Vector(
                this.movex * -this.directionx,
                this.movey * -this.directiony,
                this.movez * -this.directionz
            );
        }

        this.getIntersection = (length) => {
            return new Point(
                (length * this.vectorx) + this.originx,
                (length * this.vectory) + this.originy,
                (length * this.vectorz) + this.originz
            )
        };

        this.getPreciseIntersection = () => {
            if (this.movex) {
                const length = this.nextx - this.stepx;
                return new Point(
                    Math.round((length * this.vectorx) + this.originx),
                    (length * this.vectory) + this.originy,
                    (length * this.vectorz) + this.originz
                )
            };
            
            if (this.movey) {
                const length = this.nexty - this.stepy;
                return new Point(
                    (length * this.vectorx) + this.originx,
                    Math.round((length * this.vectory) + this.originy),
                    (length * this.vectorz) + this.originz
                )
            };

            const length = this.nextz - this.stepz;
            return new Point(
                (length * this.vectorx) + this.originx,
                (length * this.vectory) + this.originy,
                Math.round((length * this.vectorz) + this.originz)
            );
        }

        this.getFaceVoxel = (normal) => {
            return new Point(
                this.targetx + normal.x,
                this.targety + normal.y,
                this.targetz + normal.z
            );
        }

        this.getMaterial = () => {
            return this.map.getMaterial(this.shaderRef);
        }

        this.next = () => this.map.recastRay(this);
    }
}

class RayData {
    constructor (
        map,
        origin,
        vector,
        maxDistance
    ) {
        this.target = false;
        this.map = map;
        this.shaderRef = 0;
        this.maxDistance = maxDistance;
        this.originx = origin.x;
        this.originy = origin.y;
        this.originz = origin.z;
        this.vectorx = vector.x;
        this.vectory = vector.y;
        this.vectorz = vector.z;
        this.stepx = (vector.x !== 0) ? Math.abs(1 / vector.x) : Number.MAX_VALUE;
        this.stepy = (vector.y !== 0) ? Math.abs(1 / vector.y) : Number.MAX_VALUE;
        this.stepz = (vector.z !== 0) ? Math.abs(1 / vector.z) : Number.MAX_VALUE;
        this.directionx = (vector.x < 0) ? -1 : 1;
        this.directiony = (vector.y < 0) ? -1 : 1;
        this.directionz = (vector.z < 0) ? -1 : 1;
        this.targetx = Math.floor(origin.x);
        this.targety = Math.floor(origin.y);
        this.targetz = Math.floor(origin.z);
        this.nextx = (vector.x !== 0) ? ((this.targetx + (this.directionx > 0 ? 1 : 0)) - origin.x) / vector.x : Number.MAX_VALUE;
        this.nexty = (vector.y !== 0) ? ((this.targety + (this.directiony > 0 ? 1 : 0)) - origin.y) / vector.y : Number.MAX_VALUE;
        this.nextz = (vector.z !== 0) ? ((this.targetz + (this.directionz > 0 ? 1 : 0)) - origin.z) / vector.z : Number.MAX_VALUE;
        this.maxx = (vector.x < 0) ? Math.max(0, this.targetx - maxDistance) : Math.min(map.getX(), maxDistance + this.targetx);
        this.maxy = (vector.y < 0) ? Math.max(0, this.targety - maxDistance) : Math.min(map.getY(), maxDistance + this.targety);
        this.maxz = (vector.z < 0) ? Math.max(0, this.targetz - maxDistance) : Math.min(map.getZ(), maxDistance + this.targetz);
        this.movex = (this.nextx <= this.nexty && this.nextx <= this.nextz);
        this.movey = (this.nexty <= this.nextx && this.nexty <= this.nextz);
        this.movez = (this.nextz <= this.nextx && this.nextz <= this.nexty);

        this.getVector = () => {
            return new Vector(this.vectorx, this.vectory, this.vectorz);
        }

        this.getLength = () => {
            if (this.movex) return this.nextx - this.stepx;
            else if (this.movey) return this.nexty - this.stepy;
            return this.nextz - this.stepz;
        }

        this.getOutBoundary = () => {
            if (this.movex) return this.nextx;
            else if (this.movey) return this.nexty;
            return this.nextz;
        }

        this.getNormal = () => {
            return new Vector(
                this.movex * -this.directionx,
                this.movey * -this.directiony,
                this.movez * -this.directionz
            );
        }

        this.getIntersection = (length) => {
            return new Point(
                (length * this.vectorx) + this.originx,
                (length * this.vectory) + this.originy,
                (length * this.vectorz) + this.originz
            )
        };

        this.getPreciseIntersection = () => {
            if (this.movex) {
                const length = this.nextx - this.stepx;
                return new Point(
                    Math.round((length * this.vectorx) + this.originx),
                    (length * this.vectory) + this.originy,
                    (length * this.vectorz) + this.originz
                )
            };
            
            if (this.movey) {
                const length = this.nexty - this.stepy;
                return new Point(
                    (length * this.vectorx) + this.originx,
                    Math.round((length * this.vectory) + this.originy),
                    (length * this.vectorz) + this.originz
                )
            };

            const length = this.nextz - this.stepz;
            return new Point(
                (length * this.vectorx) + this.originx,
                (length * this.vectory) + this.originy,
                Math.round((length * this.vectorz) + this.originz)
            );
        }

        this.getFaceVoxel = (normal) => {
            return new Point(
                this.targetx + normal.x,
                this.targety + normal.y,
                this.targetz + normal.z
            );
        }

        this.getMaterial = () => {
            return this.map.getMaterial(this.shaderRef);
        }

        this.next = () => this.map.recastRay(this);
    }

    nextBoundary() {
        this.movex = (this.nextx <= this.nexty && this.nextx <= this.nextz);
        this.movey = (this.nexty <= this.nextx && this.nexty <= this.nextz);
        this.movez = (this.nextz <= this.nextx && this.nextz <= this.nexty);

        this.nextx += this.movex * this.stepx;
        this.nexty += this.movey * this.stepy;
        this.nextz += this.movez * this.stepz;

        this.targetx += this.movex * this.directionx;
        this.targety += this.movey * this.directiony;
        this.targetz += this.movez * this.directionz;

        return this.shaderRef = this.map.getAt(this.targetx, this.targety, this.targetz);
    }

    getFaceTris() {
        const out =  {
            p: [
                this.targetx, this.targety, this.targetz, // p0 x0 y1  z2
                this.targetx, this.targety, this.targetz, // p1 x3 y4  z5
                this.targetx, this.targety, this.targetz, // p2 x6 y7  z8
                this.targetx, this.targety, this.targetz  // p3 x9 y10 z11
            ],
            t: [0, 1, 2, 3, 0, 2]
        };

        const normal = this.getNormal();

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
}