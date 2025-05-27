nmlab_final/
 contracts/        # Solidity 智慧合約（Hardhat）
 backend/          # Python 後端 API（FastAPI + web3.py）
 frontend/         # 前端 PWA（React + TypeScript + ethers.js）
 rpi_verify/       # RPi 驗票腳本（Python + OpenCV + pyzbar）

git clone https://github.com/hchun-0607/nmlab_final.git
cd nmlab_final

cp env.example .env
用編輯器把 .env 裡的 RPC_URL / OWNER_PK / BACKEND_URL 填好
nano .env

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000  打開 → http://localhost:8000/docs 可看到 Swagger 測 API

cd ../frontend
npm install
npm run dev

cd ../rpi_verify
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scan_qr.py

node / python 版本：
Node.js ≥ v18 (用 nvm 安裝 / 切換)
Python ≥ 3.11 (系統預裝或用 pyenv)
