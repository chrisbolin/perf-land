import { keyBy } from "lodash";
import { useEffect } from "react";

const API_ROOT =
  "https://us-central1-web-performance-273818.cloudfunctions.net/function-1";

const RECEIVE_SITES = "RECEIVE_SITES";
const ADD_SELECTED_URL = "ADD_SELECTED_URL";
const REMOVE_SELECTED_URL = "REMOVE_SELECTED_URL";
const CLEAR_ALL_SELECTED_URLS = "CLEAR_ALL_SELECTED_URLS";
const SELECT_PRESET_URLS = "SELECT_PRESET_URLS";
const CHANGE_HIGHLIGHTED_URL = "CHANGE_HIGHLIGHTED_URL";

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
  lululemon: [
    "https://shop.lululemon.com/",
    "https://www.target.com/",
    "https://www.nike.com/",
    "https://shop.nordstrom.com/",
    "https://www.amazon.com/",
    "https://www.mercadolivre.com.br/",
  ],
};

export interface Site {
  url: string;
  cdn: string;
  startedDateTime: string;
  [otherKey: string]: string;
}

export interface Sites {
  [key: string]: Site;
}

interface State {
  highlightedUrl: string;
  sites: Sites;
  urls: string[];
  selectedUrls: Set<string>;
}

export const initialState: State = {
  selectedUrls: new Set(presets.airlines),
  highlightedUrl: presets.airlines[0],
  sites: {},
  urls: [],
};

// action types

interface BareAction {
  type: typeof CLEAR_ALL_SELECTED_URLS;
}

interface StringAction {
  type:
    | typeof ADD_SELECTED_URL
    | typeof REMOVE_SELECTED_URL
    | typeof CHANGE_HIGHLIGHTED_URL;
  payload: string;
}

export type PresetName = "airlines" | "news" | "social media" | "lululemon";

interface SelectPresetAction {
  type: typeof SELECT_PRESET_URLS;
  payload: PresetName;
}

interface ReceiveSitesAction {
  type: typeof RECEIVE_SITES;
  payload: Sites;
}

type Action =
  | ReceiveSitesAction
  | SelectPresetAction
  | StringAction
  | BareAction;

// reducer

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case RECEIVE_SITES: {
      const sites = action.payload;
      return {
        ...state,
        sites: { ...state.sites, ...sites },
        urls: Object.keys(sites),
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

export const receiveSites = (sites: Sites) => ({
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

const selectedSites = (state: State) =>
  Array.from(state.selectedUrls.keys()).flatMap((url) => {
    const site = state.sites[url];
    return site ? [site] : [];
  });

export const selectors = { selectedSites };

// effects

const useSelectedSites = (state: State, dispatch: React.Dispatch<Action>) => {
  useEffect(() => {
    const url = `${API_ROOT}?url=${Array.from(state.selectedUrls).join(",")}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        dispatch(actions.receiveSites(keyBy(data, "url")));
      });
  }, [dispatch, state.selectedUrls]);
};

export const effects = { useSelectedSites };
