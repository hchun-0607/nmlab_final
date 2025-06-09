import json, os
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
from web3 import Web3

# ---------- 初始化 ----------
load_dotenv()  # 读 .env

w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
OWNER_PK   = os.getenv("OWNER_PK")
OWNER_ADDR = Web3.to_checksum_address(os.getenv("OWNER_ADDR"))

contract = w3.eth.contract(
    address=Web3.to_checksum_address(os.getenv("CONTRACT_ADDR")),
    abi=json.load(Path("ReserveSBT.json").open())["abi"],
)

# ---------- 给同学调用的函数 ----------
def mint(guest: str, slot_id: int, deposit_eth: float) -> str:
    tx = contract.functions.mintReservation(
        Web3.to_checksum_address(guest), slot_id
    ).build_transaction(_params(value=_eth(deposit_eth)))
    return _send(tx)

def return_reservation(token_id: int) -> str:
    tx = contract.functions.returnReservation(token_id).build_transaction(_params())
    return _send(tx)

def buy(token_id: int) -> str:
    # 读取 reservation 信息，返回值是 (owner, slot, deposit, state)
    _, _, deposit, _ = contract.functions.getReservationInfo(token_id).call()

    # 按合约逻辑：buy price = deposit * 95%
    price = deposit * 95 // 100

    tx = contract.functions.buyReturnedReservation(token_id)\
         .build_transaction(_params(value=price))
    return _send(tx)


def get_available() -> List[int]:
    return contract.functions.getAvailableTokenIds().call()

def info(token_id: int) -> Dict[str, Any]:
    o = contract.functions.getReservationInfo(token_id).call()
    return {"owner": o[0], "slot": o[1], "deposit": o[2], "state": o[3]}

# ---------- 底层工具 ----------
def _params(value: int = 0) -> Dict[str, Any]:
    return {
        "from": OWNER_ADDR,
        "nonce": w3.eth.get_transaction_count(OWNER_ADDR),
        "gas": 300_000,
        "gasPrice": w3.to_wei("5", "gwei"),
        "value": value,
    }

def _send(tx: Dict[str, Any]) -> str:
    signed = w3.eth.account.sign_transaction(tx, OWNER_PK)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print("⏳  等區塊鏈確定…")
    w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex()

def _eth(eth: float) -> int:
    return w3.to_wei(eth, "ether")

# ---------- 直接执行脚本会跑这个测试 ----------
if __name__ == "__main__":
    print("目前可購買 tokenId =", get_available())
