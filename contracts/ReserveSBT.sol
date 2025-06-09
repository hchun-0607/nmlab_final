// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ---------------------------------------------------------------------
// 依賴套件：
//   - ERC721URIStorage：可為每個 token 儲存 tokenURI
//   - Ownable           ：簡易權限控制（onlyOwner）
// ---------------------------------------------------------------------
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title  ReserveSBT
 * @notice 餐廳訂位專用 Soul-Bound Token（SBT，不可自由轉移）
 *         - Active   ：有效預約
 *         - Returned ：顧客退訂、可被他人購買
 *         - Burned   ：過期銷毀
 */
contract ReserveSBT is ERC721URIStorage, Ownable {
    /* ───────── 型別定義 ───────── */
    enum State { Active, Returned, Burned }

    struct Info {
        uint256 slotId;   // 訂位時段編號（餐廳自訂）
        uint256 deposit;  // 押金（wei）
        State   state;    // 當前狀態
    }

    /* ───────── 狀態變數 ───────── */
    uint256 public nextId = 1;                    // 下一個 tokenId
    mapping(uint256 => Info) public infos;        // tokenId → Info

    uint256[] public returnedList;                // 已退訂、可購買之 tokenId
    mapping(uint256 => uint256) private idxInList;// tokenId 在 returnedList 的位置 (+1)

    /* ───────── 建構函式 ───────── */
    constructor()
        ERC721("Reservation NFT", "RSB")          // NFT 名稱與代號
        Ownable(msg.sender)                       // 指定部署者為餐廳 Owner
    {}

    /* ───────── 餐廳功能 ───────── */

    /// @dev 鑄造新的預約 NFT（餐廳呼叫），須支付押金
    function mintReservation(address guest, uint256 slotId)
        external
        payable
        onlyOwner
    {
        require(msg.value > 0, "deposit required");
        uint256 id = nextId++;
        _safeMint(guest, id);
        infos[id] = Info(slotId, msg.value, State.Active);
    }

    /// @dev 顧客退訂：NFT 轉回餐廳 & 狀態改為 Returned
    function returnReservation(uint256 id) external {
        require(ownerOf(id) == msg.sender, "not owner");
        require(infos[id].state == State.Active, "state");
        _transfer(msg.sender, owner(), id);
        infos[id].state = State.Returned;
        _pushReturned(id);
    }

    /// @dev 購買退訂 NFT：支付 95% 押金，90% 退前顧客、5% 給餐廳
    function buyReturnedReservation(uint256 id) external payable {
        Info storage inf = infos[id];
        require(inf.state == State.Returned, "not returned");
        uint256 price = (inf.deposit * 95) / 100;
        require(msg.value >= price, "underpay");

        uint256 refund = (inf.deposit * 90) / 100;
        payable(ownerOf(id)).transfer(refund);            // 前顧客退 90%
        payable(owner()).transfer(msg.value - refund);    // 餐廳抽 5%

        _transfer(owner(), msg.sender, id);
        inf.state = State.Active;
        _popReturned(id);
    }

    /// @dev 餐廳銷毀過期 NFT
    function burnExpired(uint256 id) external onlyOwner {
        require(infos[id].state != State.Burned, "already");
        infos[id].state = State.Burned;
        _popReturned(id);
        _burn(id);
    }

    /* ───────── 查詢函式 ───────── */

    /// 取得目前可購買的 tokenId 列表
    function getAvailableTokenIds() external view returns (uint256[] memory) {
        return returnedList;
    }

    /// 查詢單一預約詳細資訊
    function getReservationInfo(uint256 id)
        external
        view
        returns (address owner_, uint256 slot, uint256 deposit, State state)
    {
        Info memory i = infos[id];
        return (ownerOf(id), i.slotId, i.deposit, i.state);
    }

    /* ───────── Soul-Bound 限制：覆寫 _update (OZ v5) ───────── */
    /**
     * OpenZeppelin v5 引入 _update() 取代 _beforeTokenTransfer。
     * 僅允許「餐廳 ↔ 顧客」方向轉移；其他轉移皆阻擋。
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address from) {
        // 先執行父合約邏輯，取得 from
        from = super._update(to, tokenId, auth);

        // 非鑄造 (from==0) / 銷毀 (to==0)：強制其中一方為餐廳(Owner)
        if (from != address(0) && to != address(0)) {
            require(from == owner() || to == owner(), "soul-bound");
        }
        return from;
    }

    /* ───────── returnedList 管理 ───────── */
    function _pushReturned(uint256 id) private {
        idxInList[id] = returnedList.length + 1;  // +1 避免預設 0 與不存在混淆
        returnedList.push(id);
    }

    function _popReturned(uint256 id) private {
        uint256 idx = idxInList[id];
        if (idx == 0) return;                    // 不在列表
        uint256 last = returnedList[returnedList.length - 1];
        returnedList[idx - 1] = last;           // 將最後一項移至空位
        idxInList[last] = idx;
        returnedList.pop();
        idxInList[id] = 0;
    }
}
