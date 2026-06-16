# S-DES Simulator

S-DES Simulator adalah aplikasi web untuk melakukan simulasi algoritma **Simplified Data Encryption Standard (S-DES)**. Aplikasi ini mendukung proses **enkripsi** dan **dekripsi** menggunakan input 8-bit serta key 10-bit.

Aplikasi ini dibuat dengan konsep **frontend + backend**, sehingga proses perhitungan S-DES dijalankan melalui backend API, sedangkan frontend digunakan untuk menampilkan input, output, dan langkah penyelesaian secara visual.

## Fitur Aplikasi

* Input plaintext atau ciphertext 8-bit dalam bentuk biner.
* Input key 10-bit dalam bentuk biner.
* Pilihan mode operasi:

  * Enkripsi
  * Dekripsi
* Validasi input agar hanya menerima angka biner 0 dan 1.
* Menampilkan hasil akhir enkripsi atau dekripsi.
* Menampilkan solusi penyelesaian secara step-by-step.
* Menampilkan proses:

  * Key Generation
  * Initial Permutation
  * Round Function 1
  * Swap
  * Round Function 2
  * Final Permutation IP⁻¹
* Menampilkan tabel bit, proses XOR, S-Box, P4, dan hasil akhir.

## Teknologi yang Digunakan

* HTML5
* CSS3
* JavaScript
* Node.js
* Express.js
* CORS

## Struktur Folder

```text
SDES-APP/
│
├── backend/
│   ├── node_modules/
│   ├── package-lock.json
│   ├── package.json
│   ├── sdes.js
│   └── server.js
│
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
│
├── .gitignore
└── README.md
```

## Penjelasan Folder

### `backend/`

Folder ini berisi kode backend aplikasi.

* `server.js`
  Berfungsi sebagai server utama menggunakan Express.js. File ini menangani request dari frontend dan menyediakan endpoint API untuk proses S-DES.

* `sdes.js`
  Berisi implementasi algoritma S-DES, mulai dari key generation, initial permutation, round function, S-Box, sampai final permutation.

* `package.json`
  Berisi informasi project backend dan daftar dependency yang digunakan.

### `frontend/`

Folder ini berisi tampilan aplikasi.

* `index.html`
  Berisi struktur halaman web.

* `style.css`
  Berisi desain tampilan aplikasi.

* `app.js`
  Berisi logika frontend untuk mengambil input user, mengirim data ke backend API, menerima hasil, dan menampilkan langkah penyelesaian.

## Cara Menjalankan Project

Pastikan Node.js dan npm sudah terinstall di perangkat.

### 1. Clone Repository

```bash
git clone https://github.com/inkaqila/PROJECT_S-DES.git
```

Masuk ke folder project:

```bash
cd PROJECT_S-DES
```

### 2. Masuk ke Folder Backend

```bash
cd backend
```

### 3. Install Dependency

```bash
npm install
```

### 4. Jalankan Server

```bash
node server.js
```

Jika berhasil, terminal akan menampilkan:

```text
S-DES app running on http://localhost:3000
```

### 5. Buka Aplikasi

Buka browser, lalu akses:

```text
http://localhost:3000
```

## Contoh Pengujian Enkripsi

Input:

```text
Plaintext = 10001101
Key       = 1001001110
Mode      = Enkripsi
```

Output:

```text
Ciphertext = 00111011
```

## Contoh Pengujian Dekripsi

Input:

```text
Ciphertext = 00111011
Key        = 1001001110
Mode       = Dekripsi
```

Output:

```text
Plaintext = 10001101
```

## Alur Algoritma S-DES

Secara umum, proses S-DES pada aplikasi ini berjalan dengan tahapan berikut:

```text
Input 8-bit
↓
Initial Permutation
↓
Split menjadi L0 dan R0
↓
Round Function 1
↓
Swap
↓
Round Function 2
↓
Final Permutation IP⁻¹
↓
Output akhir
```

Untuk key generation:

```text
Key 10-bit
↓
P10
↓
Split kiri dan kanan
↓
Left Shift 1
↓
P8 menghasilkan K1
↓
Left Shift 2
↓
P8 menghasilkan K2
```

## Endpoint API

Backend menyediakan endpoint:

```text
POST /api/sdes
```

Request body:

```json
{
  "text": "10001101",
  "key": "1001001110",
  "mode": "enc"
}
```

Keterangan:

* `text` berisi plaintext atau ciphertext 8-bit.
* `key` berisi key 10-bit.
* `mode` berisi:

  * `enc` untuk enkripsi
  * `dec` untuk dekripsi

Contoh response:

```json
{
  "success": true,
  "data": {
    "mode": "enc",
    "result": "00111011"
  }
}
```

## Author

Inka Aqila
Mata Kuliah Kriptografi
Project Web Simulasi S-DES
