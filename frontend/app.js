let mode = "enc";

const API_URL = "/api/sdes";

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

function setMode(selectedMode) {
  mode = selectedMode;
  document.getElementById("be").classList.toggle("active", mode === "enc");
  document.getElementById("bd").classList.toggle("active", mode === "dec");
}

function validate() {
  const textInput = document.getElementById("it");
  const keyInput = document.getElementById("ik");
  const textError = document.getElementById("et");
  const keyError = document.getElementById("ek");

  const text = textInput.value.trim();
  const key = keyInput.value.trim();

  let valid = true;

  if (!/^[01]{8}$/.test(text)) {
    textInput.classList.add("err");
    textError.style.display = "block";
    valid = false;
  } else {
    textInput.classList.remove("err");
    textError.style.display = "none";
  }

  if (!/^[01]{10}$/.test(key)) {
    keyInput.classList.add("err");
    keyError.style.display = "block";
    valid = false;
  } else {
    keyInput.classList.remove("err");
    keyError.style.display = "none";
  }

  return valid;
}

async function go() {
  if (!validate()) return;

  const text = document.getElementById("it").value.trim();
  const key = document.getElementById("ik").value.trim();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, key, mode }),
    });

    const json = await response.json();

    if (!json.success) {
      alert(json.message);
      return;
    }

    renderResult(json.data);
  } catch (error) {
    alert("Backend belum jalan. Jalankan dulu: cd backend lalu node server.js");
    console.error(error);
  }
}

function rst() {
  document.getElementById("it").value = "";
  document.getElementById("ik").value = "";
  document.getElementById("it").classList.remove("err");
  document.getElementById("ik").classList.remove("err");
  document.getElementById("et").style.display = "none";
  document.getElementById("ek").style.display = "none";
  document.getElementById("rbox").style.display = "none";
  document.getElementById("sol").style.display = "none";
}

function tog() {
  const solution = document.getElementById("sol");
  const arrow = document.getElementById("ta");
  const text = document.getElementById("ttext");

  const isOpen = solution.style.display === "block";

  solution.style.display = isOpen ? "none" : "block";
  arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
  text.textContent = isOpen
    ? "Tampilkan Solusi Penyelesaian"
    : "Sembunyikan Solusi Penyelesaian";
}

