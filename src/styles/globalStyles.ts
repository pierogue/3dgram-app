import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: var(--tgui--link_color);
    text-decoration: none;
  }

  .icon>svg>path{ /*target the image with css*/
    stroke: var(--tgui--link_color);
  }

  .iconFill>svg>path{ /*target the image with css*/
    fill: var(--tgui--link_color);
  }
`;