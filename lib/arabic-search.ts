/**
 * Folds the spellings that differ only in writing, so searching for "احمد"
 * finds "أحمد" and "هياء" finds "هياه". The tree was entered by many hands
 * over many years, and whoever is searching it is typing from memory.
 *
 * Shared rather than duplicated: the family tree's own search and the father
 * picker have to agree about what matches what, or the same name will be
 * findable in one place and not the other.
 */
export const normalizeArabic = (value: string) =>
  value
    .replace(/[ً-ْـٰ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ؤئ]/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Matching form: the above with the spaces taken out too.
 *
 * "عبد الله" and "عبدالله" are the same name written two ways, and both are in
 * the records. Comparing without spaces means whichever way it is typed finds
 * both, at the cost of a query occasionally spanning a word boundary — a fair
 * trade when the alternative is finding nobody.
 */
export const searchKey = (value: string) => normalizeArabic(value).replace(/ /g, "");
