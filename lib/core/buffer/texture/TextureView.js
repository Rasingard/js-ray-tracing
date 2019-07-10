class TextureView {
    constructor(buffer) {
        const _view = new DataView(buffer);
        this.size = _view.getUint16(0);
        const _LODs = TextureView.LODStartBytes(this.size);
        const _minLOD = (_LODs.length -1);
        const viewWidth = self.RENDER_PROFILE ? self.RENDER_PROFILE.width : self.VIEWPORT.width;
        const LODLvl = 4 * ((1 / this.size) / (1 / ((viewWidth * 30) / CAMERA_FOV))); // 512 is 0,19 to view in full (width * 30) / FOV
        const maxDistance = _LODs.length * LODLvl;

        this.get = (deltaX, deltaY, distance) => {
            const relativeD = Math.min(Math.max(Math.floor(distance / LODLvl), 0), _minLOD);
            const _lodData = _LODs[relativeD];

            const x = Math.abs(Math.floor(deltaX % 1 * _lodData[1]));
            const y = Math.abs(Math.floor((1 - deltaY % 1) * _lodData[1]));
    
            const index = _lodData[0] + ((y * _lodData[1] + x) * 3);

            const color = new Color(
                _view.getUint8(index),
                _view.getUint8(index + 1),
                _view.getUint8(index + 2),
            );

            if(distance < maxDistance && relativeD > 0 && relativeD < _LODs.length) {
                const _deviationData = _LODs[relativeD - 1];

                const deviation = (distance % LODLvl) / LODLvl;
                const x = Math.abs(Math.floor(deltaX % 1 * _deviationData[1]));
                const y = Math.abs(Math.floor((1 - deltaY % 1) * _deviationData[1]));
                const indexD = _deviationData[0] + ((y * _deviationData[1] + x) * 3);

                color.blend(new Color(
                    _view.getUint8(indexD),
                    _view.getUint8(indexD + 1),
                    _view.getUint8(indexD + 2),
                ), 1 - deviation);
            }

            return color;
        }

        this.getBaseColor = () => {
            const length = _view.buffer.byteLength;

            return new Color(
                _view.getUint8(length -3),
                _view.getUint8(length -2),
                _view.getUint8(length -1),
            );
        };

        this.getBuffer = () => _view.buffer;
    }

    static baseColor(imageData) {
        const imageView = new Uint8ClampedArray(imageData, 2);

        let r = 0;
        let g = 0;
        let b = 0;
        let x = 0;

        for(let i = 0; i < imageView.length; i += 4) {
            r += imageView[i];
            g += imageView[i + 1];
            b += imageView[i + 2];
            x++;
        }

        return new Color(
            Math.round(r / x),
            Math.round(g / x),
            Math.round(b / x)
        );
    }

    static buildLOD(buffer) {
        const _startSize = (new DataView(buffer)).getUint16(0);
        const _bufferView = new DataView(buffer);
        const _newBuffer = new SharedArrayBuffer(this.LODBufferSize(_startSize) + 2);
        const _newBufferView = new DataView(_newBuffer);
        const _baseColor = this.baseColor(buffer);

        _newBufferView.setUint16(0, _startSize); // set image base Size

        let _localIndex = 2, _originIndex = 2;
        for(let i = 0, len = ((buffer.byteLength - 2) / 4); i < len; i++) { // copy start image to _newBuffer
            _newBufferView.setUint8(_localIndex,      _bufferView.getUint8(_originIndex));
            _newBufferView.setUint8(_localIndex + 1,  _bufferView.getUint8(_originIndex + 1));
            _newBufferView.setUint8(_localIndex + 2,  _bufferView.getUint8(_originIndex + 2));

            _localIndex += 3;
            _originIndex += 4;
        }
        
        let _startByte = _localIndex, // get last index from the copu process
            _lastImageStartByte = 2,
            _color,
            _index,
            _lastIndex,
            _lastSize = _startSize,
            _size = _startSize / 2,
            _startPixelColorTop,
            _startPixelColorDown,
            _colorDegradation = 1;

        while(_size > 1) {
            for(let i = 0, len = (_size * _size); i < len; i++) {
                _index = i * 3;
                _lastIndex = _index * 2;
                _colorDegradation /= 2;

                _startPixelColorTop = _lastImageStartByte + _lastIndex;
                _startPixelColorDown = _lastImageStartByte + _lastSize + _lastIndex;

                _color = this.sample4( // sample adjacent pixels, from last image "Size"
                    new Color( // pixel top left
                        _newBufferView.getUint8(_startPixelColorTop),
                        _newBufferView.getUint8(_startPixelColorTop + 1),
                        _newBufferView.getUint8(_startPixelColorTop + 2),
                    ),
                    new Color( // pixel top right
                        _newBufferView.getUint8(_startPixelColorTop + 3),
                        _newBufferView.getUint8(_startPixelColorTop + 4),
                        _newBufferView.getUint8(_startPixelColorTop + 5),
                    ),
                    new Color( // pixel bottom left
                        _newBufferView.getUint8(_startPixelColorDown),
                        _newBufferView.getUint8(_startPixelColorDown + 1),
                        _newBufferView.getUint8(_startPixelColorDown + 2),
                    ),
                    new Color( // pixel bottom right
                        _newBufferView.getUint8(_startPixelColorDown + 3),
                        _newBufferView.getUint8(_startPixelColorDown + 4),
                        _newBufferView.getUint8(_startPixelColorDown + 5),
                    ),
                );

                _color.blend(_baseColor, 1 - _colorDegradation);
                
                _newBufferView.setUint8(_startByte + _index,     _color.r);
                _newBufferView.setUint8(_startByte + _index + 1, _color.g);
                _newBufferView.setUint8(_startByte + _index + 2, _color.b);
            }

            _lastImageStartByte = _startByte;
            _startByte += (_size * _size * 3);
            _lastSize = _size;
            _size /= 2;
        }

        return _newBuffer;
    }

    static buildMipBuffer(buffer) {
        const _startSize = (new DataView(buffer)).getUint16(0);
        const _bufferView = new DataView(buffer);
        const _newBuffer = new SharedArrayBuffer(this.LODBufferSize(_startSize) + 2);
        const _newBufferView = new DataView(_newBuffer);

        _newBufferView.setUint16(0, _startSize); // set image base Size

        let 
        _localIndex = 2, 
        _originIndex = 2;

        for(let i = 0, len = ((buffer.byteLength - 2) / 4); i < len; i++) { // copy start image to _newBuffer
            _newBufferView.setUint8(_localIndex,      _bufferView.getUint8(_originIndex));
            _newBufferView.setUint8(_localIndex + 1,  _bufferView.getUint8(_originIndex + 1));
            _newBufferView.setUint8(_localIndex + 2,  _bufferView.getUint8(_originIndex + 2));

            _localIndex += 3;
            _originIndex += 4;
        }

        return _newBufferView;
    }

    static buildLODs(buffer) {
        const _startSize = (new DataView(buffer)).getUint16(0);
        const _newBufferView = this.buildMipBuffer(buffer);
        
        let _startByte = (((buffer.byteLength - 2) / 4) * 3), // get last index from the copy process
            _color,
            _index,
            _size = _startSize / 2,
            _rWidth = _startSize * 3,
            _x = 0,
            _y = 0;

        while(_size > 1) {
            for(let i = 0, len = (_size * _size); i < len; i++) {
                _index = i * 3;
                
                _y = Math.floor(i / _rWidth);
                _x = (i - (_y * _rWidth)) / 3;
                _color = this.sampleRegion(
                    _newBufferView,
                    _startSize,
                    _x,
                    _y,
                    _size
                );
                
                _newBufferView.setUint8(_startByte + _index,     _color.r);
                _newBufferView.setUint8(_startByte + _index + 1, _color.g);
                _newBufferView.setUint8(_startByte + _index + 2, _color.b);
            }

            _startByte += (_size * _size * 3);
            _size /= 2;
        }

        return _newBuffer;
    }

    static LODBufferSize(size) {
        let _bytesSize = 0;
        let _size = size;

        while(_size > 1) {
            _bytesSize += Math.pow(_size, 2);
            _size /= 2;
        }
        
        return (_bytesSize * 3);
    }

    static LODStartBytes(size) {
        let _size = size,
            _byteStart = 2;
        const _lodsData = [[_byteStart, _size]];

        while(_size > 1) {
            _size /= 2;
            _byteStart += (_size * _size * 3);
            _lodsData.push([_byteStart, _size]);
        }
        
        return _lodsData;
    }

    static sample4(color1, color2, color3, color4) {
        return new Color(
            Math.floor((color1.r + color2.r + color3.r + color4.r) / 4),
            Math.floor((color1.g + color2.g + color3.g + color4.g) / 4),
            Math.floor((color1.b + color2.b + color3.b + color4.b) / 4),
        );
    }

    static sampleRegion(view, width, x, y, size) {
        let
        index,
        countr = 0,
        countg = 0,
        countb = 0;

        for(let i = x, leni = x + size; i < leni; i++) {
            for(let j = y, lenj = y + size; j < lenj; j++) {
                index = ((j * width + i) * 3) + 2;
                countr += view.getUint8(index);
                countg += view.getUint8(index + 1);
                countb += view.getUint8(index + 2);
            }
        }

        return new Color(
            Math.round(countr / Math.pow(size, 2)),
            Math.round(countg / Math.pow(size, 2)),
            Math.round(countb / Math.pow(size, 2))
        );
    }
}