/*
  navigation.js
  -------------
  Builds the persistent site header and the left sidebar (desktop) /
  slide-out drawer (mobile). Both are generated entirely from the
  content data — nothing here is hand-maintained per document.

  Content maintainers should never need to edit this file.
*/

import { allVolumesSorted, documentsInVolume } from "./renderer.js";
import { el, buildUrl } from "./utils.js";

const EXPANDED_KEY = "archive:expandedVolumes";
const THEME_KEY = "archive:theme";

function getExpandedVolumes() {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveExpandedVolumes(set) {
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify([...set]));
  } catch {
    /* localStorage unavailable (private browsing, etc.) — degrade silently */
  }
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function effectiveTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

function buildThemeToggle() {
  const btn = el("button", {
    class: "theme-toggle",
    type: "button",
    "aria-label": effectiveTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
  }, effectiveTheme() === "dark" ? "☀" : "☾");

  btn.addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    btn.textContent = next === "dark" ? "☀" : "☾";
    btn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
  });

  return btn;
}

function navLink(label, href, isActive) {
  const a = el("a", { href }, label);
  if (isActive) a.setAttribute("aria-current", "page");
  return a;
}

export function renderHeader(container, { activePage }) {
  const menuToggle = el("button", {
    class: "menu-toggle",
    type: "button",
    "aria-label": "Toggle navigation menu",
    "aria-expanded": "false",
    "aria-controls": "sidebar",
  }, "☰");

  const brand = el("a", { class: "brand", href: "index.html" }, "Archive");

  const searchForm = el("form", { class: "header-search", role: "search", action: "search.html" }, [
    el("label", { for: "header-search-input", class: "visually-hidden" }, "Search the archive"),
    el("input", { id: "header-search-input", type: "search", name: "q", placeholder: "Search documentation…" }),
  ]);

  const nav = el("nav", { class: "header-nav", "aria-label": "Primary" }, [
    navLink("Home", "index.html", activePage === "home"),
    navLink("Search", "search.html", activePage === "search"),
    navLink("Volumes", "index.html#volumes-section", false),
    navLink("People", "people.html", activePage === "people" || activePage === "person"),
    navLink("About", "about.html", activePage === "about"),
  ]);

  container.replaceChildren(menuToggle, brand, searchForm, nav, buildThemeToggle());

  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("drawer-backdrop");
  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("is-open");
    backdrop.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  backdrop.addEventListener("click", () => {
    sidebar.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

export function renderSidebar(container, { activeDocId, activeVolumeId } = {}) {
  const expanded = getExpandedVolumes();

  // Auto-expand the volume containing the current document/volume page,
  // without permanently changing what the user has toggled themselves.
  const forceExpandId = activeVolumeId || null;

  const searchForm = el("form", { class: "sidebar-search", role: "search", action: "search.html" }, [
    el("label", { for: "sidebar-search-input", class: "visually-hidden" }, "Search the archive"),
    el("input", { id: "sidebar-search-input", type: "search", name: "q", placeholder: "Search…" }),
  ]);

  const volumesLabel = el("p", { class: "sidebar-section-label" }, "Volumes");
  const tree = el("ul", { class: "volume-tree" });

  for (const volume of allVolumesSorted()) {
    const isExpanded = expanded.has(volume.id) || volume.id === forceExpandId;
    const node = el("li", { class: `volume-node${isExpanded ? " is-expanded" : ""}` });

    const toggle = el("button", { class: "volume-toggle", type: "button", "aria-expanded": String(isExpanded) }, [
      el("span", { class: "caret", "aria-hidden": "true" }, "▸"),
      volume.title,
    ]);

    const docList = el("ul", { class: "volume-doc-list" });
    for (const doc of documentsInVolume(volume.id)) {
      const a = el("a", { href: buildUrl("document.html", { id: doc.id }) }, doc.title);
      if (doc.id === activeDocId) a.setAttribute("aria-current", "page");
      docList.append(el("li", {}, a));
    }

    toggle.addEventListener("click", () => {
      const nowExpanded = node.classList.toggle("is-expanded");
      toggle.setAttribute("aria-expanded", String(nowExpanded));
      const set = getExpandedVolumes();
      if (nowExpanded) set.add(volume.id);
      else set.delete(volume.id);
      saveExpandedVolumes(set);
    });

    node.append(toggle, docList);
    tree.append(node);
  }

  const peopleLink = el("a", { class: "sidebar-link", href: "people.html" }, "People");

  container.replaceChildren(
    searchForm,
    el("div", { class: "sidebar-section" }, [volumesLabel, tree]),
    el("div", { class: "sidebar-section" }, [el("p", { class: "sidebar-section-label" }, "Reference"), peopleLink])
  );
}

/** Apply the persisted/system theme. Call this as early as possible
 *  (also duplicated as an inline snippet in <head> to avoid a flash
 *  of the wrong theme before this module loads). */
export function initTheme() {
  document.documentElement.setAttribute("data-theme", effectiveTheme());
}
