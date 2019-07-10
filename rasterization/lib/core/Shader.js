class Shader {
    constructor() {}

    static render(map, sun, camera, ray) {
        const color = ray.getMaterial().copyColor();
        const length = ray.getLength();
        const normal = ray.getNormal();

        const intersection = ray.getIntersection(length);
        /*
        if(length < SHADOW_RENDER_DISTANCE) {
            color.multiply(this.mergeLightsWithShadows(map, VISIBLE_OBJECTS, sun, intersection, normal));
        } else if(length < LIGHT_RENDER_DISTANCE) {
            color.multiply(this.mergeLights(VISIBLE_OBJECTS, sun, intersection, normal));
        }
        */

        if (length < LIGHT_RENDER_DISTANCE) color.multiply(this.mergeLights(VISIBLE_OBJECTS, sun, intersection, normal));
        this.distancePass(color, length);

        return color;
    }

    static distancePass(color, length) {
        if (length > FOG_MIN_DISTANCE) {
            if (length < RENDER_DISTANCE) {
                return color.blend(
                    FOG_COLOR,
                    (length - FOG_MIN_DISTANCE) / FOG_DISTANCE
                )
            }

            color.set(FOG_COLOR);
        };
    }

    static globalightPass(color, lightVector, normal) {
        color.multiplyAlpha(SUN_COLOR, this.globalLightIntensity(lightVector, normal));
    }

    static dynamicShadow(map, lightSource, range, intersection, normal) {
        const distance = lightSource.distanceTo(intersection);
        if (distance > range) return false;

        const originRay = intersection.getCopy();
        originRay.x += normal.x * 0.001;
        originRay.y += normal.y * 0.001;
        originRay.z += normal.z * 0.001;

        const lightVector = Vector.fromPoints(originRay, lightSource);
        const obstacle = map.rayTrace(originRay, lightVector, SHADOW_DISTANCE);
        if (obstacle) return true;
        return false;
    }

    static globalShadow(map, lightVector, intersection, normal) {
        const originRay = intersection.getCopy();
        originRay.x += normal.x * 0.001;
        originRay.y += normal.y * 0.001;
        originRay.z += normal.z * 0.001;

        const obstacle = map.rayTrace(originRay, lightVector.getInverse(), SHADOW_DISTANCE);
        if (obstacle) return true;
        return false;
    }

    static globalLightIntensity(lightVector, normal) {
        return 2 * (lightVector.angleTo(normal) / Math.PI);
    }

    static dynamicLightIntensity(lightSource, range, intersection, normal) {
        const distance = lightSource.distanceTo(intersection);

        if (distance > range) return 0;

        const lightVector = Vector.fromPoints(lightSource, intersection);
        return (2 * (lightVector.angleTo(normal) / Math.PI)) * (1 - (distance / range));
    }

    static globalLightIntensityWithShadow(map, lightVector, intersection, normal) {
        const originRay = intersection.getCopy();
        originRay.x += normal.x * 0.1;
        originRay.y += normal.y * 0.1;
        originRay.z += normal.z * 0.1;

        const obstacle = map.rayTrace(originRay, lightVector.getInverse(), SHADOW_DISTANCE);
        if (obstacle) return 0;
        return this.globalLightIntensity(lightVector, normal);
    }

    static dynamicLightIntensityWithShadow(map, lightSource, range, intersection, normal) {
        const distance = lightSource.distanceTo(intersection);
        if (distance > range) return 0;

        const originRay = intersection.getCopy();
        originRay.x += normal.x * 0.1;
        originRay.y += normal.y * 0.1;
        originRay.z += normal.z * 0.1;

        const rayVector = Vector.fromPoints(originRay, lightSource);
        const obstacle = map.rayTrace(originRay, rayVector, 32);
        if (obstacle) return 0;

        const lightVector = Vector.fromPoints(lightSource, intersection);
        return (2 * (lightVector.angleTo(normal) / Math.PI)) * (1 - (distance / range));
    }

    static mergeLightsWithShadows(map, lightsList, lightVector, intersection, normal) {
        const sunIntensity = this.globalLightIntensityWithShadow(map, lightVector, intersection, normal);

        let intensityr = SUN_COLOR.r * sunIntensity;
        let intensityg = SUN_COLOR.g * sunIntensity;
        let intensityb = SUN_COLOR.b * sunIntensity;

        let currentr = 0;
        let currentg = 0;
        let currentb = 0;

        const _eachLight = (light) => {
            const intensity = this.dynamicLightIntensityWithShadow(map, light.position, light.range, intersection, normal);

            if (!intensity) return;

            currentr = light.color.r * intensity;
            currentg = light.color.g * intensity;
            currentb = light.color.b * intensity;

            if (currentr > intensityr) intensityr = currentr;
            if (currentg > intensityg) intensityg = currentg;
            if (currentb > intensityb) intensityb = currentb;
        }

        lightsList.forEach(_eachLight);

        return new Color(
            Math.round(intensityr),
            Math.round(intensityg),
            Math.round(intensityb)
        );
    }

    static mergeLights(lightsList, lightVector, intersection, normal) {
        const sunIntensity = this.globalLightIntensity(lightVector, normal);

        let intensityr = SUN_COLOR.r * sunIntensity;
        let intensityg = SUN_COLOR.g * sunIntensity;
        let intensityb = SUN_COLOR.b * sunIntensity;

        let currentr = 0;
        let currentg = 0;
        let currentb = 0;

        const _eachLight = (light) => {
            const intensity = this.dynamicLightIntensity(light.position, light.range, intersection, normal);

            currentr = light.color.r * intensity;
            currentg = light.color.g * intensity;
            currentb = light.color.b * intensity;

            if (currentr > intensityr) intensityr = currentr;
            if (currentg > intensityg) intensityg = currentg;
            if (currentb > intensityb) intensityb = currentb;
        }

        lightsList.forEach(_eachLight);

        return new Color(
            Math.round(intensityr),
            Math.round(intensityg),
            Math.round(intensityb)
        );
    }
}