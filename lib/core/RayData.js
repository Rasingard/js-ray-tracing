class RayData {
    constructor(map, origin, direction, target, maxDistance, materialRef, sx, sy, sz, tx, ty, tz, dx, dy, dz, vx, vy, vz) {
        this.map = map;
        this.origin = origin;
        this.direction = direction;
        this.target = target;
        this.maxDistance = maxDistance;
        this.materialRef = materialRef;

        // boyndary direction
        this.sx = sx;
        this.sy = sy;
        this.sz = sz;

        // next boundary length
        this.tx = tx;
        this.ty = ty;
        this.tz = tz;

        // boundary step length
        this.dx = dx;
        this.dy = dy;
        this.dz = dz;

        // current boundary
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;


        this.getMap = () => map;
        this.getOrigin = () => origin;
        this.getDirection = () => direction;
        this.getTarget = () => target;
        this.getMaxDistance = () => maxDistance;
        this.getMaterialRef = () => materialRef;
        this.getSx = () => sx;
        this.getSy = () => sy;
        this.getSz = () => sz;
        this.getTx = () => tx;
        this.getTy = () => ty;
        this.getTz = () => tz;
        this.getDx = () => dx;
        this.getDx = () => dx;
        this.getDy = () => dy;
        this.getDz = () => dz;
        this.getVx = () => vx;
        this.getVy = () => vy;
        this.getVz = () => vz;

        this.getTargetMaterial = () => {
            const material = map.getMaterial(materialRef);
            this.getTargetMaterial = () => material;
            return material;
        };

        this.getRayIntersectionPoint = () => {
            let t = 0;

            if(vx) t = this.tx - dx;
            else if(vy) t = this.ty - dy;
            else t = this.tz - dz;

            const intersection = new Point(
                t * this.direction.x + this.origin.x,
                t * this.direction.y + this.origin.y,
                t * this.direction.z + this.origin.z,
            );

            this.getRayIntersectionPoint = () => intersection;
            return intersection;
        }

        this.getRayNormalIntersect = () => {            
            if(vx) return new Vector(sx, 0, 0);
            if(vy) return new Vector(0, sy, 0);
            const normal = new Vector(0, 0, sz);
            this.getRayNormalIntersect = () => normal;
            return normal;
        }

        this.getTargetDistance = () => {
            const distance = Point.distance(origin, this.getRayIntersectionPoint());
            this.getTargetDistance = () => distance;
            return distance;

            /*
            if(vx) {
                this.getTargetDistance = () => tx;
                return tx;
            };

            if(vy) {
                this.getTargetDistance = () => ty;
                return ty;
            };

            this.getTargetDistance = () => tz;
            return tz;
            */

            /*
            const distance = Point.distance(origin, target);
            this.getTargetDistance = () => distance;
            return distance;
            */
        };

        this.getNormalOrigin = () => {
            const t = this.getTarget();
            const ni = this.getRayNormalIntersect();
            const normalOrigin = new Point(
                t.x + !!ni.x,
                t.y + !!ni.y,
                t.z + !!ni.z
            );

            this.getNormalOrigin = () => normalOrigin;
            return normalOrigin;
        }

        this.getNormalRelativeIntersection = () => {
            const ri = this.getRayIntersectionPoint();
            const no = this.getNormalOrigin();
            const normalRelativeInterseption = new Point(
                ri.x - no.x,
                ri.y - no.y,
                ri.z - no.z
            );

            this.getNormalRelativeIntersection = () => normalRelativeInterseption;
            return normalRelativeInterseption;
        }

        this.getMaxDistance = () => maxDistance;

        this.getTarget = () => target;

        this.getMap = () => map;

        this.getOrigin = () => origin;

        this.getDirection = () => direction;

        this.next = () => map.reCast(this);
        this.reFract = () => map.reFract(this);
    }
}