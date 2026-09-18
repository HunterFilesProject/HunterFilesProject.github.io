/*
  app.js
  ------
  The single entry point loaded (as a module) by every HTML page.
  It wires together navigation, the page-specific renderer, and
  (in development) the content validator.

  CONTENT MAINTAINERS: you should never need to touch this file.
  To add or edit archive content, see content/ and CONTENT_GUIDE.md.
*/

import { getPageType } from "./router.js";
import { renderHeader, renderSidebar, initTheme } from "./navigation.js";
import {
  renderHomePage,
  renderVolumePage,
  renderDocumentPage,
  renderPeopleIndexPage,
  renderPersonPage,
  getDocument,
} from "./renderer.js";
import { getQueryParam } from "./utils.js";
import { runValidation } from "./validate.js";
import { initSearchPage } from "./search.js";

const CONFIG = {
  // Set to false before publishing if you'd rather the validation
  // report not print to the browser console at all (it never shows
  // anything to visitors on the page itself either way).
  developmentMode: true,
};

function boot() {
  initTheme();

  const pageType = getPageType();
  const headerEl = document.getElementById("site-header");
  const sidebarEl = document.getElementById("sidebar");
  const contentEl = document.getElementById("app-content");

  let activeDocId = null;
  let activeVolumeId = null;

  if (pageType === "document") {
    activeDocId = getQueryParam("id");
    const doc = getDocument(activeDocId);
    if (doc) activeVolumeId = doc.volume;
  } else if (pageType === "volume") {
    activeVolumeId = getQueryParam("id");
  }

  if (headerEl) renderHeader(headerEl, { activePage: pageType });
  if (sidebarEl) renderSidebar(sidebarEl, { activeDocId, activeVolumeId });

  if (contentEl) {
    switch (pageType) {
      case "home":
        renderHomePage(contentEl);
        break;
      case "volume":
        renderVolumePage(contentEl, getQueryParam("id"));
        break;
      case "document":
        renderDocumentPage(contentEl, getQueryParam("id"));
        break;
      case "people":
        renderPeopleIndexPage(contentEl);
        break;
      case "person":
        renderPersonPage(contentEl, getQueryParam("id"));
        break;
      default:
        break; // static pages (about.html) render nothing dynamic
    }
  }

  if (pageType === "search") {
    initSearchPage();
  }

  if (CONFIG.developmentMode) {
    runValidation();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
