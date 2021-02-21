import React from "react";
import styled from "styled-components/macro";

import { AugmentedSite } from "../state";

const Wrapper = styled.div`
  margin-top: ${(props) => props.theme.spacing(2)};
`;

function SiteDetail({ site }: { site: AugmentedSite }) {
  return (
    <tr>
      <td>
        <a href={site.url}>{site.name}</a>
      </td>
      <td>{site.cdn || "none detected"}</td>
      <td>
        {new Date(site.startedDateTime * 1000).toLocaleString(undefined, {
          timeZoneName: "short",
        })}
      </td>
    </tr>
  );
}

const SiteDetailsTable = ({ sites }: { sites: AugmentedSite[] }) => {
  return (
    <Wrapper>
      <h2>site details</h2>
      <table className="SiteDetails">
        <thead>
          <tr>
            <th>site</th>
            <th>cdn</th>
            <th>profile time</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <SiteDetail key={site.url} site={site} />
          ))}
        </tbody>
      </table>
    </Wrapper>
  );
};

export default SiteDetailsTable;
