# forU (Love Confession Web)

<p align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js_5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Discord.js_v14-5865F2?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/Canvas_Confetti-FF6B6B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGV4dCB5PSIxOCIgZm9udC1zaXplPSIxOCI+8J+OiTwvdGV4dD48L3N2Zz4=&logoColor=white" />
</p>

**forU ** adalah web interaktif untuk nembak doi secara kreatif! Kirim link spesial lewat Discord atau langsung, lengkap dengan animasi amplop, countdown, dan tombol "gamau" yang lari-larian.
Kalau doi jawab **"IYA mau!"**, dan notifikasi otomatis masuk ke Discord kamu! 

---

## Preview

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./screenshot/landscape1.png" width="300" style="border-radius: 8px;" />
        <br/>
        <sub>Tampilan Desktop ( Halaman utama )</sub>
      </td>
      <td align="center">
        <img src="./screenshot/landscape2.png" width="300" style="border-radius: 8px;" />
        <br/>
        <sub>Tampilan Desktop ( Halaman target )</sub>
      </td>
    </tr>
    <tr>
      <td colspan="2" align="center">
        <img src="./screenshot/potrait.png" width="200" style="border-radius: 8px;" />
        <br/>
        <sub>Tampilan Mobile ( Halaman utama )</sub>
      </td>
    </tr>
  </table>
</div>

---

### Backend & Discord
* **Discord Bot** — Command `!tembak` atau `!gombal` untuk generate link spesial secara otomatis.
* **Discord Webhook** — Notifikasi real-time ke server saat doi klik "IYA mau!".

---

## Tech Stack

### Frontend
| Tech | Versi |
| :--- | :--- |
| **React** | 19 |
| **Vite** | 7 |
| **TypeScript** | 5.9 |
| **GSAP** | 3.14 |

### Backend
| Tech | Deskripsi |
| :--- | :--- |
| **Node.js** | LTS Version |
| **Express.js** | Version 5 |
| **Discord.js** | Version 14 |

---

## Instalasi & Setup

### 1. Backend
```bash
cd backend
npm install
# Konfigurasi .env (PORT, DISCORD_BOT_TOKEN, DISCORD_WEBHOOK_URL, FRONTEND_URL)
node server.js
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

Project ini dibuat untuk hiburan dan personal. Bebas dimodifikasi.
