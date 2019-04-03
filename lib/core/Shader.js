class Shader {
    constructor() {
    }

    
    static renderRayData(rayData, renderDistance) {
        return Shader.distancePass(
            rayData.getMap(),
            Shader.lightPass(
                rayData.getMap(),
                Shader.texturePass(
                    rayData.getTargetMaterial(),
                    rayData.getNormalRelativeIntersection(),
                    rayData.getRayNormalIntersect(),
                    rayData.getTargetDistance(),
                ),
                rayData.getRayNormalIntersect(),
            ),
            rayData.getTargetDistance(),
            32,
            renderDistance
        );
    }

    static distancePass(map, color, targetDistance, min, max) {        
        if(targetDistance < min) return color;
        if(targetDistance > max) return map.getAmbientLight().color;

        const perc = (targetDistance - min) / (max - min);
        return color.blend(map.getAmbientLight().color, perc);
    }

    static lightPass(map, color, normal) {
        const lightMask = new Color(0,0,0);

        lightMask.blend(map.getAmbientLight().color, map.getAmbientLight().intensity);

        map.getGlobalLights().forEach(light => {
            lightMask.blend(
                light.color,
                (1 - (2 * light.direction.angleTo(normal)) / Math.PI) * light.intensity
            );
        });

        return color.multiply(lightMask, 1);
    }

    static shadowPass(color, map, rayIntersectionPoint, lightVector) {
        const p2 = rayIntersectionPoint.getCopy();
        p2.y += 1;
        if(map.rayTrace(p2, lightVector.getInverse(), 1000)) {
            return color.blend(new Color(0,0,0), 0.2);
        }

        return color;
    }

    static dynamicLightPass(color, map, rayIntersectionPoint, normal, lightVector) {
        let lightIntensity = AMBIENT_LIGHT;

        // check if its hit by light source
        if(!map.rayTrace(rayIntersectionPoint, lightVector.getInverse(), 1000)) {
            // if YES calculate how mutch light it gets and a minimum of the AMBIENT_LIGHT
            lightIntensity = Math.max(1 - 2 * (lightVector.angleTo(normal) / Math.PI), AMBIENT_LIGHT);
        }

        return color.getCopy().blend(new Color(0,0,0), lightIntensity);
    }

    static texturePass(material, crossRelativeNormal, normal, distance) {
        if(!material.texture) return material.copyColor();

        if(normal.x != 0) { // x = z, y = y
            return material.textureSides.get(
                Math.abs(crossRelativeNormal.z),
                Math.abs(crossRelativeNormal.y),
                distance,
            );
        }

        if(normal.z != 0) { // x = x, y = y
            return material.textureSides.get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(crossRelativeNormal.y),
                distance,
            );
        }

        // x = x, y = z
        if(normal.y < 0) {
            return material.textureTop.get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(crossRelativeNormal.z),
                distance,
            );
        }

        return material.textureDown.get(
            Math.abs(crossRelativeNormal.x),
            Math.abs(crossRelativeNormal.z),
            distance,
        );
    }
}