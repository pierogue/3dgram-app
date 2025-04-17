import { createGlobalStyle } from "styled-components";
import { themeParams } from "@telegram-apps/sdk-react";

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: ${themeParams.textColor};
    text-decoration: none;
  }

  .icon>svg>path{ /*target the image with css*/
    stroke: var(--tg-theme-link-color);
  }

  .iconFill>svg>path{ /*target the image with css*/
    fill: var(--tg-theme-link-color);
  }
`;