// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CashflowShareNFT
/// @notice Optional ERC721 receipt that mints one token per investor on first vault participation.
contract CashflowShareNFT {
    string public name;
    string public symbol;
    address public immutable vault;
    uint256 public immutable scheduleId;

    uint256 public totalSupply;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(address => bool) public hasReceipt;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed spender, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /// @notice Creates a new receipt NFT collection bound to one schedule/vault.
    /// @param _name NFT collection name.
    /// @param _symbol NFT collection symbol.
    /// @param _vault Authorized vault that may mint receipts.
    /// @param _scheduleId Associated schedule id used in metadata.
    constructor(string memory _name, string memory _symbol, address _vault, uint256 _scheduleId) {
        require(_vault != address(0), "ZERO_VAULT");
        name = _name;
        symbol = _symbol;
        vault = _vault;
        scheduleId = _scheduleId;
    }

    /// @notice Mints one non-transferability-unrestricted receipt per investor.
    /// @param to Investor account receiving receipt on first deposit.
    function mintReceipt(address to) external {
        require(msg.sender == vault, "ONLY_VAULT");
        if (hasReceipt[to]) return;

        hasReceipt[to] = true;
        uint256 tokenId = ++totalSupply;
        ownerOf[tokenId] = to;
        balanceOf[to] += 1;
        emit Transfer(address(0), to, tokenId);
    }

    /// @notice Approves an operator for a specific token id.
    /// @param spender Approved spender.
    /// @param tokenId Token id being approved.
    function approve(address spender, uint256 tokenId) external {
        address owner = ownerOf[tokenId];
        require(owner != address(0), "NOT_MINTED");
        require(msg.sender == owner || isApprovedForAll[owner][msg.sender], "NOT_AUTHORIZED");
        getApproved[tokenId] = spender;
        emit Approval(owner, spender, tokenId);
    }

    /// @notice Approves/revokes operator for all sender tokens.
    /// @param operator Operator address.
    /// @param approved Boolean approved flag.
    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /// @notice Transfers a token id from `from` to `to`.
    /// @param from Current owner.
    /// @param to Recipient.
    /// @param tokenId Token id.
    function transferFrom(address from, address to, uint256 tokenId) public {
        address owner = ownerOf[tokenId];
        require(owner == from, "WRONG_FROM");
        require(to != address(0), "ZERO_TO");
        require(
            msg.sender == owner || msg.sender == getApproved[tokenId] || isApprovedForAll[owner][msg.sender],
            "NOT_AUTHORIZED"
        );

        delete getApproved[tokenId];
        ownerOf[tokenId] = to;
        balanceOf[from] -= 1;
        balanceOf[to] += 1;
        emit Transfer(from, to, tokenId);
    }

    /// @notice Safe transfer alias for demo simplicity.
    /// @param from Current owner.
    /// @param to Recipient.
    /// @param tokenId Token id.
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        transferFrom(from, to, tokenId);
    }

    /// @notice Safe transfer alias with unused data payload.
    /// @param from Current owner.
    /// @param to Recipient.
    /// @param tokenId Token id.
    /// @param data Arbitrary bytes payload.
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external {
        data;
        transferFrom(from, to, tokenId);
    }

    /// @notice Returns on-chain JSON metadata URI embedding the schedule id.
    /// @param tokenId The NFT id.
    /// @return uri Data URI string for demo metadata.
    function tokenURI(uint256 tokenId) external view returns (string memory uri) {
        require(ownerOf[tokenId] != address(0), "NOT_MINTED");
        uri = string(
            abi.encodePacked(
                "data:application/json,{\"name\":\"Cashflow Receipt #",
                _toString(tokenId),
                "\",\"description\":\"Investor participation receipt for CashflowVaults MVP\",",
                "\"attributes\":[{\"trait_type\":\"scheduleId\",\"value\":",
                _toString(scheduleId),
                "}]}"
            )
        );
    }

    /// @notice Converts uint to decimal string.
    /// @param value Integer input.
    /// @return str Decimal string output.
    function _toString(uint256 value) internal pure returns (string memory str) {
        if (value == 0) return "0";
        uint256 tmp = value;
        uint256 digits;
        while (tmp != 0) {
            digits++;
            tmp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        str = string(buffer);
    }
}
