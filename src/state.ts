import { keyBy, union } from "lodash";
import { useEffect } from "react";

const API_ROOT =
  "https://us-central1-web-performance-273818.cloudfunctions.net/function-1";

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
};

interface Site {
  url: string;
  cdn: string;
  startedDateTime: string;
  [otherKey: string]: string;
}

export interface AugmentedSite extends Site {
  name: string;
}

interface SitesMap {
  [key: string]: Site;
}

interface State {
  highlightedUrl: string;
  sites: SitesMap;
  urls: string[];
  selectedUrls: Set<string>;
  search: string;
}

export const initialState: State = {
  selectedUrls: new Set(presets.airlines),
  highlightedUrl: presets.airlines[0],
  sites: {},
  urls: [],
  search: "",
};

// action types

const RECEIVE_SITES = "RECEIVE_SITES";
const RECEIVE_URLS = "RECEIVE_URLS";
const ADD_SELECTED_URL = "ADD_SELECTED_URL";
const REMOVE_SELECTED_URL = "REMOVE_SELECTED_URL";
const CLEAR_ALL_SELECTED_URLS = "CLEAR_ALL_SELECTED_URLS";
const SELECT_PRESET_URLS = "SELECT_PRESET_URLS";
const CHANGE_HIGHLIGHTED_URL = "CHANGE_HIGHLIGHTED_URL";
const CHANGE_SEARCH = "CHANGE_SEARCH";

interface BareAction {
  type: typeof CLEAR_ALL_SELECTED_URLS;
}

interface StringAction {
  type:
    | typeof ADD_SELECTED_URL
    | typeof REMOVE_SELECTED_URL
    | typeof CHANGE_SEARCH
    | typeof CHANGE_HIGHLIGHTED_URL;
  payload: string;
}

export type PresetName =
  | "airlines"
  | "news"
  | "social media"
  | "shopping"
  | "fast food";

interface SelectPresetAction {
  type: typeof SELECT_PRESET_URLS;
  payload: PresetName;
}

interface ReceiveSitesAction {
  type: typeof RECEIVE_SITES;
  payload: Site[];
}

interface ReceiveUrlsAction {
  type: typeof RECEIVE_URLS;
  payload: string[];
}

type Action =
  | ReceiveUrlsAction
  | ReceiveSitesAction
  | SelectPresetAction
  | StringAction
  | BareAction;

// reducer

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case RECEIVE_URLS: {
      return {
        ...state,
        urls: union([...state.urls, ...action.payload]),
      };
    }
    case RECEIVE_SITES: {
      const newSites = keyBy(action.payload, "url");
      const newUrls = Object.keys(newSites);

      return {
        ...state,
        sites: { ...state.sites, ...newSites },
        urls: union([...state.urls, ...newUrls]),
      };
    }
    case ADD_SELECTED_URL: {
      const selectedUrls = new Set(state.selectedUrls);
      selectedUrls.add(action.payload);
      return { ...state, selectedUrls };
    }
    case REMOVE_SELECTED_URL: {
      const selectedUrls = new Set(state.selectedUrls);
      selectedUrls.delete(action.payload);
      return { ...state, selectedUrls };
    }
    case CLEAR_ALL_SELECTED_URLS: {
      return { ...state, selectedUrls: new Set() };
    }
    case SELECT_PRESET_URLS: {
      const urls = presets[action.payload];
      const selectedUrls = new Set(urls);
      return { ...state, selectedUrls, highlightedUrl: urls[0] };
    }
    case CHANGE_HIGHLIGHTED_URL: {
      return { ...state, highlightedUrl: action.payload };
    }
    case CHANGE_SEARCH: {
      return { ...state, search: action.payload };
    }
  }
}

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
  type: SELECT_PRESET_URLS as typeof SELECT_PRESET_URLS,
  payload: presetName,
});

export const receiveSites = (sites: Site[]) => ({
  type: RECEIVE_SITES as typeof RECEIVE_SITES,
  payload: sites,
});

export const actions = {
  changeHighlightSite,
  removeHighlightSite,
  addUrl,
  removeUrl,
  clearAllSelectedUrls,
  selectPresetUrls,
  receiveSites,
};

// selectors

const augmentSite = (site: Site): AugmentedSite => {
  const name = site.url
    .replace(/http.*:\/\//, "") // remove protocol
    .replace(/\/$/, ""); // remove trailing slash

  return {
    ...site,
    name,
  };
};

const selectedSites = (state: State): AugmentedSite[] =>
  Array.from(state.selectedUrls.keys())
    .flatMap((url) => {
      const site = state.sites[url];
      return site ? [site] : [];
    })
    .map(augmentSite);

export const selectors = { selectedSites };

// effects

const useSelectedSites = (state: State, dispatch: React.Dispatch<Action>) => {
  useEffect(() => {
    const urlsWithoutData = Array.from(state.selectedUrls).filter(
      (url) => !state.sites[url]
    );

    if (!urlsWithoutData.length) return;

    const requestUrl = `${API_ROOT}?url=${urlsWithoutData.join(",")}`;
    fetch(requestUrl)
      .then((res) => res.json())
      .then((data) => {
        dispatch(actions.receiveSites(data));
      });
  }, [dispatch, state.selectedUrls, state.sites]);
};

const SEARCH_RESULTS_COUNT_THRESHOLD = 10;
const MIN_SEARCH_STRING_LENGTH = 5;

const searchForUrls = (
  state: State,
  dispatch: React.Dispatch<Action>,
  search: string
) => {
  dispatch({
    type: CHANGE_SEARCH as typeof CHANGE_SEARCH,
    payload: search,
  });

  if (search.length < MIN_SEARCH_STRING_LENGTH) return;

  const found = state.urls.filter((url) => url.includes(search));
  if (found.length > SEARCH_RESULTS_COUNT_THRESHOLD) return;

  const requestUrl = `${API_ROOT}?search=${search}`;
  fetch(requestUrl)
    .then((res) => res.json())
    .then((urls) => {
      dispatch({
        type: RECEIVE_URLS,
        payload: urls,
      });
    });
};

export const effects = { useSelectedSites, searchForUrls };
