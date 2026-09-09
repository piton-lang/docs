# Egui

## Name

egui

## Language

Rust

## Build

Cargo

## Entry Point

src/main.rs

## Conventions

- One `eframe::App` implementation holding the document state.
- Lay the UI out immediately in `update`; hold no widget objects.
- One module per part, named after the part.
