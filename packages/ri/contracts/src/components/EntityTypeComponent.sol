// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct EntityType {
  uint256 entityType;
}

uint256 constant ID = uint256(keccak256("ember.component.entityTypeComponent"));

contract EntityTypeComponent is Component {
  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }

  function set(uint256 entity, EntityType calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (EntityType memory) {
    uint256 entityType = abi.decode(getRawValue(entity), (uint256));
    return EntityType(entityType);
  }

  function getEntitiesWithValue(EntityType calldata position) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(position));
  }
}
