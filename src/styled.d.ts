import "styled-components/macro";

declare module "styled-components/macro" {
  export interface DefaultTheme {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };

    colors: {
      nearBlack: string;
      darkNeutral: string;
      neutral: string;
      lightNeutral: string;
      lighterNeutral: string;
      white: string;
      mint: string;
      yellow: string;
    };

    fonts: {
      body: string;
      heading: string;
    };

    spacing: (x) => string;
  }
}
