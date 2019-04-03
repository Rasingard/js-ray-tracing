const RENDERER_WORKER = () => {
    let materialsListView;

    const startBuffers = (e) => {
        materialsListView = self.setMaterialListView(e.data.materials);
    }

    const loadWorker = (e) => {
        const URL = '/C:/Users/apereimo/Documents/Projects/js-ray-tracing/';
        importScripts(
            e.data + URL + 'lib/core/Color.js',
            e.data + URL + 'lib/core/buffer/BufferList.js',
            e.data + URL + 'lib/core/buffer/MaterialList.js',
        );

        self.removeEventListener('message', loadWorker, false);
        self.addEventListener('message', startBuffers, false);
    };

    self.addEventListener('message', loadWorker, false);
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