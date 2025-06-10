# reservation_wrapper.py (專案根目錄)
import os, json
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
from web3 import Web3
from tinydb import TinyDB, Query

# ---------- 初始化: 根目錄載入 .env ----------
ROOT = Path(__file__).resolve().parent
load_dotenv(dotenv_path=ROOT / '.env')

# ---------- Web3 & 合約設定 ----------
RPC_URL       = os.getenv("RPC_URL")
CONTRACT_ADDR = Web3.toChecksumAddress(os.getenv("CONTRACT_ADDR"))
# CONTRACT_ADDR = to_checksum_address(os.getenv("CONTRACT_ADDR"))
w3 = Web3(Web3.HTTPProvider(RPC_URL))

ABI_PATH = ROOT / "ReserveSBT.json"
contract = w3.eth.contract(
    address=CONTRACT_ADDR,
    abi=json.load(ABI_PATH.open(encoding='utf-8'))["abi"],
)

# ---------- TinyDB: 存使用者錢包 ----------
# db       = TinyDB(ROOT / 'backend' / 'db.json')
# users_db = db.table('users')
# User     = Query()
# db = TinyDB('db.json')
# users_db = db.table('users')
# User = Query()
db = TinyDB('db.json')
User = Query()


# ---------- 底層工具: 建交易參數 ----------
def _build_tx_params(from_addr: str, value_wei: int = 0) -> Dict[str, Any]:
    return {
        "from":     Web3.toChecksumAddress(from_addr),
        "nonce":    w3.eth.get_transaction_count(from_addr),
        "gas":      300_000,
        "gasPrice": w3.toWei("5", "gwei"),
        "value":    value_wei,
    }

# ---------- 高階函式: 用戶化簽名操作 ----------
# 每次鑄造固定押金 0.05 ETH
def mint_for_user(
    account: str,
    reservation_time: int,
    party_size: int
) -> Dict[str, Any]:
    """
    MintReservation 並強制使用 0.05 ETH 作為押金。
    reservation_time: UNIX timestamp（秒）
    party_size: 預約人數
    """
    print(account, reservation_time, party_size, "received")
    user   = db.get(User.wallet_address == account)
    wallet = user.get("wallet_address")
    pk     = "0x" + user.get("private_key_hex")

    # 固定押金
    deposit_eth = 0.05
    value       = w3.toWei(deposit_eth, "ether")

    tx = contract.functions.mintReservation(
        Web3.toChecksumAddress(wallet),
        reservation_time,
        int(party_size)
    ).build_transaction(_build_tx_params(wallet, value))

    signed  = w3.eth.account.sign_transaction(tx, pk)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    events = contract.events.Transfer().processReceipt(receipt)

    for event in events:
        print(event['args'])
    token_id = events[0]['args']['tokenId'] if events else None

    return {"tx_hash": tx_hash.hex(), "token_id": token_id}


def return_for_user(account: str, token_id: int) -> str:
    user   = db.get(User.account == account)
    wallet = user.get("wallet_address")
    pk     = user.get("private_key")

    tx = contract.functions.returnReservation(token_id)\
         .build_transaction(_build_tx_params(wallet))
    signed  = w3.eth.account.sign_transaction(tx, pk)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex()


def buy_for_user(account: str, token_id: int) -> str:
    user   = db.get(User.account == account)
    wallet = user.get("wallet_address")
    pk     = user.get("private_key")

    # getReservationInfo 目前回傳 5 個欄位：
    # (owner, reservationTime, partySize, deposit, state)
    _, _, _, deposit, _ = contract.functions.getReservationInfo(token_id).call()
    price = deposit * 95 // 100

    tx = contract.functions.buyReturnedReservation(token_id)\
         .build_transaction(_build_tx_params(wallet, price))
    signed  = w3.eth.account.sign_transaction(tx, pk)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_hash.hex()


def get_available() -> List[int]:
    return contract.functions.getAvailableTokenIds().call()


def get_tokens_of_owner(address: str) -> List[int]:
    """
    回傳指定地址持有的所有 NFT Token IDs
    """
    print("get_tokens_of_owner")

    try:
        checksum_addr = Web3.toChecksumAddress(address)
        print(f"[DEBUG] Checksum address: {checksum_addr}")
        balance = contract.functions.balanceOf(checksum_addr).call()
        print(f"[DEBUG] NFT Balance: {balance}")
        tokens = [
            contract.functions.tokenOfOwnerByIndex(checksum_addr, i).call()
            for i in range(balance)
        ]
        print(f"[DEBUG] Tokens: {tokens}")
        return tokens
    except Exception as e:
        print(f"[ERROR] get_tokens_of_owner failed: {e}")
        raise
def get_tokens_by_transfer_event(address: str) -> List[int]:
    checksum_addr = Web3.toChecksumAddress(address)
    transfer_event = contract.events.Transfer

    from_block = 0
    to_block = "latest"

    # 取到該地址收到的 token
    incoming_logs = transfer_event.createFilter(
        fromBlock=from_block,
        toBlock=to_block,
        argument_filters={"to": checksum_addr}
    ).get_all_entries()

    # 取該地址轉出的 token
    outgoing_logs = transfer_event.createFilter(
        fromBlock=from_block,
        toBlock=to_block,
        argument_filters={"from": checksum_addr}
    ).get_all_entries()

    owned_tokens = set()
    for log in incoming_logs:
        owned_tokens.add(log["args"]["tokenId"])
    for log in outgoing_logs:
        owned_tokens.discard(log["args"]["tokenId"])

    return list(owned_tokens)

        
def get_info(token_id: int) -> Dict[str, Any]:
    """
    查詢單一 Token 的訂位詳情
    """
    print("token_id : 1")
    o = contract.functions.getReservationInfo(1).call()
    return {
        "owner":            o[0],
        "reservation_time": o[1],
        "party_size":       o[2],
        "deposit":          o[3],
        "state":            o[4]
    }

def get_reservations_of_owner(address: str) -> List[Dict[str, Any]]:
    print("get_reservations_of_owner")
    tokens = get_tokens_of_owner(address)
    print(f"[DEBUG] Tokens of {address}: {tokens}")
    result = []
    for tid in tokens:
        try:
            info = get_info(tid)
            print(f"[DEBUG] Info for token {tid}: {info}")
            result.append(info)
        except Exception as e:
            print(f"[ERROR] Failed to get info for token {tid}: {e}")
    return result

def get_balance(address: str) -> int:
    checksum_addr = Web3.toChecksumAddress(address)
    return w3.eth.get_balance(checksum_addr)

# 測試
if __name__ == "__main__":
    print("可購買 tokenId =", get_available())