const searchShow = document.getElementById("search-show");
const searchInput = document.getElementById("search-input");
const rootElem = document.getElementById("root");
const showSelect = document.getElementById("show-select");
const episodeSelect = document.getElementById("episode-select");
const showView = document.getElementById("show-view");
const episodeView = document.getElementById("episode-view");
const showHeader = document.getElementById("show-header");
const episodeHeader = document.getElementById("episode-header");
const backToShowsView = document.getElementById("back-to-shows");
const foundShows = document.getElementById("found-shows");
const searchStatsElm = document.getElementById("search-stats");

const cache = {
  episodes: {},
  shows: {},
};
// let cache.episodes = {};
// let cache.shows = {};
function skeletonLoader(text = "Data being loaded...") {
  episodeView.innerHTML = `<h3>${text}</h3>`;
}

// Level 400: Initial setup to load all shows
async function setup() {
  showShowsPage();
  showView.innerHTML = "Shows being loaded...";
  try {
    // 1. Fetch all shows using the function in allEpisodes.js
    const allShows = await getAllShows();

    // 2. Requirement 5: Sort alphabetically (case-insensitive)
    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );
    cache.shows = allShows;
    makePageForShows(allShows);
    searchShow.addEventListener("input", (e) => {
      searchShows(e.target.value.toLowerCase(), allShows);
    });
  } catch (error) {
    rootElem.innerHTML = `<h3>Error initializing app: ${error.message}</h3>`;
  }
}

function makePageForShows(allShows) {
  showView.innerHTML = "";
  populateShowsDropDown(allShows);
  const showCardTemplate = document.getElementById("show-card-template");
  const showCards = allShows.map(
    ({
      id,
      name,
      genres,
      status,
      runtime,
      image = {},
      summary,
      rating = {},
    }) => {
      const { medium } = image;
      const { average } = rating;
      const showCard = showCardTemplate.content.cloneNode(true);
      const title = showCard.querySelector("h1");
      title.textContent = name;
      title.dataset.id = id;
      title.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!cache.episodes[id] || cache.episodes[id].length === 0) {
          cache.episodes[id] = await getAllEpisodes(id);
        }
        showSelect.value = id;

        initEpisodesUI(cache.episodes[id]);
      });
      showCard.querySelector("img").alt = name;
      showCard.querySelector("img").src = medium;

      showCard.querySelector("#summary").innerHTML = summary;
      showCard.querySelector("#rated").textContent += average;
      showCard.querySelector("#genres").textContent += genres.reduce(
        (acc, curr) => (acc += ` ${curr}`),
        "",
      );
      showCard.querySelector("#status").textContent += status;
      showCard.querySelector("#runtime").textContent += runtime;

      return showCard;
    },
  );

  showView.append(...showCards);
}
// Requirement 1 & 2: Handles the Show Dropdown
function populateShowsDropDown(allShows) {
  const options = allShows.map(({ name, id }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    return option;
  });
  showSelect.append(...options);

  showSelect.addEventListener("change", async (e) => {
    const id = e.target.value;
    if (id) {
      skeletonLoader("Loading episodes for selected show...");
      // Requirement 3: Fetch episodes for specific show
      if (!cache.episodes[id]) cache.episodes[id] = await getAllEpisodes(id);
      // Initialize the UI with the new data
      initEpisodesUI(cache.episodes[id]);
    } else {
      episodeView.innerHTML =
        "<h3>Please select a show from the dropdown above.</h3>";
      episodeSelect.innerHTML = '<option value="all">All episodes</option>';
    }
  });
}

// Requirement 4: Resets UI and Search when a new show is loaded
function initEpisodesUI(episodes) {
  searchInput.value = "";
  makePageForEpisodes(episodes);
  populateEpisodesDropDown(episodes);
  showEpisodesPage();

  backToShowsView.addEventListener("click", () => {
    searchShow.value = "";
    foundShows.textContent = "";
    searchShows();
    showShowsPage();
  });

  // Requirement 4: Refresh Search Listener
  // We replace the search input with a clone to remove old event listeners

  searchInput.addEventListener("input", (e) => {
    searchEpisodes(episodes, e.target.value);
  });

  // Reset search stats text
  searchStatsElm.textContent = `Displaying ${episodes.length} / ${episodes.length} episodes`;
}

function makeTitle(name, season, number) {
  return `${name} - S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function makePageForEpisodes(episodeList) {
  episodeView.innerHTML = "";

  const episodeCards = episodeList.map(
    ({ name, season, number, image, summary, url }) => {
      const episodeCardTemplate = document.getElementById(
        "episode-card-template",
      );
      const episodeCard = episodeCardTemplate.content.cloneNode(true);

      episodeCard.querySelector("h3").textContent = makeTitle(
        name,
        season,
        number,
      );

      // Safety check: Show placeholder if image is missing
      episodeCard.querySelector("img").src = image
        ? image.medium
        : "https://via.placeholder.com/210x295?text=No+Image";
      episodeCard.querySelector("img").alt = name;
      episodeCard.querySelector("p").innerHTML =
        summary || "No summary available.";
      episodeCard.querySelector("a").href = url;

      return episodeCard;
    },
  );

  episodeView.append(...episodeCards);
}

function searchShows(searchTerm = "", showsList = cache.shows) {
  const filteredShows = showsList.filter(
    ({ name, genres, summary }) =>
      name.toLowerCase().includes(searchTerm) ||
      summary.toLowerCase().includes(searchTerm) ||
      genres.some((genre) => genre.includes(searchTerm)),
  );
  foundShows.textContent = `found ${filteredShows.length} ${filteredShows.length === 1 ? "show" : "shows"}`;
  if (!searchTerm) foundShows.textContent = "";
  makePageForShows(filteredShows);
}
function searchEpisodes(allEpisodes, searchTerm) {
  episodeSelect.value = "all";
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  const filtered = allEpisodes.filter((episode) => {
    const nameMatch = episode.name.toLowerCase().includes(lowerCaseSearchTerm);
    const summaryMatch = episode.summary
      ? episode.summary.toLowerCase().includes(lowerCaseSearchTerm)
      : false;
    return nameMatch || summaryMatch;
  });
  const stats = document.getElementById("search-stats");
  stats.textContent = `Displaying ${filtered.length} / ${allEpisodes.length} episodes`;

  makePageForEpisodes(filtered);
}

function populateEpisodesDropDown(allEpisodes) {
  const select = document.getElementById("episode-select");
  // Requirement 4: Clear existing episode options
  select.innerHTML = '<option value="all">All episodes</option>';

  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = makeTitle(
      episode.name,
      episode.season,
      episode.number,
    );
    select.appendChild(option);
  });

  select.onchange = (e) => {
    const selectedId = e.target.value;
    if (selectedId === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      searchInput.value = "";

      searchStatsElm.textContent = `Displaying 1 / ${allEpisodes.length} episodes`;
      const selectedEpisode = allEpisodes.filter((ep) => ep.id == selectedId);
      makePageForEpisodes(selectedEpisode);
    }
  };
}

function showShowsPage() {
  showHeader.classList.remove("hidden");
  showView.classList.remove("hidden");
  episodeHeader.classList.add("hidden");
  episodeView.classList.add("hidden");
}
function showEpisodesPage() {
  showHeader.classList.add("hidden");
  showView.classList.add("hidden");
  episodeHeader.classList.remove("hidden");
  episodeView.classList.remove("hidden");
}

window.onload = setup;
