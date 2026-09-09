// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import { satteri } from "@astrojs/markdown-satteri";

// Fills `from=` code blocks in the tutorials from the projects under
// examples/ — which are also what the .zip downloads are packed from — and
// from generated/, the compiler output `npm run examples` writes out of them.
import { codeFromFile } from "./plugins/code-from-file.mjs";
import { includableFiles } from "./plugins/examples-digest.mjs";

/**
 * Tells the dev server that the tutorials depend on examples/ and generated/.
 *
 * A `from=` code block reads a file Astro never sees, so without this an
 * example edit — or a run of `npm run examples` — changes nothing on screen
 * until the server is restarted. The matching fix for `astro build` is the
 * digest salt in src/content.config.ts.
 */
const watchExamples = {
  name: "watch-examples",
  hooks: {
    "astro:config:setup": ({ addWatchFile }) => {
      for (const file of includableFiles()) addWatchFile(file);
    },
  },
};

// Piton's own TextMate grammar, vendored from the compiler repo.
// See src/grammars/README.md for provenance and how to update it.
import pitonGrammar from "./src/grammars/piton.tmLanguage.json" with { type: "json" };

// https://astro.build/config
export default defineConfig({
  markdown: {
    // Astro's own default processor, plus one plugin. Expressive Code finds
    // this object and appends its hast plugin to it, so code blocks are still
    // rendered by Expressive Code — see plugins/code-from-file.mjs.
    processor: satteri({ mdastPlugins: [codeFromFile()] }),
    shikiConfig: {
      langs: [{ ...pitonGrammar, name: "piton", aliases: ["pi"] }],
    },
  },
  integrations: [
    watchExamples,
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
        // Splits the sidebar into sections behind a vertical tab strip; the
        // menu below the strip is the selected section's.
        Sidebar: "./src/components/Sidebar.astro",
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
      // The sidebar is a set of SECTIONS, one per top-level group. The
      // Sidebar override (src/components/Sidebar.astro) turns these into a
      // vertical tab strip and shows one section's menu at a time, so every
      // top-level entry here must be a group — it is a tab.
      //
      // Inside a section, the groups are what Starlight renders as collapsible
      // <details>, so a section's items must be groups too, never bare
      // autogenerate: a section built straight from a directory produces a
      // flat list with nothing to collapse.
      sidebar: [
        {
          label: "Introduction",
          items: [
            {
              label: "Founding Thesis",
              items: [{ autogenerate: { directory: "thesis" } }],
            },
          ],
        },
        {
          label: "Getting Started",
          items: [
            {
              label: "Setup",
              items: [{ autogenerate: { directory: "getting-started" } }],
            },
          ],
        },
        {
          label: "Belay Framework",
          items: [
            {
              label: "Belay",
              items: [{ autogenerate: { directory: "belay" } }],
            },
          ],
        },
        {
          label: "Reference",
          items: [
            {
              label: "The Language",
              items: [{ autogenerate: { directory: "language" } }],
            },
            {
              label: "Tooling",
              items: [{ autogenerate: { directory: "tooling" } }],
            },
          ],
        },
        {
          label: "Tutorials",
          items: [
            {
              label: "Guides",
              items: [{ autogenerate: { directory: "tutorials" } }],
            },
          ],
        },
      ],
    }),
  ],
});
