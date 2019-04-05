class Shader {
    constructor() {
    }

    
    static renderRayData(rayData, renderDistance) {
        return Shader.distancePass(
            rayData.getMap(),
            Shader.lightPass(
                rayData.getMap(),
                rayData.getTargetMaterial().color.get(),
                rayData.getRayNormalIntersect(),
            ),
            rayData.getTargetDistance(),
            32,
            renderDistance
        );

        return Shader.distancePass(
            rayData.getMap(),
            Shader.lightPass(
                rayData.getMap(),
                Shader.texturePass(
                    rayData.getMap(),
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
        if(targetDistance > max) return map.getAmbientLight().color.get();

        const perc = (targetDistance - min) / (max - min);
        return color.blend(map.getAmbientLight().color.get(), perc);
    }

    static lightPass(map, color, normal) {
        const lightMask = new Color(0,0,0);

        lightMask.blend(map.getAmbientLight().color.get(), map.getAmbientLight().getIntensity());

        const light = map.getGlobalLight();

        lightMask.blend(
            light.color.get(),
            (1 - (2 * light.direction.angleTo(normal)) / Math.PI) * light.getIntensity()
        ); 

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

    static texturePass(map, material, crossRelativeNormal, normal) {
        // if(!material.texture) return material.copyColor();

        if(normal.x != 0) { // x = z, y = y
            return map.getTexture(material.getTextureSides()).get(
                Math.abs(crossRelativeNormal.z),
                Math.abs(crossRelativeNormal.y),
            );
        }

        if(normal.z != 0) { // x = x, y = y
            return map.getTexture(material.getTextureSides()).get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(crossRelativeNormal.y),
            );
        }

        // x = x, y = z
        if(normal.y < 0) {
            return map.getTexture(material.getTextureTop()).get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(crossRelativeNormal.z),
            );
        }

        return map.getTexture(material.getTextureDown()).get(
            Math.abs(crossRelativeNormal.x),
            Math.abs(crossRelativeNormal.z),
        );
    }
}