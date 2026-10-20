const defaults = { query: "", stage: "all", category: "all", subcategory: "all", year: "all", resource: "all", sort: "added", paperId: "" };
const state = { papers: [], ...defaults };
const stages = ["Encoding", "Prefilling", "Decoding"];
const presets = {
  encoding: { stage: "Encoding" },
  prefilling: { stage: "Prefilling" },
  memory: { stage: "Decoding", category: "KV Cache Compression" },
  generation: { stage: "Decoding", category: "Speculative Decoding" },
};
const elements = {
  search: document.querySelector("#search"),
  stageFilter: document.querySelector("#stage-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  subcategoryFilter: document.querySelector("#subcategory-filter"),
  yearFilter: document.querySelector("#year-filter"),
  resourceFilter: document.querySelector("#resource-filter"),
  sortOrder: document.querySelector("#sort-order"),
  resultCount: document.querySelector("#result-count"),
  grid: document.querySelector("#paper-grid"),
  empty: document.querySelector("#empty-state"),
  summary: document.querySelector("#filter-summary"),
  template: document.querySelector("#paper-template"),
  dialog: document.querySelector("#citation-dialog"),
  citation: document.querySelector("#citation-text"),
  status: document.querySelector("#action-status"),
};
let statusTimer;
let citationObjectUrl;

function option(value, label = value) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function setOptions(select, values, allLabel, selected) {
  select.replaceChildren(option("all", allLabel), ...[...new Set(values)].sort().map((value) => option(value)));
  select.value = [...select.options].some((item) => item.value === selected) ? selected : "all";
  return select.value;
}

function syncControls() {
  const placements = state.papers.flatMap((paper) => paper.placements);
  const matchingStage = placements.filter((p) => state.stage === "all" || p.stage === state.stage);
  state.category = setOptions(elements.categoryFilter, matchingStage.map((p) => p.category), "All categories", state.category);
  const matchingCategory = matchingStage.filter((p) => state.category === "all" || p.category === state.category);
  state.subcategory = setOptions(elements.subcategoryFilter, matchingCategory.map((p) => p.subcategory).filter(Boolean), "All subcategories", state.subcategory);
  elements.subcategoryFilter.disabled = elements.subcategoryFilter.options.length === 1;
  elements.search.value = state.query;
  elements.yearFilter.value = state.year;
  elements.resourceFilter.value = state.resource;
  elements.sortOrder.value = state.sort;
  elements.stageFilter.querySelectorAll("button").forEach((button) => {
    const active = button.dataset.stage === state.stage;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-preset]").forEach((button) => {
    const preset = { category: "all", ...presets[button.dataset.preset] };
    const active = state.stage === preset.stage && state.category === preset.category && state.subcategory === "all";
    button.setAttribute("aria-pressed", String(active));
  });
}

function readQueryState() {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get("q") || "";
  state.stage = stages.includes(params.get("stage")) ? params.get("stage") : "all";
  state.category = params.get("category") || "all";
  state.subcategory = params.get("subcategory") || "all";
  state.year = [...elements.yearFilter.options].some((o) => o.value === params.get("year")) ? params.get("year") : "all";
  const resource = params.get("resource") || (params.get("code") === "1" ? "code" : "all");
  state.resource = ["all", "code", "project", "none"].includes(resource) ? resource : "all";
  const sort = params.get("sort") === "newest" ? "year" : params.get("sort");
  state.sort = ["added", "year", "title"].includes(sort) ? sort : "added";
  state.paperId = state.papers.some((paper) => paper.id === params.get("paper")) ? params.get("paper") : "";
}

