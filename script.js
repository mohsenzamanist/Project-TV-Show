const searchInput = document.getElementById("search-input");
const rootElem = document.getElementById("root");
const showSelect = document.getElementById("show-select");
const episodeSelect = document.getElementById("episode-select");

function skeletonLoader(text = "Data being loaded...") {
  rootElem.innerHTML = `<h3>${text}</h3>`;
}

// Level 400: Initial setup to load all shows
async function setup() {
  skeletonLoader("Loading shows list...");

  try {
    // 1. Fetch all shows using the function in allEpisodes.js
    const allShows = await getAllShows();

    // 2. Requirement 5: Sort alphabetically (case-insensitive)
    allShows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
    );

    // 3. Populate the Show Dropdown
    populateShowSelect(allShows);

    rootElem.innerHTML =
      "<h3>Please select a show from the dropdown above.</h3>";
  } catch (error) {
    rootElem.innerHTML = `<h3>Error initializing app: ${error.message}</h3>`;
  }
}

// Requirement 1 & 2: Handles the Show Dropdown
function populateShowSelect(allShows) {
  const options = allShows.map(({ name, id }) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    return option;
  });
  showSelect.append(...options);

  showSelect.addEventListener("change", async (e) => {
    const showId = e.target.value;
    if (showId) {
      skeletonLoader("Loading episodes for selected show...");
      // Requirement 3: Fetch episodes for specific show
      const episodes = await getAllEpisodes(showId);

      // Initialize the UI with the new data
      initEpisodesUI(episodes);
    } else {
      rootElem.innerHTML =
        "<h3>Please select a show from the dropdown above.</h3>";
      episodeSelect.innerHTML = '<option value="all">All episodes</option>';
    }
  });
}

// Requirement 4: Resets UI and Search when a new show is loaded
function initEpisodesUI(episodes) {
  makePageForEpisodes(episodes);
  populateSelect(episodes);

  // Requirement 4: Refresh Search Listener
  // We replace the search input with a clone to remove old event listeners
  const newSearch = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearch, searchInput);

  newSearch.addEventListener("input", (e) => {
    searchEpisodes(episodes, e.target.value);
  });

  // Reset search stats text
  document.getElementById("search-stats").textContent =
    `Displaying ${episodes.length} / ${episodes.length} episodes`;
}

function makeTitle(name, season, number) {
  return `${name} - S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function makePageForEpisodes(episodeList) {
  rootElem.innerHTML = "";

  const movieCards = episodeList.map(
    ({ name, season, number, image, summary, url }) => {
      const movieCardTemplate = document.getElementById("movie-card");
      const movieCard = movieCardTemplate.content.cloneNode(true);

      movieCard.querySelector("h3").textContent = makeTitle(
        name,
        season,
        number,
      );

      // Safety check: Show placeholder if image is missing
      movieCard.querySelector("img").src = image
        ? image.medium
        : "https://via.placeholder.com/210x295?text=No+Image";
      movieCard.querySelector("img").alt = name;
      movieCard.querySelector("p").innerHTML =
        summary || "No summary available.";
      movieCard.querySelector("a").href = url;

      return movieCard;
    },
  );

  rootElem.append(...movieCards);
}

function searchEpisodes(allEpisodes, searchTerm) {
  const lowerSearch = searchTerm.toLowerCase();
  const filtered = allEpisodes.filter((episode) => {
    const nameMatch = episode.name.toLowerCase().includes(lowerSearch);
    const summaryMatch = episode.summary
      ? episode.summary.toLowerCase().includes(lowerSearch)
      : false;
    return nameMatch || summaryMatch;
  });

  const stats = document.getElementById("search-stats");
  stats.textContent = `Displaying ${filtered.length} / ${allEpisodes.length} episodes`;

  makePageForEpisodes(filtered);
}

function populateSelect(allEpisodes) {
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
      const selectedEpisode = allEpisodes.filter((ep) => ep.id == selectedId);
      makePageForEpisodes(selectedEpisode);
    }
  };
}

window.onload = setup;
