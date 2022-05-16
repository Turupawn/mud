// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct Persona {
  uint256 personaId;
}

uint256 constant ID = uint256(keccak256("ember.component.personaComponent"));

contract PersonaComponent is Component {
  constructor(address world) Component(world) {}

  function getID() public pure override returns (uint256) {
    return ID;
  }

  function set(uint256 entity, Persona calldata value) public {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view returns (Persona memory) {
    uint256 persona = abi.decode(getRawValue(entity), (uint256));
    return Persona(persona);
  }

  function getEntitiesWithValue(Persona calldata persona) public view returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(persona));
  }
}
