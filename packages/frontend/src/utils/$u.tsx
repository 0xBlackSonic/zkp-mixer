/* eslint-disable @typescript-eslint/no-explicit-any */
const utils = {
  BN256ToBin: (str: any) => {
    const r = BigInt(str).toString(2);
    const prePadding = "0".repeat(256 - r.length);

    return prePadding + r;
  },
  BNToDecimal: (bn: any) => {
    return bn.toString();
  },
  BN256ToHex: (n: any) => {
    let nstr = BigInt(n).toString(16);
    while (nstr.length < 64) {
      nstr = "0" + nstr;
    }
    nstr = `0x${nstr}`;
    return nstr;
  },
  reverseCoordinate: (p: any[]) => {
    const r = [0, 0];
    r[0] = p[1];
    r[1] = p[0];
    return r;
  },
};

export default utils;
