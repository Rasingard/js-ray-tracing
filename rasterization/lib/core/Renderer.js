const RENDERER_WORKER = () => {
    self.addEventListener('message', function(e) {
        console.log('Worker', e.data);
        self.postMessage(e.data + '- workDone!');
    }, false);
}

const BUILD_WORKER = (fn) => {
    let code = fn.toString();
        code = code.substring(
            code.indexOf("{") + 1,
            code.lastIndexOf("}")
        );

    return new Worker(
        URL.createObjectURL(
            new Blob(
                [code],
                {
                    type: "application/javascript"
                }
            )
        )
    );
}