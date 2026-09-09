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

- One `eframe::App` implementation, kept in the entry point.
- Lay the UI out immediately in `update`; hold no widget objects.
