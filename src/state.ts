import {
  cloneDeep,
  debounce,
  keyBy,
  orderBy,
  pick,
  omit,
  unionBy,
} from "lodash";
import { useEffect } from "react";
import colors from "colorkind/dist/12";

const API_ROOT =
  "https://us-central1-web-performance-273818.cloudfunctions.net/function-1";
const SEARCH_RESULTS_COUNT_THRESHOLD = 5;
export const MIN_SEARCH_STRING_LENGTH = 5;
const DEBOUNCE_SEARCH_TIME_MS = 150;

export const presets = {
  airlines: [
    "https://www.united.com/",
    "https://www.southwest.com/",
    "https://www.delta.com/",
    "https://www.jetblue.com/",
    "https://m.alaskaair.com/",
    "https://www.flyfrontier.com/",
  ],
  news: [
    "https://www.aljazeera.com/",
    "https://www.latimes.com/",
    "https://app.nytimes.com/",
    "https://www.theatlantic.com/",
    "https://www.bbc.co.uk/",
  ],
  "social media": [
    "https://m.facebook.com/",
    "https://twitter.com/",
    "https://www.instagram.com/",
    "https://www.pinterest.com/",
  ],
  shopping: [
    "https://shop.lululemon.com/",
    "https://www.target.com/",
    "https://www.nike.com/",
    "https://shop.nordstrom.com/",
    "https://www.amazon.com/",
    "https://www.mercadolivre.com.br/",
  ],
  "fast food": [
    "https://www.bk.com/",
    "https://www.popeyes.com/",
    "https://www.starbucks.com/",
    "https://www.timhortons.ca/",
    "https://www.mcdonalds.com/",
    "https://www.wendys.com/",
    "https://www.dominos.com/",
  ],
  "pet food": [
    "https://www.chewy.com/",
    "https://www.petsmart.com/",
    "https://www.1800petmeds.com/",
    "https://www.petflow.com/",
  ],
};

export type PresetName = keyof typeof presets;

interface Site {
  url: string;
  cdn: string;
  startedDateTime: number;
  rank2017: number;
  reqTotal: number;
  reqHtml: number;
  reqJS: number;
  reqCSS: number;
  reqImg: number;
  bytesTotal: number;
  bytesHtml: number;
  bytesJS: number;
  bytesCSS: number;
  bytesImg: number;
  TTFB: number;
  performanceScore: number;
  firstContentfulPaint: number;
  maxPotentialFirstInputDelay: number;
  speedIndex: number;
  firstMeaningfulPaint: number;
  firstCPUIdle: number;
  timeToInteractive: number;
}

export interface AugmentedSite extends Site {
  name: string;
  color: string;
}

interface UrlDetails {
  url: string;
  rank2017: number;
}

interface SitesMap {
  [key: string]: Site;
}

interface CollectionSite {
  url: string;
}

interface Collection {
  sites: CollectionSite[];
  name: string;
}

interface SavedCollections {
  [name: string]: Collection;
}

interface State {
  highlightedUrl: string;
  sites: SitesMap;
  urls: UrlDetails[];
  currentCollection: Collection;
  search: string;
  savedCollections: SavedCollections;
  pendingSearches: string[];
}

const initialState: State = {
  highlightedUrl: "",
  sites: {},
  urls: [],
  search: "",
  currentCollection: { name: "", sites: [] },
  savedCollections: {},
  pendingSearches: [],
};

const STATE_LOCAL_STORAGE_KEY = "userState";

const saveUserState = (state: State) => {
  try {
    localStorage.setItem(
      STATE_LOCAL_STORAGE_KEY,
      JSON.stringify(
        pick(state, "highlightedUrl", "currentCollection", "savedCollections")
      )
    );
  } catch (e) {
    console.error("Failed to save user state", state, e);
  }
};
const loadUserState = () => {
  try {
    return JSON.parse(localStorage.getItem(STATE_LOCAL_STORAGE_KEY) || "{}");
  } catch (e) {
    console.error("Failed to loadUserState", e);
    return {};
  }
};

export const initializeState = (): State => {
  return {
    ...reducer(initialState, initialAction),
    ...loadUserState(),
  };
};

// action types

const RECEIVE_SITES = "RECEIVE_SITES";
const SEARCH_CHANGE = "SEARCH_CHANGE";
const SEARCH_START = "SEARCH_START";
const SEARCH_SUCCESS = "SEARCH_SUCCESS";
const SEARCH_FAILURE = "SEARCH_FAILURE";
const ADD_SELECTED_URL = "ADD_SELECTED_URL";
const REMOVE_SELECTED_URL = "REMOVE_SELECTED_URL";
const CLEAR_ALL_SELECTED_URLS = "CLEAR_ALL_SELECTED_URLS";
const SELECT_PRESET = "SELECT_PRESET";
const CHANGE_HIGHLIGHTED_URL = "CHANGE_HIGHLIGHTED_URL";
const SAVE_COLLECTION = "SAVE_COLLECTION";
const SELECT_COLLECTION = "SELECT_COLLECTION";
const DELETE_COLLECTION = "DELETE_COLLECTION";

