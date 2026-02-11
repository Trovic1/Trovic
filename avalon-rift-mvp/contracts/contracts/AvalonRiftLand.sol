// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AvalonResourceToken.sol";

/// @title Avalon Rift Land Contract
/// @notice ERC721 land tiles with battle and resource-generation mechanics.
contract AvalonRiftLand is ERC721, Ownable2Step, ReentrancyGuard {
    error InvalidGridDimensions();
    error TileAlreadyMinted();
    error TileDoesNotExist();
    error NotTileOwner();
    error SameOwner();
    error NotAdjacent();
    error SelfAttack();
    error NoResourcesToClaim();

    struct TileData {
        uint64 power; // battle power score used during attacks
        uint64 productionRate; // resource units per second
        uint64 lastClaimedAt; // last timestamp used for resource accounting
    }

    uint256 public immutable gridWidth;
    uint256 public immutable gridHeight;

    AvalonResourceToken public immutable resourceToken;

    mapping(uint256 => TileData) public tileData;

    event TileMinted(
        uint256 indexed tileId,
        address indexed owner,
        uint64 power,
        uint64 productionRate,
        uint64 timestamp
    );
    event TileAttacked(
        uint256 indexed attackerTileId,
        uint256 indexed defenderTileId,
        address indexed attacker,
        bool attackerWon,
        uint256 randomness
    );
    event TileClaimed(uint256 indexed tileId, address indexed owner, uint256 amountClaimed, uint64 timestamp);

    constructor(
        address initialOwner,
        address resourceTokenAddress,
        uint256 width,
        uint256 height
    ) ERC721("Avalon Rift Land", "ARL") Ownable(initialOwner) {
        if (width == 0 || height == 0) revert InvalidGridDimensions();
        gridWidth = width;
        gridHeight = height;
        resourceToken = AvalonResourceToken(resourceTokenAddress);
    }

    /// @notice mints a tile in the world grid.
    function mintTile(
        address to,
        uint256 x,
        uint256 y,
        uint64 power,
        uint64 productionRate
    ) external onlyOwner {
        uint256 tileId = tileIdFromCoordinate(x, y);
        if (_ownerOf(tileId) != address(0)) revert TileAlreadyMinted();

        _safeMint(to, tileId);
        tileData[tileId] = TileData({power: power, productionRate: productionRate, lastClaimedAt: uint64(block.timestamp)});

        emit TileMinted(tileId, to, power, productionRate, uint64(block.timestamp));
    }

    /// @notice claim accumulated resources for a tile.
    function claimResources(uint256 tileId) public nonReentrant {
        if (_ownerOf(tileId) == address(0)) revert TileDoesNotExist();
        if (ownerOf(tileId) != msg.sender) revert NotTileOwner();

        uint256 claimable = pendingResources(tileId);
        if (claimable == 0) revert NoResourcesToClaim();

        tileData[tileId].lastClaimedAt = uint64(block.timestamp);
        resourceToken.mint(msg.sender, claimable);

        emit TileClaimed(tileId, msg.sender, claimable, uint64(block.timestamp));
    }

    /// @notice attack an adjacent enemy tile.
    function attack(uint256 attackerTileId, uint256 defenderTileId) external nonReentrant {
        if (attackerTileId == defenderTileId) revert SelfAttack();
        if (_ownerOf(attackerTileId) == address(0) || _ownerOf(defenderTileId) == address(0)) revert TileDoesNotExist();
        if (ownerOf(attackerTileId) != msg.sender) revert NotTileOwner();

        address defenderOwner = ownerOf(defenderTileId);
        if (defenderOwner == msg.sender) revert SameOwner();
        if (!_isAdjacent(attackerTileId, defenderTileId)) revert NotAdjacent();

        // settle resources on both tiles before power/ownership changes.
        _autoClaimToCurrentOwner(attackerTileId);
        _autoClaimToCurrentOwner(defenderTileId);

        TileData storage attacker = tileData[attackerTileId];
        TileData storage defender = tileData[defenderTileId];

        uint256 randomness = uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, block.timestamp, blockhash(block.number - 1), attackerTileId, defenderTileId)
            )
        ) % 100;

        uint256 attackerScore = uint256(attacker.power) + (randomness / 4); // up to +24
        uint256 defenderScore = uint256(defender.power) + ((99 - randomness) / 4);
        bool attackerWon = attackerScore >= defenderScore;

        if (attackerWon) {
            _transfer(defenderOwner, msg.sender, defenderTileId);

            if (attacker.power > 3) attacker.power -= 3;
            defender.power = defender.power + 2;
        } else {
            if (defender.power > 1) defender.power -= 1;
            attacker.power = attacker.power + 1;
        }

        emit TileAttacked(attackerTileId, defenderTileId, msg.sender, attackerWon, randomness);
    }

    function pendingResources(uint256 tileId) public view returns (uint256) {
        if (_ownerOf(tileId) == address(0)) revert TileDoesNotExist();
        TileData memory tile = tileData[tileId];

        uint256 elapsed = block.timestamp - tile.lastClaimedAt;
        return elapsed * uint256(tile.productionRate);
    }

    function tileIdFromCoordinate(uint256 x, uint256 y) public view returns (uint256) {
        if (x >= gridWidth || y >= gridHeight) revert InvalidGridDimensions();
        return (y * gridWidth) + x;
    }

    function coordinateFromTileId(uint256 tileId) public view returns (uint256 x, uint256 y) {
        if (tileId >= gridWidth * gridHeight) revert TileDoesNotExist();
        x = tileId % gridWidth;
        y = tileId / gridWidth;
    }

    function _isAdjacent(uint256 tileA, uint256 tileB) internal view returns (bool) {
        (uint256 ax, uint256 ay) = coordinateFromTileId(tileA);
        (uint256 bx, uint256 by) = coordinateFromTileId(tileB);

        uint256 deltaX = ax > bx ? ax - bx : bx - ax;
        uint256 deltaY = ay > by ? ay - by : by - ay;

        // 4-directional adjacency (N/S/E/W) for MVP clarity.
        return (deltaX + deltaY) == 1;
    }

    function _autoClaimToCurrentOwner(uint256 tileId) internal {
        address tileOwner = ownerOf(tileId);
        uint256 claimable = pendingResources(tileId);
        tileData[tileId].lastClaimedAt = uint64(block.timestamp);

        if (claimable != 0) {
            resourceToken.mint(tileOwner, claimable);
            emit TileClaimed(tileId, tileOwner, claimable, uint64(block.timestamp));
        }
    }
}
