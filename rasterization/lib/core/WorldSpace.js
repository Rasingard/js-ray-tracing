class Chunck {
    constructor() {
        this.objects = new Array();
        this.voxels = new Uint8Array(CHUNCK_SIZE * CHUNCK_SIZE * CHUNCK_SIZE);
    }
}

class WorldSpace {
    constructor(sizex, sizey, sizez) {
        const _chuncksx = Math.ceil(sizex / CHUNCK_SIZE);
        const _chuncksy = Math.ceil(sizey / CHUNCK_SIZE);
        const _chuncksz = Math.ceil(sizez / CHUNCK_SIZE);
        const _chuncks = new Array(_chuncksx * _chuncksy * _chuncksz);

        let
        _currentChunk,
        _currentChunkIndex,
        _currentChunkx,
        _currentChunky,
        _currentChunkz;

        const _index = (x, y, z) => (z * sizex * sizey) + (y * sizex) + x;
        const _relativeIndex = (x, y, z) => (z * CHUNCK_SIZE * CHUNCK_SIZE) + (y * CHUNCK_SIZE) + x;
        const _chunckIndex = (x, y, z) => {
            _currentChunkx = Math.floor(x / CHUNCK_SIZE);
            _currentChunky = Math.floor(y / CHUNCK_SIZE);
            _currentChunkz = Math.floor(z / CHUNCK_SIZE);
            return (_currentChunkz * _chuncksx * _chuncksy) + (_currentChunky * _chuncksx) + _currentChunkx;
        }
        const _selectChunck = (x, y, z) => {
            _currentChunkIndex = _chunckIndex(x, y, z);
            return _currentChunk = _chuncks[_currentChunkIndex];
        }

        this.getChunckIndexAt = (p) => {
            return (Math.floor(p.z / CHUNCK_SIZE) * _chuncksx * _chuncksy) + (Math.floor(p.y / CHUNCK_SIZE) * _chuncksx) + Math.floor(p.x / CHUNCK_SIZE);
        }

        this.setAt = (x, y, z, val) => {
            _selectChunck(x, y, z);

            if(!_currentChunk) {
                _currentChunk = _chuncks[_currentChunkIndex] = new Chunck();
            }
                
            const _index = _relativeIndex(
                x - (_currentChunkx * CHUNCK_SIZE),
                y - (_currentChunky * CHUNCK_SIZE),
                z - (_currentChunkz * CHUNCK_SIZE)
            );

            _currentChunk.voxels[_index] = val;
        }
        
        this.getAt = (x, y, z) => {
            _selectChunck(x, y, z);

            if(!_currentChunk) return 0;

            const _index = _relativeIndex(
                x - (_currentChunkx * CHUNCK_SIZE),
                y - (_currentChunky * CHUNCK_SIZE),
                z - (_currentChunkz * CHUNCK_SIZE)
            );

            return _currentChunk.voxels[_index];
        }

        this.addObjectAt = (x, y, z, object) => {
           _selectChunck(x, y, z);
            if(_currentChunk) _currentChunk.objects.push(object);
            else _chuncks[_currentChunkIndex] = new Chunck();
        }

        this.getObjects = (x, y, z) => {
            _selectChunck(x, y, z);
            if(_currentChunk) return _currentChunk.objects;
            return new Array();
        }

        this.getVisibleObjects = (p) => {
            // _selectChunck(p.x, p.y, p.z);
            // if(_currentChunk) return _currentChunk.objects;
            // return new Array();

            const visibleObjects = new Array();

            _selectChunck(p.x + CHUNCK_SIZE, p.y + CHUNCK_SIZE, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y + CHUNCK_SIZE, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y + CHUNCK_SIZE, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y + CHUNCK_SIZE, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y + CHUNCK_SIZE, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y + CHUNCK_SIZE, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y + CHUNCK_SIZE, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y + CHUNCK_SIZE, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y + CHUNCK_SIZE, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y - CHUNCK_SIZE, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y - CHUNCK_SIZE, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x + CHUNCK_SIZE, p.y - CHUNCK_SIZE, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y - CHUNCK_SIZE, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y - CHUNCK_SIZE, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x - CHUNCK_SIZE, p.y - CHUNCK_SIZE, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y - CHUNCK_SIZE, p.z + CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y - CHUNCK_SIZE, p.z - CHUNCK_SIZE);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            _selectChunck(p.x, p.y - CHUNCK_SIZE, p.z);
            if(_currentChunk) Array.prototype.push.apply(visibleObjects, _currentChunk.objects);
            
            
            return visibleObjects;
        }
    }
}