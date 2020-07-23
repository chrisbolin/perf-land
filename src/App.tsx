import React, { useReducer } from "react";
import styled from "styled-components/macro";

import {
  PresetName,
  reducer,
  initializeState,
  selectors,
  actions,
  presets,
  effects,
  MIN_SEARCH_STRING_LENGTH,
} from "./state";

import ActiveSiteList from "./components/ActiveSiteList";
import Button from "./components/Button";
import Chart from "./components/Chart";
import Collections from "./components/Collections";
import Heading from "./components/Heading";
import Hero from "./components/Hero";
import SavedCollectionButtons from "./components/SavedCollectionButtons";
import Sidebar from "./components/Sidebar";
import SiteDetailsTable from "./components/SiteDetailsTable";
import StyledSelect from "./components/StyledSelect";

declare global {
  interface Window {
    state: any;
  }
}

function LoadingSites() {
  return <div>loading...</div>;
}

const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(10)}
    ${(props) => props.theme.spacing(6)} 0;
`;

const Layout = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  margin-top: ${(props) => props.theme.spacing(16)};
  padding-top: ${(props) => props.theme.spacing(4)};
  padding-bottom: ${(props) => props.theme.spacing(8)};

  background-color: ${(props) => props.theme.colors.lightNeutral};
`;

const Content = styled.div`
  flex: 1 1 auto;
`;

const ContentHeader = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  padding-right: ${(props) => props.theme.spacing(1.5)};
`;

const Charts = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

const Footer = styled.footer`
  text-align: center;
  margin: ${(props) => props.theme.spacing(8)} 0;
