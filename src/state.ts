const RECEIVE_SITES = "RECEIVE_SITES";
const ADD_SELECTED_URL = "ADD_SELECTED_URL";
const REMOVE_SELECTED_URL = "REMOVE_SELECTED_URL";
const CLEAR_ALL_SELECTED_URLS = "CLEAR_ALL_SELECTED_URLS";
const SELECT_PRESET_URLS = "SELECT_PRESET_URLS";
const CHANGE_HIGHLIGHTED_URL = "CHANGE_HIGHLIGHTED_URL";

export const presets = {
  airlines: [
    "www.united.com",
    "www.southwest.com",
    "www.delta.com",
    "www.jetblue.com",
    "www.alaskaair.com",
    "www.flyfrontier.com",
  ],
  news: [
    "www.aljazeera.com",
    "www.latimes.com",
    "app.nytimes.com",
    "www.theatlantic.com",
    "www.bbc.co.uk",
  ],
  "social media": [
    "m.facebook.com",
    "twitter.com",
    "www.instagram.com",
    "www.pinterest.com",
  ],
  lululemon: [
    "shop.lululemon.com",
    "www.target.com",
    "www.nike.com",
    "shop.nordstrom.com",
    "www.amazon.com",
    "www.mercadolivre.com.br",
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

const selectedSites = (state: State) =>
  Array.from(state.selectedUrls.keys()).map((url) => state.sites[url]);

export const selectors = { selectedSites };

export const initialState: State = {
  highlightedUrl: "",
  sites: {},
  urls: [],
  selectedUrls: new Set(),
};
