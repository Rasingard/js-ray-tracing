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
        const URL = '/C:/Users/apereimo/Documents/Projects/js-ray-tracing/';
        importScripts(
            e.data + URL + 'init.js',
            e.data + URL + 'lib/core/Color.js',
            e.data + URL + 'lib/core/Point.js',
            e.data + URL + 'lib/core/SpaceObject.js',
            e.data + URL + 'lib/core/Vector.js',
            e.data + URL + 'lib/core/Quaternion.js',
            e.data + URL + 'lib/core/Line.js',
            e.data + URL + 'lib/core/Matrix.js',
            e.data + URL + 'lib/core/Map.js',
            e.data + URL + 'lib/core/Octree.js',
            e.data + URL + 'lib/core/Viewport.js',
            e.data + URL + 'lib/core/Material.js',
            e.data + URL + 'lib/core/Shader.js',
            e.data + URL + 'lib/core/Texture.js',
            e.data + URL + 'lib/core/RayData.js',
            e.data + URL + 'lib/core/Lights.js',
            e.data + URL + 'lib/core/Renderer.js',
            
            e.data + URL + 'lib/core/buffer/point/PointViewer.js',
            e.data + URL + 'lib/core/buffer/vector/VectorViewer.js',
            e.data + URL + 'lib/core/buffer/color/ColorViewer.js',
            e.data + URL + 'lib/core/buffer/texture/TextureView.js',
            e.data + URL + 'lib/core/buffer/texture/TextureListView.js',
            e.data + URL + 'lib/core/buffer/material/MaterialListView.js',
            e.data + URL + 'lib/core/buffer/material/MaterialViewer.js',
            e.data + URL + 'lib/core/buffer/CameraViewer.js',
            e.data + URL + 'lib/core/buffer/MapView.js',
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