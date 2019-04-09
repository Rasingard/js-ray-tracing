class BufferStore {
    constructor() {
        _buffers = { };
        _storesViews = { };

        this.add = (name, bufferSize, interfacer) => {
            if(!_buffers[name]) {
                _buffers[name] = new SharedArrayBuffer(bufferSize);
                _storesViews[name] = interfacer(_buffers[name]);
                return _storesViews[name];
            }

            throw new Error(`Store with name: ${name} already added.`);
        }
        
        this.get = (name) => _storesViews[name];
        
        this.getBuffers = () => _buffers;
    }
}