import React from "react";
import { Global, css } from "@emotion/core";

export const normalized = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  html {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #333;
  }
  html,
  body {
    position: relative;
    padding: 0;
    margin: 0;
  }
`;

export const NormalizeCss = () => <Global styles={normalized} />;
