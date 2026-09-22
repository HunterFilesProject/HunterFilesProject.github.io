/*
  app.js
  ------
  The single entry point loaded (as a module) by every HTML page.
  It wires together navigation, the page-specific renderer, and
  (in development) the content validator.

  CONTENT MAINTAINERS: you should never need to touch this file.
  To add or edit project content, see content/ and CONTENT_GUIDE.md.
*/

import { getPageType } from "./router.js";
import { renderHeader, renderSidebar, initTheme } from "./navigation.js";
import {
  renderHomePage,
  renderVolumePage,
  renderDatasetPage,
  renderDocumentPage,
  renderPeopleIndexPage,
  renderPersonPage,
  renderKeywordsIndexPage,
  renderKeywordPage,
  renderDashboardPage,
  renderTimelinePage,
  renderChangelogPage,
  getDocument,
  getDataset,
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
  let activeDatasetId = null;

  if (pageType === "document") {
    activeDocId = getQueryParam("id");
    const doc = getDocument(activeDocId);
    if (doc) {
      activeVolumeId = doc.volume;
      activeDatasetId = doc.dataset || null;
    }
  } else if (pageType === "volume") {
    activeVolumeId = getQueryParam("id");
  } else if (pageType === "dataset") {
    activeDatasetId = getQueryParam("id");
    const ds = getDataset(activeDatasetId);
    if (ds) activeVolumeId = ds.volume;
  }

  if (headerEl) renderHeader(headerEl, { activePage: pageType });
  if (sidebarEl) renderSidebar(sidebarEl, { activeDocId, activeVolumeId, activeDatasetId, activePage: pageType });

  if (contentEl) {
    switch (pageType) {
      case "home":
        renderHomePage(contentEl);
        break;
      case "volume":
        renderVolumePage(contentEl, getQueryParam("id"));
        break;
      case "dataset":
        renderDatasetPage(contentEl, getQueryParam("id"));
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
      case "keywords":
        renderKeywordsIndexPage(contentEl);
        break;
      case "keyword":
        renderKeywordPage(contentEl, getQueryParam("kw"));
        break;
      case "dashboard":
        renderDashboardPage(contentEl);
        break;
      case "timeline":
        renderTimelinePage(contentEl);
        break;
      case "changelog":
        renderChangelogPage(contentEl);
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