const initialAction: Action = {
  type: SELECT_PRESET,
  payload: "fast food",
};

interface BareAction {
  type: typeof CLEAR_ALL_SELECTED_URLS;
}

interface StringAction {
  type:
    | typeof ADD_SELECTED_URL
    | typeof REMOVE_SELECTED_URL
    | typeof SEARCH_START
    | typeof SEARCH_CHANGE
    | typeof SEARCH_FAILURE
    | typeof SELECT_COLLECTION
    | typeof SAVE_COLLECTION
    | typeof DELETE_COLLECTION
    | typeof CHANGE_HIGHLIGHTED_URL;
  payload: string;
}

interface SelectPresetAction {
  type: typeof SELECT_PRESET;
  payload: PresetName;
}

interface ReceiveSitesAction {
  type: typeof RECEIVE_SITES;
  payload: Site[];
}

interface SearchSuccessAction {
  type: typeof SEARCH_SUCCESS;
  payload: { urlDetails: UrlDetails[]; search: string };
}

type Action =
  | SearchSuccessAction
  | ReceiveSitesAction
  | SelectPresetAction
  | StringAction
  | BareAction;

// reducer

const mergeUrlLists = (listA: UrlDetails[], listB: UrlDetails[]) =>
  orderBy(unionBy(listA, listB, "url"), ({ url, rank2017 }) => {
    const httpPenalty = url.startsWith("http://") ? 1 : 0;
    const lengthPenalty = url.length / 255;
    return rank2017 + 0.5 * httpPenalty + 0.5 * lengthPenalty;
  });

const removeOneMatch = (list: string[], item: string) => {
  const listCopy = [...list];
  const removeIndex = listCopy.indexOf(item);
  if (removeIndex > -1) {
    listCopy.splice(removeIndex, 1);
  }
  return listCopy;
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SEARCH_CHANGE: {
      return {
        ...state,
        search: action.payload,
      };
    }
    case SEARCH_START: {
      return {
        ...state,
        pendingSearches: [...state.pendingSearches, action.payload],
      };
    }
    case SEARCH_SUCCESS: {
      const { urlDetails, search } = action.payload;
      const pendingSearches = removeOneMatch(state.pendingSearches, search);

      return {
        ...state,
        urls: mergeUrlLists(state.urls, urlDetails),
        pendingSearches,
      };
    }
    case SEARCH_FAILURE: {
      const pendingSearches = removeOneMatch(
        state.pendingSearches,
        action.payload
      );
      return {
        ...state,
        pendingSearches,
      };
    }
    case RECEIVE_SITES: {
      const newSites = keyBy(action.payload, "url");
      const newUrls = action.payload.map(({ url, rank2017 }) => ({
        url,
        rank2017,
      }));

      return {
        ...state,
        sites: { ...state.sites, ...newSites },
        urls: mergeUrlLists(state.urls, newUrls),
      };
    }
    case ADD_SELECTED_URL: {
      const currentCollection = cloneDeep(state.currentCollection);
      currentCollection.sites.push({ url: action.payload });
      return { ...state, search: "", currentCollection };
    }
    case REMOVE_SELECTED_URL: {
      const currentCollection = cloneDeep(state.currentCollection);
      currentCollection.sites = currentCollection.sites.filter(
        ({ url }) => url !== action.payload
      );
      return { ...state, currentCollection };
    }
    case CLEAR_ALL_SELECTED_URLS: {
      return {
        ...state,
        currentCollection: initialState.currentCollection,
      };
    }
    case SELECT_PRESET: {
      const urls = presets[action.payload];
      const collection: Collection = {
        name: action.payload,
        sites: urls.map((url) => ({ url })),
      };
      return {
        ...state,
        highlightedUrl: urls[0],
        currentCollection: collection,
      };
    }
    case CHANGE_HIGHLIGHTED_URL: {
      return { ...state, highlightedUrl: action.payload };
    }
    case SAVE_COLLECTION: {
      const collectionName = action.payload;
      const currentCollection = {
        ...cloneDeep(state.currentCollection),
        name: collectionName,
      };
      const savedCollections = {
        ...state.savedCollections,
        [collectionName]: currentCollection,
      };
      // save to savedCollections _and_ update currentCollection
      return { ...state, savedCollections, currentCollection };
    }
    case DELETE_COLLECTION: {
      const savedCollections = omit(state.savedCollections, action.payload);
      return { ...state, savedCollections };
    }
    case SELECT_COLLECTION: {
      const presetName = action.payload;
      const currentCollection =
        state.savedCollections[presetName] || state.currentCollection;
      return { ...state, currentCollection };
    }
  }
};

