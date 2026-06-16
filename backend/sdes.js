const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
const P8 = [6, 3, 7, 4, 8, 5, 10, 9];
const IP = [2, 6, 3, 1, 4, 8, 5, 7];
const IPI = [4, 1, 3, 5, 7, 2, 8, 6];
const EP = [4, 1, 2, 3, 2, 3, 4, 1];
const P4 = [2, 4, 3, 1];

const S0 = [
  [1, 0, 3, 2],
  [3, 2, 1, 0],
  [0, 2, 1, 3],
  [3, 1, 3, 2],
];

const S1 = [
  [0, 1, 2, 3],
  [2, 0, 1, 3],
  [3, 0, 1, 0],
  [2, 1, 0, 3],
];

const permute = (bits, table) => table.map((position) => bits[position - 1]);

const xorBits = (a, b) => a.map((bit, index) => bit ^ b[index]);

const leftShift = (bits, shift) => [
  ...bits.slice(shift),
  ...bits.slice(0, shift),
];

const bitsToString = (bits) => bits.join("");

const bitsToNumber = (bits) => parseInt(bits.join(""), 2);

const numberToBits = (num, length) =>
  num.toString(2).padStart(length, "0").split("").map(Number);

function generateKeys(keyString) {
  const key = keyString.split("").map(Number);

  const p10 = permute(key, P10);

  const left = p10.slice(0, 5);
  const right = p10.slice(5);

  const ls1Left = leftShift(left, 1);
  const ls1Right = leftShift(right, 1);
  const ls1 = [...ls1Left, ...ls1Right];

  const k1 = permute(ls1, P8);

  const ls3Left = leftShift(ls1Left, 2);
  const ls3Right = leftShift(ls1Right, 2);
  const ls3 = [...ls3Left, ...ls3Right];

  const k2 = permute(ls3, P8);

  return {
    key,
    p10,
    left,
    right,
    ls1Left,
    ls1Right,
    ls1,
    k1,
    ls3Left,
    ls3Right,
    ls3,
    k2,
  };
}

function sBoxLookup(bits, sbox) {
  const row = bitsToNumber([bits[0], bits[3]]);
  const col = bitsToNumber([bits[1], bits[2]]);
  const value = sbox[row][col];

  return {
    row,
    col,
    value,
    output: numberToBits(value, 2),
  };
}

function fFunction(rightBits, keyBits) {
  const ep = permute(rightBits, EP);
  const xorResult = xorBits(ep, keyBits);

  const left4 = xorResult.slice(0, 4);
  const right4 = xorResult.slice(4);

  const s0 = sBoxLookup(left4, S0);
  const s1 = sBoxLookup(right4, S1);

  const sboxOutput = [...s0.output, ...s1.output];
  const p4 = permute(sboxOutput, P4);

  return {
    ep,
    xorResult,
    left4,
    right4,
    s0,
    s1,
    sboxOutput,
    p4,
  };
}

function runSDES(textString, keyString, mode) {
  const keys = generateKeys(keyString);

  const roundKey1 = mode === "enc" ? keys.k1 : keys.k2;
  const roundKey2 = mode === "enc" ? keys.k2 : keys.k1;

  const inputBits = textString.split("").map(Number);

  const ip = permute(inputBits, IP);
  const l0 = ip.slice(0, 4);
  const r0 = ip.slice(4);

  const f1 = fFunction(r0, roundKey1);
  const fk1Left = xorBits(l0, f1.p4);
  const fk1Right = r0;

  const l1 = fk1Right;
  const r1 = fk1Left;

  const f2 = fFunction(r1, roundKey2);
  const fk2Left = xorBits(l1, f2.p4);
  const fk2Right = r1;

  const preoutput = [...fk2Left, ...fk2Right];
  const output = permute(preoutput, IPI);

  return {
    mode,
    result: bitsToString(output),
    keyGeneration: {
      key: bitsToString(keys.key),
      p10: bitsToString(keys.p10),
      left: bitsToString(keys.left),
      right: bitsToString(keys.right),
      ls1: bitsToString(keys.ls1),
      k1: bitsToString(keys.k1),
      ls3: bitsToString(keys.ls3),
      k2: bitsToString(keys.k2),
    },
    initialPermutation: {
      input: bitsToString(inputBits),
      ip: bitsToString(ip),
      l0: bitsToString(l0),
      r0: bitsToString(r0),
    },
    round1: {
      key: bitsToString(roundKey1),
      r: bitsToString(r0),
      ep: bitsToString(f1.ep),
      xor: bitsToString(f1.xorResult),
      splitLeft: bitsToString(f1.left4),
      splitRight: bitsToString(f1.right4),
      s0: {
        row: f1.s0.row,
        col: f1.s0.col,
        output: bitsToString(f1.s0.output),
      },
      s1: {
        row: f1.s1.row,
        col: f1.s1.col,
        output: bitsToString(f1.s1.output),
      },
      sboxOutput: bitsToString(f1.sboxOutput),
      p4: bitsToString(f1.p4),
      leftXorP4: bitsToString(fk1Left),
      fkOutput: `${bitsToString(fk1Left)}${bitsToString(fk1Right)}`,
      afterSwap: `${bitsToString(l1)}${bitsToString(r1)}`,
      l1: bitsToString(l1),
      r1: bitsToString(r1),
    },
    round2: {
      key: bitsToString(roundKey2),
      r: bitsToString(r1),
      ep: bitsToString(f2.ep),
      xor: bitsToString(f2.xorResult),
      splitLeft: bitsToString(f2.left4),
      splitRight: bitsToString(f2.right4),
      s0: {
        row: f2.s0.row,
        col: f2.s0.col,
        output: bitsToString(f2.s0.output),
      },
      s1: {
        row: f2.s1.row,
        col: f2.s1.col,
        output: bitsToString(f2.s1.output),
      },
      sboxOutput: bitsToString(f2.sboxOutput),
      p4: bitsToString(f2.p4),
      leftXorP4: bitsToString(fk2Left),
      fkOutput: `${bitsToString(fk2Left)}${bitsToString(fk2Right)}`,
      preoutput: bitsToString(preoutput),
    },
    finalPermutation: {
      preoutput: bitsToString(preoutput),
      output: bitsToString(output),
    },
  };
}

module.exports = { runSDES };