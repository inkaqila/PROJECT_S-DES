let mode = "enc";

const API_URL = "/api/sdes";

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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        key,
        mode
      })
    });

    const json = await response.json();

    if (!json.success) {
      alert(json.message);
      return;
    }

    renderResult(json.data);
  } catch (error) {
    alert("Gagal terhubung ke backend. Pastikan backend sudah berjalan dengan perintah: node server.js");
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
  const resultLabel = mode === "enc" ? "Ciphertext (Hasil Enkripsi)" : "Plaintext (Hasil Dekripsi)";

  document.getElementById("rbox").style.display = "block";
  document.getElementById("rl").textContent = resultLabel;
  document.getElementById("rs").textContent = data.result;

  document.getElementById("rb").innerHTML = data.result
    .split("")
    .map((bit) => `<div class="rbit ${bit === "1" ? "one" : "zero"}">${bit}</div>`)
    .join("");

  document.getElementById("sol").innerHTML = buildSolutionHTML(data);
  document.getElementById("sol").style.display = "none";

  document.getElementById("rbox").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function buildSolutionHTML(data) {
  return `
    ${section("1. Key Generation", buildKeyGeneration(data))}
    ${section("2. Initial Permutation", buildInitialPermutation(data))}
    ${section("3. Round 1 / FK1", buildRound(data.round1, "Round 1"))}
    ${section("4. Swap", buildSwap(data))}
    ${section("5. Round 2 / FK2", buildRound(data.round2, "Round 2"))}
    ${section("6. Final Permutation", buildFinalPermutation(data))}
  `;
}

function section(title, content) {
  return `
    <div class="sec">
      <div class="stitle">${title}</div>
      ${content}
    </div>
  `;
}

function buildKeyGeneration(data) {
  const kg = data.keyGeneration;

  return `
    <div class="info">P10(Key) = <b>${kg.p10}</b></div>

    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Step</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Key Awal</td><td class="bitline">${kg.key}</td></tr>
          <tr><td>P10(Key)</td><td class="bitline">${kg.p10}</td></tr>
          <tr><td>Split</td><td>L = ${kg.left}, R = ${kg.right}</td></tr>
          <tr><td>LS-1</td><td class="bitline">${kg.ls1}</td></tr>
          <tr><td>P8(LS-1)</td><td class="bitline">${kg.k1}</td></tr>
          <tr><td>LS-2 / Shift³</td><td class="bitline">${kg.ls3}</td></tr>
          <tr><td>P8(Shift³)</td><td class="bitline">${kg.k2}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="info">K1 = <b>${kg.k1}</b></div>
    <div class="info">K2 = <b>${kg.k2}</b></div>
  `;
}

function buildInitialPermutation(data) {
  const ip = data.initialPermutation;

  return `
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Step</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Input</td><td class="bitline">${ip.input}</td></tr>
          <tr><td>IP(Input)</td><td class="bitline">${ip.ip}</td></tr>
          <tr><td>L0</td><td class="bitline">${ip.l0}</td></tr>
          <tr><td>R0</td><td class="bitline">${ip.r0}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function buildRound(round, title) {
  return `
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Step</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>R</td><td class="bitline">${round.r}</td></tr>
          <tr><td>E/P(R)</td><td class="bitline">${round.ep}</td></tr>
          <tr><td>Key</td><td class="bitline">${round.key}</td></tr>
          <tr><td>E/P(R) ⊕ Key</td><td class="bitline">${round.xor}</td></tr>
          <tr><td>Split</td><td>${round.splitLeft} | ${round.splitRight}</td></tr>
          <tr><td>S0</td><td>Row = ${round.s0.row}, Col = ${round.s0.col}, Output = <span class="bitline">${round.s0.output}</span></td></tr>
          <tr><td>S1</td><td>Row = ${round.s1.row}, Col = ${round.s1.col}, Output = <span class="bitline">${round.s1.output}</span></td></tr>
          <tr><td>S-Box Output</td><td class="bitline">${round.sboxOutput}</td></tr>
          <tr><td>P4</td><td class="bitline">${round.p4}</td></tr>
          <tr><td>L ⊕ P4</td><td class="bitline">${round.leftXorP4}</td></tr>
          <tr><td>FK Output</td><td class="bitline">${round.fkOutput}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

function buildSwap(data) {
  const r1 = data.round1;

  return `
    <div class="info">
      Setelah Round 1: <b>${r1.fkOutput}</b>
    </div>
    <div class="info">
      Setelah Swap: <b>${r1.afterSwap}</b>
    </div>
    <div class="info">
      L1 = <b>${r1.l1}</b>, R1 = <b>${r1.r1}</b>
    </div>
  `;
}

function buildFinalPermutation(data) {
  const fp = data.finalPermutation;
  const label = mode === "enc" ? "Ciphertext" : "Plaintext";

  return `
    <div class="table-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Step</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Preoutput</td><td class="bitline">${fp.preoutput}</td></tr>
          <tr><td>IP⁻¹(Preoutput)</td><td class="bitline">${fp.output}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="final-box">
      <div>Final Result = ${fp.output}</div>
      <div>${label} = ${fp.output}</div>
    </div>
  `;
}

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