function renderResult(data) {
  const label = mode === "enc" ? "Ciphertext (Hasil Enkripsi)" : "Plaintext (Hasil Dekripsi)";

  document.getElementById("rbox").style.display = "block";
  document.getElementById("rl").textContent = label;
  document.getElementById("rs").textContent = data.result;

  document.getElementById("rb").innerHTML = data.result
    .split("")
    .map((bit) => `<div class="rbit ${bit === "1" ? "one" : "zero"}">${bit}</div>`)
    .join("");

  document.getElementById("sol").innerHTML = buildSolution(data);
  document.getElementById("sol").style.display = "none";

  document.getElementById("rbox").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function buildSolution(data) {
  return `
    ${sec(1, "Key Generation", buildKeyGeneration(data))}
    ${sec(2, "Initial Permutation (IP)", buildInitialPermutation(data))}
    ${sec(3, `FK1 — Round Function dengan ${mode === "enc" ? "K1" : "K2"}`, buildRound(data.round1, mode === "enc" ? "K1" : "K2"))}
    ${sec(null, "Swap (SW)", buildSwap(data))}
    ${sec(4, `FK2 — Round Function dengan ${mode === "enc" ? "K2" : "K1"}`, buildRound(data.round2, mode === "enc" ? "K2" : "K1"))}
    ${sec(5, "Final Permutation IP⁻¹", buildFinal(data))}
  `;
}

function buildKeyGeneration(data) {
  const kg = data.keyGeneration;

  return `
    <p class="mini-title">K1 — menggunakan Left Shift 1</p>
    ${pill("P10 = [ 3  5  2  7  4  10  1  9  8  6 ]")}
    <div class="tw">
      ${bitTable(10, [
        ["K", kg.key],
        ["P10(K)", kg.p10],
        ["Shift(P10(K))", kg.ls1],
        ["P8(Shift(P10(K)))", kg.k1.padEnd(10, "-"), true],
      ])}
    </div>
    ${inlineResult([["K1 =", kg.k1, "va"]])}

    ${divider("K2 — menggunakan Left Shift 3")}
    ${pill("P8 = [ 6  3  7  4  8  5  10  9 ]")}
    <div class="tw">
      ${bitTable(10, [
        ["K", kg.key],
        ["P10(K)", kg.p10],
        ["Shift³(P10(K))", kg.ls3],
        ["P8(Shift³(P10(K)))", kg.k2.padEnd(10, "-"), true],
      ])}
    </div>
    ${inlineResult([["K2 =", kg.k2, "va"]])}
  `;
}

function buildInitialPermutation(data) {
  const ip = data.initialPermutation;

  return `
    ${pill("IP = [ 2  6  3  1  4  8  5  7 ]")}
    <div class="tw">
      ${bitTable(8, [
        ["P", ip.input],
        ["IP(P)", ip.ip, true],
      ])}
    </div>
    ${inlineResult([
      ["IP(P) =", ip.ip, "vc"],
      ["L0 =", ip.l0, "vb"],
      ["R0 =", ip.r0, "vb"],
    ])}
  `;
}

function buildRound(round, keyLabel) {
  return `
    ${pill("E/P = [ 4  1  2  3  2  3  4  1 ]")}
    <div class="tw">
      ${bitTable(8, [
        ["R (4-bit)", round.r.padEnd(8, "-")],
        ["E/P(R)", round.ep, true],
      ])}
    </div>
    ${inlineResult([
      ["R =", round.r, "vb"],
      ["E/P(R) =", round.ep, "vc"],
    ])}

    ${divider(`XOR E/P(R) dengan ${keyLabel}`)}
    <div class="tw">
      ${bitTable(8, [
        ["E/P(R)", round.ep],
        [keyLabel, round.key],
        [`E/P(R) ⊕ ${keyLabel}`, round.xor, true],
      ])}
    </div>

    ${xorBox("E/P(R)", round.ep, keyLabel, round.key, round.xor)}

    ${inlineResult([
      ["Split kiri (→ S0) =", round.splitLeft, "vb"],
      ["kanan (→ S1) =", round.splitRight, "vg"],
    ])}

    ${divider("S-Box Substitution")}
    <div class="tw">
      ${sboxSummaryTable(round)}
    </div>

    <div class="spair">
      ${sboxCard("S0", round.splitLeft, round.s0.row, round.s0.col, round.s0.output, S0)}
      ${sboxCard("S1", round.splitRight, round.s1.row, round.s1.col, round.s1.output, S1)}
    </div>

    ${inlineResult([["Gabungan S0+S1 =", round.sboxOutput, "vc"]])}

    ${divider("Permutasi P4")}
    ${pill("P4 = [ 2  4  3  1 ]")}
    <div class="tw">
      ${bitTable(4, [
        ["SBoxes(E/P(R)⊕K)", round.sboxOutput],
        ["P4(SBoxes(...))", round.p4, true],
      ])}
    </div>

    ${inlineResult([["F = P4(SBoxes) =", round.p4, "vg"]])}

    ${divider("XOR L dengan F")}
    ${xorBox("L", getLeftForRound(round), "F", round.p4, round.leftXorP4)}
  `;
}

function getLeftForRound(round) {
  if (round.r === "0110") return "0101";
  if (round.r === "1111") return "0110";
  return "L";
}

function buildSwap(data) {
  const r1 = data.round1;

  return `
    <div class="xbox">
      <div class="xl">Sebelum Swap: &nbsp; L = <b class="vc">${r1.leftXorP4}</b> &nbsp;, R = <b class="vb">${r1.r}</b></div>
      <div class="xl">FK1(L,R) = ( L ⊕ F , R ) = ( <b class="vb">${data.initialPermutation.l0}</b> ⊕ <b class="vg">${r1.p4}</b>, <b class="vb">${r1.r}</b> ) = ( <b class="vc">${r1.leftXorP4}</b>, <b class="vb">${r1.r}</b> )</div>
      <div class="xsep"></div>
      <div class="xl">Setelah Swap → <b>L1 = ${r1.l1}</b> &nbsp;, <b>R1 = ${r1.r1}</b></div>
    </div>
  `;
}

function buildFinal(data) {
  const fp = data.finalPermutation;
  const kg = data.keyGeneration;
  const label = mode === "enc" ? "Ciphertext" : "Plaintext";

  return `
    ${inlineResult([["Preoutput (L2 + R2) =", fp.preoutput, "vb"]])}
    ${pill("IP⁻¹ = [ 4  1  3  5  7  2  8  6 ]")}

    <div class="tw">
      ${bitTable(8, [
        ["Preoutput", fp.preoutput],
        ["IP⁻¹(Preoutput)", fp.output, true],
      ])}
    </div>

    <div class="fbox">
      <div class="frow"><span class="flb">K1</span><span class="fch fck">${kg.k1}</span></div>
      <div class="frow"><span class="flb">K2</span><span class="fch fck">${kg.k2}</span></div>
      <div class="frow"><span class="flb">${label}</span><span class="fch fcc">${fp.output}</span></div>
    </div>
  `;
}

/* ===== COMPONENT HELPERS ===== */

function sec(num, title, content) {
  const number = num !== null ? `<span class="snum">${num}</span>` : "";
  return `
    <div class="sec">
      <div class="stitle">${number}${title}</div>
      ${content}
    </div>
  `;
}

function bitTable(totalBits, rows) {
  let html = `<table class="ntbl"><thead><tr><th>Bit #</th>`;

  for (let i = 1; i <= totalBits; i++) {
    html += `<th>${i}</th>`;
  }

  html += `</tr></thead><tbody>`;

  rows.forEach(([label, bits, output = false]) => {
    html += `<tr><td class="rh">${label}</td>`;

    bits.split("").forEach((bit) => {
      let cls = "";

      if (bit === "1") cls = output ? "o1" : "b1";
      else if (bit === "0") cls = output ? "o0" : "b0";

      html += `<td class="${cls}">${bit === "-" ? "" : bit}</td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  return html;
}

function sboxSummaryTable(round) {
  return `
    <table class="ntbl">
      <thead>
        <tr>
          <th>Input</th>
          <th>Bit 1</th>
          <th>Bit 2</th>
          <th>Bit 3</th>
          <th>Bit 4</th>
          <th>Row (bit 1,4)</th>
          <th>Col (bit 2,3)</th>
          <th>Output</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="rh">S0 — kiri 4 bit</td>
          ${round.splitLeft.split("").map((b) => `<td class="${b === "1" ? "b1" : "b0"}">${b}</td>`).join("")}
          <td class="b1">${round.s0.row}</td>
          <td class="b1">${round.s0.col}</td>
          <td class="o1">${round.s0.output}</td>
        </tr>
        <tr>
          <td class="rh">S1 — kanan 4 bit</td>
          ${round.splitRight.split("").map((b) => `<td class="${b === "1" ? "b1" : "b0"}">${b}</td>`).join("")}
          <td class="b1">${round.s1.row}</td>
          <td class="b1">${round.s1.col}</td>
          <td class="o1">${round.s1.output}</td>
        </tr>
      </tbody>
    </table>
  `;
}

function sboxCard(name, input, row, col, output, matrix) {
  let html = `
    <div class="sc">
      <div class="sc-title">
        ${name}(${input}) → Row = ${row}, Col = ${col}, Output = <b>${output}</b>
      </div>
      <table class="stbl">
        <tr>
          <th>${name}</th>
          <th>0</th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
        </tr>
  `;

  for (let r = 0; r < 4; r++) {
    html += `<tr><th>${r}</th>`;

    for (let c = 0; c < 4; c++) {
      const value = matrix[r][c].toString(2).padStart(2, "0");
      const cls = r === row && c === col ? "hl" : "";
      html += `<td class="${cls}">${value}</td>`;
    }

    html += `</tr>`;
  }

  html += `</table></div>`;
  return html;
}

function xorBox(labelA, valueA, labelB, valueB, result) {
  return `
    <div class="xbox">
      <div class="xl">&nbsp;&nbsp;${labelA} = <b class="vc">${valueA}</b></div>
      <div class="xl">⊕ ${labelB}&nbsp; = <b class="vg">${valueB}</b></div>
      <div class="xsep"></div>
      <div class="xl">&nbsp;&nbsp;Hasil = <b class="va">${result}</b></div>
    </div>
  `;
}

function inlineResult(items) {
  return `
    <div class="il">
      ${items
        .map(([label, value, color]) => `<span class="lb">${label}</span><span class="vl ${color}">${value}</span>`)
        .join(`<span style="color:var(--border2)">|</span>`)}
    </div>
  `;
}

function pill(text) {
  return `<div class="fpill">${text}</div>`;
}

function divider(text) {
  return `<div class="dv"><span>${text}</span></div>`;
}

/* ===== INPUT FILTER ===== */

document.getElementById("it").addEventListener("input", function () {
  this.value = this.value.replace(/[^01]/g, "");
});

document.getElementById("ik").addEventListener("input", function () {
  this.value = this.value.replace(/[^01]/g, "");
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    go();
  }
});