`;

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initializeState);

  window.state = state;

  const { highlightedUrl, savedCollections, urls } = state;
  const currentSites = selectors.currentSites(state);
  const viewingSavedCollection = selectors.viewingSavedCollection(state);
  const searching = selectors.searching(state);
  const loadingSites = selectors.loadingSites(state);

  // effects

  effects.useSelectedSites(state, dispatch);
  effects.usePersistState(state);

  // event handlers
  const promptAndSaveCollection = () => {
    const name = viewingSavedCollection
      ? state.currentCollection.name
      : prompt("Save as");

    if (name) {
      dispatch(actions.saveCollection(name));
    }
  };

  const hasUrls = !!urls.length;
  const hasName = !!state.currentCollection.name;

  return (
    <React.Fragment>
      <Wrapper>
        <Hero />
      </Wrapper>

      <Layout>
        <Sidebar>
          <Heading as="h3" size="small">
            My Lists
          </Heading>
          <Collections
            activeCollection={state.currentCollection.name}
            collections={savedCollections}
            onClick={(name: string) => dispatch(actions.selectCollection(name))}
            activeSites={
              <React.Fragment>
                {loadingSites ? <LoadingSites /> : null}
                <ActiveSiteList
                  hasUrls={hasUrls}
                  highlightedUrl={highlightedUrl}
                  sites={currentSites}
                  onClickHighlight={(siteUrl: string) =>
                    dispatch(actions.changeHighlightSite(siteUrl))
                  }
                  onClickRemoveHighlight={() =>
                    dispatch(actions.removeHighlightSite())
                  }
                  onClickRemove={(siteUrl: string) =>
                    dispatch(actions.removeUrl(siteUrl))
                  }
                />
                <StyledSelect
                  options={state.urls.map(({ url }) => ({
                    value: url,
                    label: url,
                  }))}
                  onChange={(option) => {
                    if (!option || "length" in option) return;
                    dispatch(actions.addUrl(option.value));
                  }}
                  onInputChange={(input: string) => {
                    effects.searchForUrls(state, dispatch, input);
                  }}
                  inputValue={state.search}
                  placeholder="Add website..."
                  value={null}
                  isLoading={searching}
                  loadingMessage={({ inputValue }) =>
                    `searching for "${inputValue}"...`
                  }
                  noOptionsMessage={({ inputValue }) =>
                    inputValue.length < MIN_SEARCH_STRING_LENGTH
                      ? "please be more specific"
                      : `no results for "${inputValue}"`
                  }
                />
                <SavedCollectionButtons
                  onSave={() => promptAndSaveCollection()}
                  onDelete={() =>
                    dispatch(
                      actions.deleteCollection(state.currentCollection.name)
                    )
                  }
                />
              </React.Fragment>
            }
          />
          <Heading as="h3" size="small">
            Examples
          </Heading>
          <Collections
            activeCollection={state.currentCollection.name}
            collections={presets}
            onClick={(presetKey: string) =>
              dispatch(actions.selectPresetUrls(presetKey as PresetName))
            }
            activeSites={
              <React.Fragment>
                {loadingSites ? <LoadingSites /> : null}
                <ActiveSiteList
                  hasUrls={hasUrls}
                  highlightedUrl={highlightedUrl}
                  sites={currentSites}
                  onClickHighlight={(siteUrl: string) =>
                    dispatch(actions.changeHighlightSite(siteUrl))
                  }
                  onClickRemoveHighlight={() =>
                    dispatch(actions.removeHighlightSite())
                  }
                  onClickRemove={(siteUrl: string) =>
                    dispatch(actions.removeUrl(siteUrl))
                  }
                />
                <StyledSelect
                  options={state.urls.map(({ url }) => ({
                    value: url,
                    label: url,
                  }))}
                  onChange={(option) => {
                    if (!option || "length" in option) return;
                    dispatch(actions.addUrl(option.value));
                  }}
                  onInputChange={(input: string) => {
                    effects.searchForUrls(state, dispatch, input);
                  }}
                  inputValue={state.search}
                  placeholder="Add website..."
                  value={null}
                  isLoading={searching}
                  loadingMessage={({ inputValue }) =>
                    `searching for "${inputValue}"...`
                  }
                  noOptionsMessage={({ inputValue }) =>
                    inputValue.length < MIN_SEARCH_STRING_LENGTH
                      ? "please be more specific"
                      : `no results for "${inputValue}"`
                  }
                />
              </React.Fragment>
            }
          />
          {!hasName ? (
            <StyledSelect
              options={state.urls.map(({ url }) => ({
                value: url,
                label: url,
              }))}
              onChange={(option) => {
                if (!option || "length" in option) return;
                dispatch(actions.addUrl(option.value));
              }}
              onInputChange={(input: string) => {
                effects.searchForUrls(state, dispatch, input);
              }}
              inputValue={state.search}
              placeholder="Add website..."
              value={null}
              isLoading={searching}
              loadingMessage={({ inputValue }) =>
                `searching for "${inputValue}"...`
              }
              noOptionsMessage={({ inputValue }) =>
                inputValue.length < MIN_SEARCH_STRING_LENGTH
                  ? "please be more specific"
                  : `no results for "${inputValue}"`
              }
            />
          ) : null}
        </Sidebar>

        <Content>
          <ContentHeader>
            <Heading as="h2" size="large">
              {hasName ? state.currentCollection.name : "Temporary list"}
              {/* TODO: If it's modified & unsaved, add '*' */}
            </Heading>
            {hasUrls ? (
              <div>
                {viewingSavedCollection ? null : (
                  <Button white onClick={() => promptAndSaveCollection()}>
                    Save to My Stuff
                  </Button>
                )}
                &nbsp;
                <Button
                  white
                  onClick={() => dispatch(actions.clearAllSelectedUrls())}
                >
                  Clear All
                </Button>
              </div>
            ) : null}
          </ContentHeader>
          <Charts>
            <Chart
              sites={currentSites}
              name="Time to first byte (ms)"
              field="TTFB"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="First contentful paint (ms)"
              field="firstContentfulPaint"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="First meaningful paint (ms)"
              field="firstMeaningfulPaint"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="First cpu idle (ms)"
              field="firstCPUIdle"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Time to interactive (ms)"
              field="timeToInteractive"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Max potential first input delay (ms)"
              field="maxPotentialFirstInputDelay"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Speed index"
              field="speedIndex"
              highlightedUrl={highlightedUrl}
            />
            <Chart
              sites={currentSites}
              name="Lighthouse performance score"
              field="performanceScore"
              highlightedUrl={highlightedUrl}
              reverse
            />
            <Chart
              sites={currentSites}
              name="JavaScript payload (kB)"
              field="bytesJS"
              highlightedUrl={highlightedUrl}
              yTransform={(y) => Math.round(y / 1000)}
            />
            <Chart
              sites={currentSites}
              name="Image payload (kB)"
              field="bytesImg"
              highlightedUrl={highlightedUrl}
              yTransform={(y) => Math.round(y / 1000)}
            />
            <Chart
              sites={currentSites}
              name="Total request payload (kB)"
              field="bytesTotal"
              highlightedUrl={highlightedUrl}
              yTransform={(y) => Math.round(y / 1000)}
            />
            <Chart
              sites={currentSites}
              name="Number of requests"
              field="reqTotal"
              highlightedUrl={highlightedUrl}
            />
          </Charts>
        </Content>
      </Layout>

      <SiteDetailsTable sites={currentSites} />

      <Footer>
        <p>&copy; 2020</p>
      </Footer>
    </React.Fragment>
  );
}

export default App;