function writeQueryState() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  for (const field of ["stage", "category", "subcategory", "year", "resource"]) {
    if (state[field] !== "all") params.set(field, state[field]);
  }
  if (state.sort !== "added") params.set("sort", state.sort);
  if (state.paperId) params.set("paper", state.paperId);
  const suffix = params.toString();
  history.replaceState(null, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}${window.location.hash}`);
}

function searchableText(paper) {
  return [paper.title, paper.venue, paper.contribution, ...paper.placements.flatMap((p) => [p.stage, p.category, p.subcategory || ""])].join(" ").toLocaleLowerCase();
}

function filteredPapers() {
  const terms = state.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return state.papers.filter((paper) => {
    const text = searchableText(paper);
    return terms.every((term) => text.includes(term))
      && paper.placements.some((p) => (state.stage === "all" || p.stage === state.stage)
        && (state.category === "all" || p.category === state.category)
        && (state.subcategory === "all" || p.subcategory === state.subcategory))
      && (state.year === "all" || String(paper.year) === state.year)
      && (state.resource === "all" || (state.resource === "code" && paper.code_type === "Code")
        || (state.resource === "project" && paper.code_type === "Project page")
        || (state.resource === "none" && !paper.code_url))
      && (!state.paperId || paper.id === state.paperId);
  }).sort((a, b) => {
    if (state.sort === "added") return (b.added_on || "").localeCompare(a.added_on || "") || a.title.localeCompare(b.title);
    if (state.sort === "year") return (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title);
    return a.title.localeCompare(b.title);
  });
}

function applyTaxonomy(placement) {
  Object.assign(state, defaults, { stage: placement.stage, category: placement.category || "all", subcategory: placement.subcategory || "all" });
  render();
  document.querySelector(".controls").scrollIntoView({ behavior: "smooth", block: "start" });
}

function taxonomyButton(label, placement, className = "taxonomy-link") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", () => applyTaxonomy(placement));
  return button;
}

function renderTaxonomy() {
  const tree = document.querySelector("#taxonomy-tree");
  for (const stage of stages) {
    const group = document.createElement("section");
    group.dataset.stage = stage;
    const papers = state.papers.filter((p) => p.stages.includes(stage));
    const heading = document.createElement("h3");
    heading.append(taxonomyButton(`${stage} · ${papers.length}`, { stage }));
    group.append(heading);
    const categories = [...new Set(papers.flatMap((p) => p.placements.filter((p) => p.stage === stage).map((p) => p.category)))];
    for (const category of categories) {
      const members = papers.filter((p) => p.placements.some((p) => p.stage === stage && p.category === category));
      group.append(taxonomyButton(`${category} · ${members.length}`, { stage, category }, "tree-category"));
      const subs = [...new Set(members.flatMap((p) => p.placements.filter((p) => p.stage === stage && p.category === category).map((p) => p.subcategory).filter(Boolean)))];
      for (const subcategory of subs) {
        const count = members.filter((p) => p.placements.some((p) => p.stage === stage && p.category === category && p.subcategory === subcategory)).length;
        group.append(taxonomyButton(`${subcategory} · ${count}`, { stage, category, subcategory }, "tree-subcategory"));
      }
    }
    tree.append(group);
  }
}

function announce(message, fallback = "") {
  clearTimeout(statusTimer);
  elements.status.replaceChildren(document.createTextNode(message));
  elements.status.classList.add("visible");
  if (fallback) {
    const input = document.createElement("input");
    input.readOnly = true;
    input.value = fallback;
    input.setAttribute("aria-label", "Text to copy manually");
    elements.status.append(input);
    input.focus();
    input.select();
  } else {
    statusTimer = setTimeout(() => elements.status.classList.remove("visible"), 4500);
  }
}

async function copyText(value, message) {
  try {
    await navigator.clipboard.writeText(value);
    if (elements.dialog.open) document.querySelector("#citation-status").textContent = message;
    else announce(message);
  } catch {
    if (elements.dialog.open) {
      elements.citation.focus();
      elements.citation.select();
      document.querySelector("#citation-note").textContent = "Clipboard access is unavailable. The BibTeX is selected; use your browser’s Copy command, or download the .bib file.";
    } else {
      announce("Clipboard access is unavailable. Copy the selected link:", value);
    }
  }
}

function showCitation(paper) {
  document.querySelector("#citation-status").textContent = "";
  document.querySelector("#citation-title").textContent = paper.title;
  document.querySelector("#citation-note").textContent = "This catalog BibTeX includes the title, venue, year and URL. For author-complete citations, use the publisher or arXiv citation export.";
  elements.citation.value = paper.bibtex;
  document.querySelector("#citation-source").href = paper.paper_url;
  if (citationObjectUrl) URL.revokeObjectURL(citationObjectUrl);
  citationObjectUrl = URL.createObjectURL(new Blob([`${paper.bibtex}\n`], { type: "text/plain;charset=utf-8" }));
  const download = document.querySelector("#download-citation");
  download.href = citationObjectUrl;
  download.download = `${paper.id}.bib`;
  elements.dialog.showModal();
}

function renderCard(paper) {
  const card = elements.template.content.firstElementChild.cloneNode(true);
  card.id = `paper-${paper.id}`;
  const stage = card.querySelector(".stage-badge");
  stage.textContent = paper.stages.join(" · ");
  stage.dataset.stage = paper.stages[0];
  card.querySelector(".venue").textContent = paper.venue;
  const title = card.querySelector(".paper-title");
  title.textContent = paper.title;
  title.href = paper.paper_url;
  title.target = "_blank";
  title.rel = "noopener noreferrer";
  card.querySelector(".contribution").textContent = paper.contribution;
  const taxonomy = card.querySelector(".taxonomy");
  for (const placement of paper.placements) {
    const path = document.createElement("div");
    path.className = "taxonomy-path";
    path.append(taxonomyButton(placement.stage, { stage: placement.stage }));
    path.append(document.createTextNode(" › "), taxonomyButton(placement.category, { stage: placement.stage, category: placement.category }));
    if (placement.subcategory) path.append(document.createTextNode(" › "), taxonomyButton(placement.subcategory, placement));
    taxonomy.append(path);
  }
  const added = card.querySelector(".added-date");
  if (paper.added_on) {
    const label = `Added ${paper.added_on}`;
    if (paper.added_in) {
      const source = document.createElement("a");
      source.href = `https://github.com/SuDIS-ZJU/Efficient-LVLMs-Inference/commit/${paper.added_in}`;
      source.textContent = label;
      source.title = "First catalog inclusion · view the source commit";
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      added.append(source);
    } else added.textContent = label;
  }
  const paperLink = card.querySelector(".paper-link");
  paperLink.href = paper.paper_url;
  paperLink.target = "_blank";
  paperLink.rel = "noopener noreferrer";
  const codeLink = card.querySelector(".code-link");
  if (paper.code_url) {
    codeLink.href = paper.code_url;
    codeLink.textContent = `${paper.code_type === "Code" ? "Code" : "Project page"} ↗`;
    codeLink.target = "_blank";
    codeLink.rel = "noopener noreferrer";
  } else codeLink.hidden = true;
  const cite = card.querySelector(".cite-button");
  cite.setAttribute("aria-label", `Cite ${paper.title}`);
  cite.addEventListener("click", () => showCitation(paper));
  const share = card.querySelector(".permalink-button");
  share.setAttribute("aria-label", `Share ${paper.title}`);
  share.addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ paper: paper.id }).toString();
    url.hash = "catalog";
    copyText(url.href, "Paper link copied.");
  });
  return card;
}

