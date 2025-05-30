# NFT 訂位系統 (nmlab\_final)

全端範例專案：

* **合約**：Solidity (Hardhat)
* **後端**：Python (FastAPI + web3.py)
* **前端**：React + TypeScript + ethers.js (Vite)
* **驗票腳本**：Python (OpenCV + pyzbar)

---

## 專案結構

```
nmlab_final/
├── contracts/        # 智慧合約專案
├── backend/          # FastAPI 後端
├── frontend/         # React 前端
└── rpi_verify/       # RPi 驗票腳本
├── vscode-workspace.code-workspace  
├── .env              
├── env.example       
└── .gitignore        
```

---

## 前置需求

* Node.js ≥ v18（使用 nvm 管理）
* Python ≥ 3.11（venv / pyenv）

## 快速啟動

1. **Clone 專案**

   ```bash
   git clone https://github.com/hchun-0607/nmlab_final.git
   cd nmlab_final
   ```

2. **設定環境變數**

   ```bash
   cp env.example .env
   # 編輯 .env，填入 RPC_URL、OWNER_PK、OWNER_ADDR、BACKEND_URL
   ```

3. **啟動後端**

   ```bash
   cd backend
   python connection.py
   ```

4. **啟動前端**

   ```bash
   cd ../frontend
   npm install
   npm start
   ```

5. **測試驗票腳本**

   ```bash
   cd ../rpi_verify
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python scan_qr.py
   ```

---

## 常見問題

* **Node 版本**：`nvm install --lts && nvm use --lts`
* **WSL noexec**：將專案放到 Linux FS (`~/`)，並用 Remote-WSL 開啟
* **忘記 ABI**：將 `contracts/artifacts/.../ReserveSBT.json` 的 ABI 貼到 `rpi_verify/ReserveSBT_abi.json`

---
