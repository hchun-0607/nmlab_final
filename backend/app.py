from fastapi import FastAPI
from dotenv import load_dotenv
import os
load_dotenv("../.env")   # 讀根目錄 .env

app = FastAPI()
@app.get("/")
def pong(): return {"ping":"pong"}