const RENDERER_WORKER = () => {
    const startRender = (e) => {
        self.CAMERA.renderToBuffer(
            self.RENDER_PROFILE.output,
            self.MAP,
            self.RENDER_PROFILE.height,
            self.RENDER_PROFILE.width,
            self.RENDER_PROFILE.zoom,
            self.RENDER_PROFILE.distance,
            self.RENDER_PROFILE.sx,
            self.RENDER_PROFILE.sy,
        );

        self.postMessage(true);
    }

    const startBuffers = (e) => {
        buildSpace3D(self, e.data);

        self.removeEventListener('message', startBuffers, false);
        self.addEventListener('message', startRender, false);
    }

    const loadWorker = (e) => {
        
        importScripts(
            e.data + 'init.js',
            e.data + 'lib/core/Color.js',
            e.data + 'lib/core/Point.js',
            e.data + 'lib/core/SpaceObject.js',
            e.data + 'lib/core/Vector.js',
            e.data + 'lib/core/Quaternion.js',
            e.data + 'lib/core/Line.js',
            e.data + 'lib/core/Matrix.js',
            e.data + 'lib/core/Map.js',
            e.data + 'lib/core/Octree.js',
            e.data + 'lib/core/Viewport.js',
            e.data + 'lib/core/Material.js',
            e.data + 'lib/core/Shader.js',
            e.data + 'lib/core/Texture.js',
            e.data + 'lib/core/RayData.js',
            e.data + 'lib/core/Lights.js',
            e.data + 'lib/core/Renderer.js',
            
            e.data + 'lib/core/buffer/point/PointViewer.js',
            e.data + 'lib/core/buffer/vector/VectorViewer.js',
            e.data + 'lib/core/buffer/color/ColorViewer.js',
            e.data + 'lib/core/buffer/texture/TextureView.js',
            e.data + 'lib/core/buffer/texture/TextureListView.js',
            e.data + 'lib/core/buffer/material/MaterialListView.js',
            e.data + 'lib/core/buffer/material/MaterialViewer.js',
            e.data + 'lib/core/buffer/CameraViewer.js',
            e.data + 'lib/core/buffer/MapView.js',
        );

        self.removeEventListener('message', loadWorker, false);
        self.addEventListener('message', startBuffers, false);
    };

    self.addEventListener('message', loadWorker, false);
}

const buildSpace3D = (mainScope, buffers) => {
    mainScope.MAP = new MapView(
        buffers.map.map,
        buffers.map.x,
        buffers.map.y,
        buffers.map.z,
        buffers.map.materials,
        buffers.map.textures,
        buffers.map.globalLight,
        buffers.map.ambientLight,
    );

    mainScope.CAMERA = new CameraViewer(
        buffers.camera.camera,
        buffers.camera.fov
    );

    mainScope.RENDER_PROFILE = {
        output: buffers.viewBuffer,
        height: buffers.height,
        width: buffers.width,
        zoom: buffers.zoom,
        distance: buffers.renderDistance,
        sx: buffers.sx,
        sy: buffers.sy,
    };
}

const BUILD_WORKER = (fn) => {
    return new Worker(
        window.URL.createObjectURL(
            new Blob(
                ['('+ fn.toString() +')()'],
                {type: "application/javascript"}
            )
        )
    );
}