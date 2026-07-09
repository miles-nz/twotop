export {
    draftKeys,
    STAR_PATH,
    placeholders,
    randomPlaceholder,
} from "./constants";
export { preferences } from "./preferences";
export { enums } from "./enums";
export { tutorial } from "./tutorial";

import { textGlobal } from "./text.global";
import { textReviews } from "./text.reviews";
import { textLists } from "./text.lists";
import { textProfile } from "./text.profile";
import { textNotifications } from "./text.notifications";

// Merge all text domains into a single `text` object,
// maintaining the existing import shape: import { text } from "../resources"
export const text = {
    ...textGlobal,
    ...textReviews,
    ...textLists,
    ...textProfile,
    ...textNotifications,
};
