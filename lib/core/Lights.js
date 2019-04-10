class LightSource {
    constructor(color, location, intensity, range) { }
}

class AmbientLight {
    constructor(color, intensity) {
        const _buffer = new SharedArrayBuffer(11);
        const _view = new DataView(_buffer);

        this.color = new ColorView(_view, 0);

        this.getIntensity = () => _view.getFloat64(3);
        this.setIntensity = (val) => _view.setFloat64(3, val);

        this.getBuffer = () => _buffer;

        // Start Values
        this.color.set((new Color(0,0,0)).blend(color, intensity));
        this.setIntensity(intensity);
    }
}

class AmbientLightView {
    constructor(buffer) {
        const _view = new DataView(buffer);
        this.color = new ColorViewer(_view, 0);
        this.getIntensity = () => _view.getFloat64(3);
    }
}

class GlobalLight {
    constructor(color, intensity, vector) {
        const _buffer = new SharedArrayBuffer(35);
        const _view = new DataView(_buffer);

        this.color = new ColorView(_view, 0);
        this.direction = new VectorView(_view, 11);

        this.getIntensity = () => _view.getFloat64(3);
        this.setIntensity = (val) => _view.setFloat64(3, val);

        this.getBuffer = () => _buffer;

        // Start Values
        this.color.set((new Color(0,0,0)).blend(color, intensity));
        this.setIntensity(intensity);
        this.direction.set(vector);
    }
}

class GlobalLightView {
    constructor(buffer) {
        const _view = new DataView(buffer);
        this.color = new ColorViewer(_view, 0);
        this.direction = new VectorViewer(_view, 11);
        this.getIntensity = () => _view.getFloat64(3);
    }
}