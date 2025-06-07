# NFT 訂位系統 (nmlab\_final)
網多炸裂...

全端範例專案：

* **合約**：Solidity (Hardhat)
* **後端**：Python (FastAPI + web3.py)
* **前端**：React + TypeScript + ethers.js (Vite)
* **SSI**：

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
# 訂位 NFT 系統

本專案實現了一套基於 Soul-Bound NFT 的餐廳訂位系統，部署於以太坊 Sepolia 測試網，並提供 Python SDK 方便呼叫。主要內容：

- **智能合約 (`ReserveSBT.sol`)**：實作 Mint、退訂、轉售、逾期燒毀及不可隨意轉帳限制。
- **部署腳本 (`scripts/deploy.js`)**：使用 Hardhat + Ethers v6 部署合約到 Sepolia。
- **Python 封裝 (`reservation_wrapper.py`)**：最小 Python SDK，包含 mint、return、buy、get_available、info 等函式。
- **示例腳本**：快速示範如何呼叫 Python SDK。請參考下方範例程式片段。

---
新作的
## 📋 前置需求

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **Git**
- **Sepolia 測試網 ETH**（從 Sepolia Faucet 取得）
- **Infura / Alchemy Sepolia RPC URL**

---

## ⚙️ 專案設定

1. **Clone 專案**
    ```bash
    git clone https://github.com/hchun-0607/nmlab_final.git
    cd nmlab_final
    git checkout feat/python-wrapper
    ```

2. **安裝 Node.js 依賴**
    ```bash
    npm install
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
    npm install @openzeppelin/contracts@4.9.5 --save-exact
    ```

3. **安裝 Python 依賴**
    ```bash
    python -m venv .venv
    # Windows PowerShell
    .\.venv\Scripts\Activate
    # macOS / Linux
    # source .venv/bin/activate
    pip install -r requirements.txt
    ```

4. **建立 `.env`** 根目錄建立 `.env`，填入：
    ```dotenv
    RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
    OWNER_PK=0xYOUR_DEPLOYER_PRIVATE_KEY
    OWNER_ADDR=0xYOUR_DEPLOYER_ADDRESS
    CONTRACT_ADDR=
    ```
    - **RPC_URL**：Infura 或 Alchemy 提供的 Sepolia Endpoint
    - **OWNER_PK**：部署者私鑰（請妥善保管）
    - **OWNER_ADDR**：部署者地址
    - **CONTRACT_ADDR**：部署後再填入合約地址

---

## 🚀 部署合約

1. **編譯合約**
    ```bash
    npx hardhat compile
    ```

2. **部署到 Sepolia**
    ```bash
    npx hardhat run scripts/deploy.js --network sepolia
    ```
    會印出合約地址，複製並填回 `.env` 的 `CONTRACT_ADDR`。

3. **複製 ABI 檔**
    ```bash
    copy .\artifacts\contracts\ReserveSBT.sol\ReserveSBT.json .\ReserveSBT.json
    ```

---

## 🐍 Python SDK 使用範例

- **Mint 訂位 NFT**
    ```python
    from reservation_wrapper import mint
    tx_hash = mint("0xGUEST_ADDRESS", 202506081830, 0.02)
    print("Mint tx:", tx_hash)
    ```

- **查詢可購買列表**
    ```python
    from reservation_wrapper import get_available
    print(get_available())
    ```

- **購買退訂 NFT**
    ```python
    from reservation_wrapper import buy
    tx_hash = buy(1)
    print("Buy tx:", tx_hash)
    ```

- **退訂 NFT**
    ```python
    from reservation_wrapper import return_reservation
    tx_hash = return_reservation(1)
    print("Return tx:", tx_hash)
    ```

---

## 🎯 使用範例

目前沒有獨立 `demo.py`，請直接在 Python 互動式或腳本中呼叫：

```bash
python - <<'PY'
from reservation_wrapper import get_available, mint, buy, return_reservation

# 查詢可購買
print("可買列表：", get_available())

# Mint 範例
# tx_hash = mint("0xGUEST_ADDRESS", 202506081830, 0.02)
# print("Mint tx:", tx_hash)

# Buy 出售中 NFT
# tx_hash = buy(1)
# print("Buy tx:", tx_hash)

# 退訂
# tx_hash = return_reservation(1)
# print("Return tx:", tx_hash)
PY