function render() {
  syncControls();
  const papers = filteredPapers();
  const fragment = document.createDocumentFragment();
  papers.forEach((paper) => fragment.append(renderCard(paper)));
  elements.grid.replaceChildren(fragment);
  elements.resultCount.textContent = papers.length.toLocaleString();
  elements.grid.hidden = papers.length === 0;
  elements.empty.hidden = papers.length !== 0;
  const labels = [state.stage, state.category, state.subcategory, state.year].filter((value) => value !== "all");
  if (state.resource !== "all") labels.push(elements.resourceFilter.selectedOptions[0].textContent);
  if (state.query) labels.push(`“${state.query}”`);
  if (state.paperId) labels.unshift("Shared paper");
  elements.summary.textContent = labels.length ? `Viewing: ${labels.join(" · ")}` : "Browse all methods, or choose a bottleneck above to get started.";
  writeQueryState();
}

function resetFilters() { Object.assign(state, defaults); render(); }

function bindEvents() {
  elements.search.addEventListener("input", (event) => { state.query = event.target.value; state.paperId = ""; render(); });
  elements.stageFilter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-stage]");
    if (!button) return;
    Object.assign(state, { stage: button.dataset.stage, category: "all", subcategory: "all", paperId: "" });
    render();
  });
  for (const [element, field] of [[elements.categoryFilter, "category"], [elements.subcategoryFilter, "subcategory"], [elements.yearFilter, "year"], [elements.resourceFilter, "resource"], [elements.sortOrder, "sort"]]) {
    element.addEventListener("change", (event) => {
      state[field] = event.target.value;
      if (field === "category") state.subcategory = "all";
      if (field !== "sort") state.paperId = "";
      render();
    });
  }
  document.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => applyTaxonomy(presets[button.dataset.preset])));
  for (const selector of ["#clear-filters", "#reset-filters"]) document.querySelector(selector).addEventListener("click", resetFilters);
  document.querySelector("#share-results").addEventListener("click", () => {
    const url = new URL(window.location.href);
    url.hash = "catalog";
    copyText(url.href, "Filtered collection link copied.");
  });
  document.querySelector("#close-citation").addEventListener("click", () => elements.dialog.close());
  document.querySelector("#copy-citation").addEventListener("click", () => copyText(elements.citation.value, "BibTeX copied."));
  elements.dialog.addEventListener("close", () => { if (citationObjectUrl) URL.revokeObjectURL(citationObjectUrl); citationObjectUrl = null; });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !elements.dialog.open && !event.target.isContentEditable && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      elements.search.focus();
    }
  });
  window.addEventListener("popstate", () => { readQueryState(); render(); });
}

async function init() {
  try {
    const embedded = document.querySelector("#catalog-data");
    let catalog;
    if (embedded) catalog = JSON.parse(embedded.textContent);
    else {
      const response = await fetch("data/papers.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      catalog = await response.json();
    }
    state.papers = catalog.papers;
    document.querySelector("#paper-count").textContent = catalog.stats.papers.toLocaleString();
    document.querySelector("#code-count").textContent = catalog.stats.with_code.toLocaleString();
    document.querySelector("#project-count").textContent = `+ ${catalog.stats.with_project_page} project pages`;
    document.querySelector("#updated-date").textContent = catalog.last_updated || "Living";
    const years = [...new Set(state.papers.map((p) => p.year).filter(Boolean))].sort((a, b) => b - a);
    years.forEach((year) => elements.yearFilter.append(option(String(year))));
    readQueryState();
    renderTaxonomy();
    bindEvents();
    render();
  } catch (error) {
    elements.empty.hidden = false;
    elements.empty.querySelector("h3").textContent = "Could not load the catalog";
    elements.empty.querySelector("p").textContent = "Please refresh the page or visit the GitHub repository.";
    document.querySelector("#clear-filters").hidden = true;
    console.error(error);
  }
}

init();
