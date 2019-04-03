class BufferList {
    constructor(itemSize, maxLength) {
        let _length = 0;
        const _firstItemByte = (index) => (2 + (index * itemSize));
        const _buffer = new SharedArrayBuffer(2 + (maxLength * itemSize));
        const _lengthView = new DataView(_buffer, 0, 1);

        (new DataView(_buffer, 1, 1)).setUint8(0, itemSize);
        _lengthView.setUint8(0, 0);      

        
        this.getLength = () => _lengthView.getUint8(0, 0);
        this.setLength = (val) => _lengthView.setUint8(0, val);

        this.getBuffer = () => _buffer;

        this.add = () => {
            if(_length === maxLength) throw new Error('BufferList: MAX buffer length.'); // @TODO
            this.setLength(_length += 1);
            return this.get(_length - 1);
        }

        this.get = (index) => {
            return new DataView(_buffer, _firstItemByte(index), itemSize);
        }
    }
}

class BufferView {
    constructor(_buffer) {
        let _length = (new DataView(_buffer, 0, 1)).getUint8(0);
        const _itemSize = (new DataView(_buffer, 1, 1)).getUint8(0);

        const _firstItemByte = (index) => (2 + index * _itemSize);
        this.get = (index) => {
            return new DataView(_buffer, _firstItemByte(index), _itemSize);
        }
    }
}