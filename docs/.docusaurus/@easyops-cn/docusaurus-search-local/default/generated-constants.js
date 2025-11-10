import lunr from "/home/roib/github/CALMe/docs/node_modules/lunr/lunr.js";
require("/home/roib/github/CALMe/docs/node_modules/lunr-languages/lunr.stemmer.support.js")(
  lunr,
);
require("/home/roib/github/CALMe/docs/node_modules/lunr-languages/lunr.he.js")(
  lunr,
);
require("/home/roib/github/CALMe/docs/node_modules/lunr-languages/lunr.multi.js")(
  lunr,
);
export const removeDefaultStopWordFilter = [];
export const language = ["en", "he"];
export const searchIndexUrl = "search-index{dir}.json?_=4e51ab43";
export const searchResultLimits = 8;
export const fuzzyMatchingDistance = 1;
