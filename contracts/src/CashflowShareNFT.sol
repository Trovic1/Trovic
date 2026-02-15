// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CashflowShareNFT
/// @notice Optional demo-only ERC721 receipt for first-time investor participation.
contract CashflowShareNFT {
    /// @notice Emitted when ownership changes for a token.
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    string public constant name = "Cashflow Participation Receipt";
    string public constant symbol = "CFSR";

    uint256 public nextTokenId = 1;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(address => bool) public hasReceipt;
    mapping(uint256 => uint256) public scheduleIdOf;
    mapping(uint256 => string) private _tokenUris;

    /// @notice Mints a single receipt NFT for an investor on their first deposit.
    /// @param investor Investor receiving the receipt.
    /// @param scheduleId Demo schedule identifier referenced by metadata.
    /// @param metadataUri Token metadata URI.
    /// @return tokenId Newly minted token id.
    function mintFirstDepositReceipt(
        address investor,
        uint256 scheduleId,
        string calldata metadataUri
    ) external returns (uint256 tokenId) {
        require(investor != address(0), "ZERO_INVESTOR");
        require(!hasReceipt[investor], "ALREADY_MINTED");

        tokenId = nextTokenId++;
        ownerOf[tokenId] = investor;
        balanceOf[investor] += 1;
        hasReceipt[investor] = true;
        scheduleIdOf[tokenId] = scheduleId;
        _tokenUris[tokenId] = metadataUri;

        emit Transfer(address(0), investor, tokenId);
    }

    /// @notice Returns metadata URI for a token.
    /// @param tokenId Token id to query.
    /// @return uri Metadata URI string.
    function tokenURI(uint256 tokenId) external view returns (string memory uri) {
        require(ownerOf[tokenId] != address(0), "NOT_MINTED");
        return _tokenUris[tokenId];
    }
}
