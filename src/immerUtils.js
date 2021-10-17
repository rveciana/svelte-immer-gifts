
import { allUsers, getCurrentUser } from "./misc/users";
import produce, { produceWithPatches, applyPatches } from "immer";
import defaultGifts from "./misc/gifts";

export const giftsRecipe = (draft, action) => {
  switch (action.type) {
    case "ADD_GIFT":
      const { id, description, image } = action
      draft.gifts.push({
        id,
        description,
        image,
        reservedBy: undefined
      })
      break
    case "TOGGLE_RESERVATION":
      const gift = draft.gifts.find(gift => gift.id === action.id)
      
      gift.reservedBy =
        gift.reservedBy === undefined
          ? draft.currentUser.id
          : gift.reservedBy === draft.currentUser.id
          ? undefined
          : gift.reservedBy
      break
    case "ADD_BOOK":
      const { book } = action
      draft.gifts.push({
        id: book.identifiers.isbn_10[0],
        description: book.title,
        image: book.cover.medium,
        reservedBy: undefined
      })
      break
    case "RESET":
      return getInitialState()
    case "APPLY_PATCHES":
      return applyPatches(draft, action.patches)
  }
}

export const giftsReducer = produce(giftsRecipe);

export const patchGeneratingGiftsReducer = produceWithPatches(giftsRecipe);

export async function getBookDetails(isbn) {
  const response = await fetch(`http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`, {
    mode: "cors"
  })
  const book = (await response.json())["ISBN:" + isbn]
  return book
}

export function getInitialState() {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts
  }
}