// actions

const changeHighlightSite = (url: string) => ({
  type: CHANGE_HIGHLIGHTED_URL as typeof CHANGE_HIGHLIGHTED_URL,
  payload: url,
});

const removeHighlightSite = () => ({
  type: CHANGE_HIGHLIGHTED_URL as typeof CHANGE_HIGHLIGHTED_URL,
  payload: "",
});

const addUrl = (url: string) => ({
  type: ADD_SELECTED_URL as typeof ADD_SELECTED_URL,
  payload: url,
});

const removeUrl = (url: string) => ({
  type: REMOVE_SELECTED_URL as typeof REMOVE_SELECTED_URL,
  payload: url,
});

const clearAllSelectedUrls = () => ({
  type: CLEAR_ALL_SELECTED_URLS as typeof CLEAR_ALL_SELECTED_URLS,
});

const selectPresetUrls = (presetName: PresetName) => ({
  type: SELECT_PRESET as typeof SELECT_PRESET,
  payload: presetName,
});

const receiveSites = (sites: Site[]) => ({
  type: RECEIVE_SITES as typeof RECEIVE_SITES,
  payload: sites,
});

const selectCollection = (collectionName: string) => ({
  type: SELECT_COLLECTION as typeof SELECT_COLLECTION,
  payload: collectionName,
});

const saveCollection = (collectionName: string) => ({
  type: SAVE_COLLECTION as typeof SAVE_COLLECTION,
  payload: collectionName,
});

const deleteCollection = (collectionName: string) => ({
  type: DELETE_COLLECTION as typeof DELETE_COLLECTION,
  payload: collectionName,
});

export const actions = {
  changeHighlightSite,
  removeHighlightSite,
  addUrl,
  removeUrl,
  clearAllSelectedUrls,
  selectPresetUrls,
  receiveSites,
  selectCollection,
  saveCollection,
  deleteCollection,
};

// selectors

const augmentSite = (site: Site, index: number): AugmentedSite => {
  let name = site.url
    .replace(/http.*:\/\//, "") // remove protocol
    .replace(/\/$/, ""); // remove trailing slash

  if (site.url.startsWith("http:")) {
    name = name + " (http)";
  }

  return {
    ...site,
    name,
    color: colors[index] || "black",
  };
};

const currentSites = (state: State): AugmentedSite[] =>
  state.currentCollection.sites
    .flatMap(({ url }) => {
      const site = state.sites[url];
      return site ? [site] : [];
    })
    .map(augmentSite);

const viewingSavedCollection = (state: State): boolean =>
  !!state.savedCollections[state.currentCollection.name];

const searching = (state: State): boolean => state.pendingSearches.length > 0;

export const selectors = { currentSites, viewingSavedCollection, searching };

// effects

const useSelectedSites = (state: State, dispatch: React.Dispatch<Action>) => {
  useEffect(() => {
    const urlsWithoutData = state.currentCollection.sites
      .map(({ url }) => url)
      .filter((url) => !state.sites[url]);

    if (!urlsWithoutData.length) return;

    const requestUrl = `${API_ROOT}?url=${urlsWithoutData.join(",")}`;
    fetch(requestUrl)
      .then((res) => res.json())
      .then((data) => {
        dispatch(actions.receiveSites(data));
      });
  }, [dispatch, state.currentCollection.sites, state.sites]);
};

const usePersistState = (state: State) => {
  useEffect(() => {
    saveUserState(state);
  });
};

const debounceSearchNetworkRequest = debounce(
  (fun) => fun(),
  DEBOUNCE_SEARCH_TIME_MS
);

const searchForUrls = (
  state: State,
  dispatch: React.Dispatch<Action>,
  search: string
) => {
  dispatch({
    type: SEARCH_CHANGE,
    payload: search,
  });

  if (search.length < MIN_SEARCH_STRING_LENGTH) return;

  const found = state.urls.filter(({ url }) => url.includes(search));
  if (found.length > SEARCH_RESULTS_COUNT_THRESHOLD) return;

  const requestUrl = `${API_ROOT}?search2=${search}`;
  debounceSearchNetworkRequest(() => {
    dispatch({
      type: SEARCH_START,
      payload: search,
    });
    return fetch(requestUrl)
      .then((res) => res.json())
      .then((urls) => {
        dispatch({
          type: SEARCH_SUCCESS,
          payload: { urlDetails: urls, search },
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch({
          type: SEARCH_FAILURE,
          payload: search,
        });
      });
  });
};

export const effects = { useSelectedSites, usePersistState, searchForUrls };
