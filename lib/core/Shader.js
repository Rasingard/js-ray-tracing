class Shader {
    constructor() {
    }
    
    static renderRayData(rayData) {
        const color = Shader.texturePass(
            rayData.getMap(),
            rayData.getTargetMaterial(),
            rayData.getNormalRelativeIntersection(),
            rayData.getRayNormalIntersect(),
            rayData.getTargetDistance(),
        );

        this.opacityPass(color, rayData);
        this.reflactionPass(color, rayData);
        this.dynamicLightPass(color, rayData);
        this.distancePass(color, rayData);

        return color;
    }

    static distancePass(color, rayData) {
        const targetDistance = rayData.getTargetDistance();
        if(targetDistance < 32) return;
        if(targetDistance > rayData.maxDistance) {
            color.set(rayData.map.getAmbientLight().color.get());
        } else {
            color.blend(
                rayData.map.getAmbientLight().color.get(), 
                (targetDistance - 32) / (rayData.maxDistance - 32)
            );
        }
    }

    static opacityPass(color, rayData) {
        const op = rayData.getTargetMaterial().getOpacity() / 255;
        if(!op) return;

        const nextRayData = rayData.next();
        if(!nextRayData) return;

        const distanceIn = rayData.target.distanceTo(nextRayData.target);
        if(distanceIn > 32) return;
            
        color.blend(nextRayData.getTargetMaterial().color.get(), op * (1 - (distanceIn / 32)));
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

    static reflactionPass(color, rayData) {
        const specularity = rayData.getTargetMaterial().getSpecular();
        if(!specularity) return;

        const target = rayData.reFract();
        if(target) color.blend(target.getTargetMaterial().color.get(), specularity / 255);
    }

    static dynamicLightPass(color, rayData) {
        const lightMask = new Color(0,0,0);
        const pOrigin = rayData.getRayIntersectionPoint();
        const rayDirection = rayData.map.getGlobalLight().direction.get().getInverse();

        if(rayData.getRayNormalIntersect().x) pOrigin.x += rayDirection.x / 10;
        else if(rayData.getRayNormalIntersect().y) pOrigin.y += rayDirection.y / 10;
        else pOrigin.z += rayDirection.z / 10;

        if(rayData.map.rayTrace(pOrigin, rayData.map.getGlobalLight().direction.get().getInverse(), RENDER_DISTANCE)) {
            lightMask.blend(rayData.map.getAmbientLight().color.get(), rayData.map.getAmbientLight().getIntensity());
            color.multiply(lightMask, 1);
        } else {
            lightMask.blend(rayData.map.getAmbientLight().color.get(), rayData.map.getAmbientLight().getIntensity());
            const light = rayData.map.getGlobalLight();
            lightMask.blend(
                light.color.get(),
                (1 - (2 * light.direction.angleTo(rayData.getRayNormalIntersect())) / Math.PI) * light.getIntensity()
            ); 
            color.multiply(lightMask, 1);
        }
    }

    static shadowPass(color, rayData) {
        const lightMask = new Color(0,0,0);
        const pOrigin = rayData.getRayIntersectionPoint();
        const rayDirection = rayData.map.getGlobalLight().direction.get().getInverse();

        if(rayData.getRayNormalIntersect().x) pOrigin.x += rayDirection.x / 10;
        else if(rayData.getRayNormalIntersect().y) pOrigin.y += rayDirection.y / 10;
        else pOrigin.z += rayDirection.z / 10;

        if(rayData.map.rayTrace(pOrigin, rayData.map.getGlobalLight().direction.get().getInverse(), RENDER_DISTANCE)) {
            lightMask.blend(rayData.map.getAmbientLight().color.get(), rayData.map.getAmbientLight().getIntensity());
            return color.multiply(lightMask, 1);
        }

        return color;
    }

    static texturePass(map, material, crossRelativeNormal, normal) {
        // if(!material.texture) return material.copyColor();

        if(normal.x != 0) { // x = z, y = y
            return map.getTexture(material.getTextureSides()).get(
                Math.abs(crossRelativeNormal.z),
                Math.abs(1 - crossRelativeNormal.y),
            );
        }

        if(normal.z != 0) { // x = x, y = y
            return map.getTexture(material.getTextureSides()).get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(1 - crossRelativeNormal.y),
            );
        }

        // x = x, y = z
        if(normal.y < 0) {
            return map.getTexture(material.getTextureTop()).get(
                Math.abs(crossRelativeNormal.x),
                Math.abs(1 - crossRelativeNormal.z),
            );
        }

        return map.getTexture(material.getTextureDown()).get(
            Math.abs(crossRelativeNormal.x),
            Math.abs(1 - crossRelativeNormal.z),
        );
    }
}

class shadding {
    constructor(color, rayData) {
        this.getColor = () => color;
    }
}