const state = {
  papers: [],
  query: "",
  stage: "all",
  category: "all",
  year: "all",
  codeOnly: false,
  sort: "newest",
};

const elements = {
  search: document.querySelector("#search"),
  stageFilter: document.querySelector("#stage-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  yearFilter: document.querySelector("#year-filter"),
  codeFilter: document.querySelector("#code-filter"),
  sortOrder: document.querySelector("#sort-order"),
  resultCount: document.querySelector("#result-count"),
  grid: document.querySelector("#paper-grid"),
  empty: document.querySelector("#empty-state"),
  clear: document.querySelector("#clear-filters"),
  template: document.querySelector("#paper-template"),
};

function option(value, label = value) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function hydrateFilters() {
  const years = [...new Set(state.papers.map((paper) => paper.year).filter(Boolean))].sort((a, b) => b - a);
  const categories = [...new Set(state.papers.flatMap((paper) => paper.categories))].sort();
  years.forEach((year) => elements.yearFilter.append(option(String(year))));
  categories.forEach((category) => elements.categoryFilter.append(option(category)));
}

function readQueryState() {
  const params = new URLSearchParams(window.location.search);
  state.query = params.get("q") || "";
  state.stage = params.get("stage") || "all";
  state.category = params.get("category") || "all";
  state.year = params.get("year") || "all";
  state.codeOnly = params.get("code") === "1";
  state.sort = params.get("sort") || "newest";

  elements.search.value = state.query;
  elements.categoryFilter.value = state.category;
  elements.yearFilter.value = state.year;
  elements.codeFilter.checked = state.codeOnly;
  elements.sortOrder.value = state.sort;
  elements.stageFilter.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.stage === state.stage);
  });
}

function writeQueryState() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.stage !== "all") params.set("stage", state.stage);
  if (state.category !== "all") params.set("category", state.category);
  if (state.year !== "all") params.set("year", state.year);
  if (state.codeOnly) params.set("code", "1");
  if (state.sort !== "newest") params.set("sort", state.sort);
  const suffix = params.toString();
  history.replaceState(null, "", suffix ? `?${suffix}` : window.location.pathname);
}

function searchableText(paper) {
  return [paper.title, paper.venue, paper.contribution, ...paper.stages, ...paper.categories]
    .join(" ")
    .toLocaleLowerCase();
}

function filteredPapers() {
  const terms = state.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = state.papers.filter((paper) => {
    const text = searchableText(paper);
    return terms.every((term) => text.includes(term))
      && (state.stage === "all" || paper.stages.includes(state.stage))
      && (state.category === "all" || paper.categories.includes(state.category))
      && (state.year === "all" || String(paper.year) === state.year)
      && (!state.codeOnly || paper.code_url);
  });
  return matches.sort((a, b) => state.sort === "title"
    ? a.title.localeCompare(b.title)
    : (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
}

function renderCard(paper) {
  const card = elements.template.content.firstElementChild.cloneNode(true);
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
  card.querySelector(".taxonomy").textContent = paper.categories.join(" · ");

  const paperLink = card.querySelector(".paper-link");
  paperLink.href = paper.paper_url;
  paperLink.target = "_blank";
  paperLink.rel = "noopener noreferrer";

  const codeLink = card.querySelector(".code-link");
  if (paper.code_url) {
    codeLink.href = paper.code_url;
    codeLink.textContent = `${paper.code_type || "Code"} ↗`;
    codeLink.target = "_blank";
    codeLink.rel = "noopener noreferrer";
  } else {
    codeLink.hidden = true;
  }
  return card;
}

function render() {
  const papers = filteredPapers();
  const fragment = document.createDocumentFragment();
  papers.forEach((paper) => fragment.append(renderCard(paper)));
  elements.grid.replaceChildren(fragment);
  elements.resultCount.textContent = papers.length.toLocaleString();
  elements.grid.hidden = papers.length === 0;
  elements.empty.hidden = papers.length !== 0;
  writeQueryState();
}

function resetFilters() {
  state.query = "";
  state.stage = "all";
  state.category = "all";
  state.year = "all";
  state.codeOnly = false;
  elements.search.value = "";
  elements.categoryFilter.value = "all";
  elements.yearFilter.value = "all";
  elements.codeFilter.checked = false;
  elements.stageFilter.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.stage === "all"));
  render();
}

function bindEvents() {
  elements.search.addEventListener("input", (event) => { state.query = event.target.value; render(); });
  elements.stageFilter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-stage]");
    if (!button) return;
    state.stage = button.dataset.stage;
    elements.stageFilter.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
  elements.categoryFilter.addEventListener("change", (event) => { state.category = event.target.value; render(); });
  elements.yearFilter.addEventListener("change", (event) => { state.year = event.target.value; render(); });
  elements.codeFilter.addEventListener("change", (event) => { state.codeOnly = event.target.checked; render(); });
  elements.sortOrder.addEventListener("change", (event) => { state.sort = event.target.value; render(); });
  elements.clear.addEventListener("click", resetFilters);
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      elements.search.focus();
    }
  });
}

async function init() {
  try {
    const embedded = document.querySelector("#catalog-data");
    let catalog;
    if (embedded) {
      catalog = JSON.parse(embedded.textContent);
    } else {
      const response = await fetch("data/papers.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      catalog = await response.json();
    }
    state.papers = catalog.papers;
    document.querySelector("#paper-count").textContent = catalog.stats.papers.toLocaleString();
    document.querySelector("#code-count").textContent = catalog.stats.with_code.toLocaleString();
    document.querySelector("#updated-date").textContent = catalog.last_updated || "Living";
    hydrateFilters();
    readQueryState();
    bindEvents();
    render();
  } catch (error) {
    elements.empty.hidden = false;
    elements.empty.querySelector("h3").textContent = "Could not load the catalog";
    elements.empty.querySelector("p").textContent = "Please refresh the page or visit the GitHub repository.";
    elements.clear.hidden = true;
    console.error(error);
  }
}

init();
