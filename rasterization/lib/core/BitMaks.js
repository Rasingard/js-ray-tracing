class BitMask {
    static getByteBit0(byte) { return byte & (1 << 0); }
    static getByteBit1(byte) { return byte & (1 << 1); }
    static getByteBit2(byte) { return byte & (1 << 2); }
    static getByteBit3(byte) { return byte & (1 << 3); }
    static getByteBit4(byte) { return byte & (1 << 4); }
    static getByteBit5(byte) { return byte & (1 << 5); }
    static getByteBit6(byte) { return byte & (1 << 6); }
    static getByteBit7(byte) { return byte & (1 << 7); }

    static setByteBit0(byte) { return byte |= (1 << 0); }
    static setByteBit1(byte) { return byte |= (1 << 1); }
    static setByteBit2(byte) { return byte |= (1 << 2); }
    static setByteBit3(byte) { return byte |= (1 << 3); }
    static setByteBit4(byte) { return byte |= (1 << 4); }
    static setByteBit5(byte) { return byte |= (1 << 5); }
    static setByteBit6(byte) { return byte |= (1 << 6); }
    static setByteBit7(byte) { return byte |= (1 << 7); }

    static clearByteBit0(byte) { return byte &= (1 << 0); }
    static clearByteBit1(byte) { return byte &= (1 << 1); }
    static clearByteBit2(byte) { return byte &= (1 << 2); }
    static clearByteBit3(byte) { return byte &= (1 << 3); }
    static clearByteBit4(byte) { return byte &= (1 << 4); }
    static clearByteBit5(byte) { return byte &= (1 << 5); }
    static clearByteBit6(byte) { return byte &= (1 << 6); }
    static clearByteBit7(byte) { return byte &= (1 << 7); }

    static toggleByteBit0(byte) { return byte ^= (1 << 0); }
    static toggleByteBit1(byte) { return byte ^= (1 << 1); }
    static toggleByteBit2(byte) { return byte ^= (1 << 2); }
    static toggleByteBit3(byte) { return byte ^= (1 << 3); }
    static toggleByteBit4(byte) { return byte ^= (1 << 4); }
    static toggleByteBit5(byte) { return byte ^= (1 << 5); }
    static toggleByteBit6(byte) { return byte ^= (1 << 6); }
    static toggleByteBit7(byte) { return byte ^= (1 << 7); }
}

class ByteMask {
    constructor(byte) {
        this.bit0 = ByteMask.get0(byte);
        this.bit1 = ByteMask.get1(byte);
        this.bit2 = ByteMask.get2(byte);
        this.bit3 = ByteMask.get3(byte);

        this.bit4 = ByteMask.get4(byte);
        this.bit5 = ByteMask.get5(byte);
        this.bit6 = ByteMask.get6(byte);
        this.bit7 = ByteMask.get7(byte);
    }

    // static get0(byte) { return byte & (1 << 0); }
    // static get1(byte) { return byte & (1 << 1); }
    // static get2(byte) { return byte & (1 << 2); }
    // static get3(byte) { return byte & (1 << 3); }
    // static get4(byte) { return byte & (1 << 4); }
    // static get5(byte) { return byte & (1 << 5); }
    // static get6(byte) { return byte & (1 << 6); }
    // static get7(byte) { return byte & (1 << 7); }

    static get0(byte) { return (byte>>0 & 1); }
    static get1(byte) { return (byte>>1 & 1); }
    static get2(byte) { return (byte>>2 & 1); }
    static get3(byte) { return (byte>>3 & 1); }
    static get4(byte) { return (byte>>4 & 1); }
    static get5(byte) { return (byte>>5 & 1); }
    static get6(byte) { return (byte>>6 & 1); }
    static get7(byte) { return (byte>>7 & 1); }

    static set0(byte) { return byte |= (1 << 0); }
    static set1(byte) { return byte |= (1 << 1); }
    static set2(byte) { return byte |= (1 << 2); }
    static set3(byte) { return byte |= (1 << 3); }
    static set4(byte) { return byte |= (1 << 4); }
    static set5(byte) { return byte |= (1 << 5); }
    static set6(byte) { return byte |= (1 << 6); }
    static set7(byte) { return byte |= (1 << 7); }

    static clear0(byte) { return byte &= (1 << 0); }
    static clear1(byte) { return byte &= (1 << 1); }
    static clear2(byte) { return byte &= (1 << 2); }
    static clear3(byte) { return byte &= (1 << 3); }
    static clear4(byte) { return byte &= (1 << 4); }
    static clear5(byte) { return byte &= (1 << 5); }
    static clear6(byte) { return byte &= (1 << 6); }
    static clear7(byte) { return byte &= (1 << 7); }

    static toggle0(byte) { return byte ^= (1 << 0); }
    static toggle1(byte) { return byte ^= (1 << 1); }
    static toggle2(byte) { return byte ^= (1 << 2); }
    static toggle3(byte) { return byte ^= (1 << 3); }
    static toggle4(byte) { return byte ^= (1 << 4); }
    static toggle5(byte) { return byte ^= (1 << 5); }
    static toggle6(byte) { return byte ^= (1 << 6); }
    static toggle7(byte) { return byte ^= (1 << 7); }
}