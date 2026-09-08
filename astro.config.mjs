// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// Piton's own TextMate grammar, vendored from the compiler repo.
// See src/grammars/README.md for provenance and how to update it.
import pitonGrammar from "./src/grammars/piton.tmLanguage.json" with { type: "json" };

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      langs: [{ ...pitonGrammar, name: "piton", aliases: ["pi"] }],
    },
  },
  integrations: [
    starlight({
      title: "Piton",
      logo: {
        // Starlight renders these as an <img>, so the ink has to be baked
        // into the file and the dark scheme needs its own copy — the mark
        // is a black path that would vanish on the dark header. Only
        // logo.svg is drawn by hand; logo-dark.svg (and public/logo.svg,
        // which the CSS masks read) are derived from it by
        // scripts/logo.mjs, which npm runs before dev and build.
        light: "./logo.svg",
        dark: "./logo-dark.svg",
        // The mark is a wordmark, so the text title would be a duplicate.
        // Starlight keeps it as screen-reader text.
        replacesTitle: true,
      },
      // Generated from piton-favicon.svg by scripts/logo.mjs, which npm runs
      // before dev and build. Stated rather than left to Starlight's default —
      // which is this same path — so the generated file has something pointing
      // at it from the config a reader actually opens.
      favicon: "/favicon.svg",
      expressiveCode: {
        // Bundled Shiki themes. Houston is dark-only, so a bundled light
        // theme partners it for the light scheme.
        themes: ["houston", "github-light"],
      },
      components: {
        // Adds a site index, the wordmark and a copyright line below
        // Starlight's own footer content.
        Footer: "./src/components/Footer.astro",
        // The landing page is pinned to the dark scheme — it has no light
        // version — and drops the scheme switch along with it.
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      head: [
        {
          // Adds tail distribution and click intent to the on-this-page
          // tracker; see the comment at the top of the file.
          tag: "script",
          attrs: { src: "/toc-tail.js", defer: true },
        },
      ],
      customCss: [
        // Barlow Semi Condensed, self-hosted via Fontsource (no external
        // request at runtime). Weights match those used in theme.css.
        "@fontsource/barlow-semi-condensed/400.css",
        "@fontsource/barlow-semi-condensed/400-italic.css",
        "@fontsource/barlow-semi-condensed/500.css",
        "@fontsource/barlow-semi-condensed/600.css",
        "@fontsource/barlow-semi-condensed/700.css",
        // Barlow Condensed — narrower still, used only for the page title.
        "@fontsource/barlow-condensed/600.css",
        "@fontsource/barlow-condensed/700.css",
        // IBM Plex Mono for code and technical data. Self-hosted so code
        // renders identically everywhere, rather than falling to whatever
        // monospace each OS happens to ship.
        "@fontsource/ibm-plex-mono/400.css",
        "@fontsource/ibm-plex-mono/500.css",
        "@fontsource/ibm-plex-mono/600.css",
        "./src/styles/theme.css",
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/piton-lang/piton-rs",
        },
      ],
      sidebar: [
        {
          label: "Founding Thesis",
          items: [{ autogenerate: { directory: "thesis" } }],
        },
        {
          label: "Getting Started",
          items: [{ autogenerate: { directory: "getting-started" } }],
        },
        {
          label: "The Language",
          items: [{ autogenerate: { directory: "language" } }],
        },
        {
          label: "Tooling",
          items: [{ autogenerate: { directory: "tooling" } }],
        },
        {
          label: "Belay",
          items: [{ autogenerate: { directory: "belay" } }],
        },
      ],
    }),
  ],
});
