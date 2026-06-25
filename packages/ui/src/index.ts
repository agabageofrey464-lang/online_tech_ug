// Shared brand design tokens for Online Tech Uganda.
// Single source of truth for colors used across web, admin and future apps.

export const brand = {
  primary: "#F15A29", // orange
  secondary: "#282363", // indigo
  primaryScale: {
    50: "#fff3ee",
    100: "#ffe0d3",
    200: "#ffbfa3",
    300: "#ff9670",
    400: "#fa7547",
    500: "#f15a29",
    600: "#d9430f",
    700: "#b3340a",
    800: "#8c2a0c",
    900: "#6e240e",
  },
  secondaryScale: {
    50: "#eeeef6",
    100: "#d6d6ec",
    200: "#adaed9",
    300: "#8385c3",
    400: "#5a5cae",
    500: "#3c3a87",
    600: "#282363",
    700: "#211d52",
    800: "#1a1740",
    900: "#12102e",
  },
} as const;

export type BrandTokens = typeof brand;
