import {
  promptAddCharacter,
  promptRemoveCharacter,
  promptMoveCharacter,
  promptAddMultipleCharacters,
  promptRemoveMultipleCharacters,
  printCharacters,
  printMessage,
} from "./ui.js";

import { fetchAndCreateCharacter, fetchMultipleCharacters } from "./swapi.js";

import {
  saveCharacter,
  removeCharacter,
  findCharacterByName,
  updateMultipleCharacterIndexes,
  updateCharacterIndexes,
  sortCharacterIndexes,
} from "./mongodb.js";

export const addStarWarsCharacter = async () => {
  try {
    const characterName = promptAddCharacter();
    const characterData = await fetchAndCreateCharacter(characterName);
    if (characterData) {
      await saveCharacter(characterData.name);
      printMessage(
        `Character "${characterData.name}" has been added to the database!`
      );
    } else {
      printMessage(`Character "${characterName}" was not found.`);
    }
    await updateCharacterIndexes();
  } catch (error) {
    console.error("Error adding Star Wars character:", error);
  }
};

export const removeStarWarsCharacter = async () => {
  try {
    const nameToRemove = promptRemoveCharacter();
    const removeResult = await removeCharacter(nameToRemove);
    printMessage(
      removeResult
        ? `Character "${nameToRemove}" has been removed.`
        : `Character "${nameToRemove}" was not found.`
    );
    await updateCharacterIndexes();
  } catch (error) {
    console.error("Error removing Star Wars character:", error);
  }
};

//Refactor for simplicity and readability
export const moveStarWarsCharacter = async () => {
  try {
    const [nameToMove, toNewIndex] = promptMoveCharacter(); // get name from user
    await handleCharacterMovement(nameToMove, toNewIndex);
  } catch (error) {
    console.error("Error moving Star Wars character:", error);
  }
};

export const handleCharacterMovement = async (nameToMove, toNewIndex) => {
  try {
    const characterToMove = await getCharacterToMove(nameToMove);
    if (characterToMove) {
      await moveCharacterToNewIndex(characterToMove, toNewIndex);
    } else {
      printMessage(`Character "${nameToMove}" was not found`);
    }
  } catch (error) {
    console.error("Error handle character movement:", error);
  }
};

export const getCharacterToMove = async (name) => {
  try {
    const characterToMove = await findCharacterByName(name);
    return characterToMove;
  } catch (error) {
    console.error("Error getting character to move:", error);
  }
};

//Refactor for simplicity and readability
export const moveCharacterToNewIndex = async (characterToMove, newIndexInt) => {
  try {
    const query = {
      index: {
        $gte: Math.min(characterToMove.index, newIndexInt),
        $lte: Math.max(characterToMove.index, newIndexInt),
      },
    };
    const update = {
      $inc: { index: characterToMove.index < newIndexInt ? -1 : 1 },
    };
    await updateMultipleCharacterIndexes(query, update);
    characterToMove.index = newIndexInt;
    await characterToMove.save();
    await updateCharacterIndexes();
    printMessage(
      `Character "${characterToMove.name}" moved successfully to index ${newIndexInt}`
    );
  } catch (error) {
    console.error("Error moving character to new index:", error);
  }
};

export const addMultipleCharacters = async (count) => {
  try {
    const namesArray = promptAddMultipleCharacters(count);
    const charactersData = await fetchMultipleCharacters(namesArray);
    for (const characterData of charactersData) {
      await saveCharacter(characterData.name);
    }
    const characterNames = charactersData
      .map((character) => character.name)
      .join(", ");
    printMessage(`Characters "${characterNames}" have been added.`);
    await updateCharacterIndexes();
  } catch (error) {
    console.error("Error adding multiple characters:", error);
  }
};

export const removeMultipleCharacters = async (count) => {
  try {
    const namesArray = promptRemoveMultipleCharacters(count);
    for (const name of namesArray) {
      await removeCharacter(name);
    }
    await updateCharacterIndexes();
  } catch (error) {
    console.error("Error removing multiple characters:", error);
  }
};

export const listStarWarsCharacters = async () => {
  try {
    const sortedCharacters = await sortCharacterIndexes();
    printCharacters(sortedCharacters);
  } catch (error) {
    console.error("Error listing Star Wars characters:", error);
  }
};
