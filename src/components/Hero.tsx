import React from "react";
import styled from "styled-components/macro";

import Heading from "./Heading";
import Text from "./Text";

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;

  padding: ${(props) => props.theme.spacing(10)}
    ${(props) => props.theme.spacing(6)} ${(props) => props.theme.spacing(16)};

  background-color: ${(props) => props.theme.colors.mint};
`;

const Title = styled.div`
  flex: 1 1 65ch;
  max-width: 70ch;
`;

const About = styled.div`
  flex: 1 1 40ch;
  margin-left: auto;
  max-width: 45ch;
  padding-top: ${(props) => props.theme.spacing(4)};
`;

const Hero = () => {
  return (
    <Wrapper>
      <Title>
        <Heading as="h1" size="xlarge">
          Perf Land
        </Heading>
        <Text size="large">
          explore the world of web performance and compare thousands of
          websites.
        </Text>
      </Title>
      <About>
        <Heading as="h2" size="medium" id="about">
          about
        </Heading>
        <Text>
          perf land is currently in the <strong>alpha</strong> stage. If there
          are features you'd like to see or bugs you'd like to tell us about,
          check out the{" "}
          <a href="https://github.com/chrisbolin/perf-land">repository</a>.
        </Text>
        <Text>
          There are over 600,000 sites are available here. The underlying data
          is from the HTTP Archive, a public and free resource.
        </Text>
        <Text>
          The performance tests are run from a private instance of WebPageTest
          located in Redwood City, California. If you'd like to learn more about
          the tests,{" "}
          <a href="https://httparchive.org/faq#how-is-the-data-gathered">
            head to the HTTP Archive
          </a>
          .
        </Text>
      </About>
    </Wrapper>
  );
};

export default Hero;
