import React from "react";
import styled from "@emotion/styled";

import { author } from "../package.json";

export const LinkBar = () => (
  <Container>
    {[
      //
      { label: "twitter", url: `https://twitter.com/${author.twitter}` },
      { label: "github", url: `https://github.com/${author.github}` },
      { label: "toptal", url: `${author.toptal}` },
      { label: "linkedin", url: `${author.linkedin}` }
    ].map(({ label, url }) => (
      <A key={label} href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </A>
    ))}
  </Container>
);

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const A = styled.a`
  margin-left: 20px;

  &:first-child {
    margin-left: 0px;
  }

  @media (max-width: 500px) {
    margin-left: 0px;

    margin-top: 20px;

    &:first-child {
      margin-top: 0px;
    }
  }
`;
