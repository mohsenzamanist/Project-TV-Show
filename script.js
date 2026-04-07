function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  populateSelect(allEpisodes);

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchEpisodes(allEpisodes, e.target.value);
  });
}

function makeTitle(name, season, number) {
  return `${name} - S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Fix: Clear previous episodes

  const movieCards = episodeList.map(
    ({ name, season, number, image, summary, url }) => {
      const movieCardTemplate = document.getElementById("movie-card");
      const movieCard = movieCardTemplate.content.cloneNode(true);
      
      movieCard.querySelector("h3").textContent = makeTitle(name, season, number);
      movieCard.querySelector("img").src = image.medium;
      movieCard.querySelector("img").alt = name;
      movieCard.querySelector("p").innerHTML = summary;
      movieCard.querySelector("a").href = url;
      movieCard.querySelector("a").textContent = "View on TVMaze"; // Cleaner link text

      return movieCard;
    }
  );

  rootElem.append(...movieCards);
}

function searchEpisodes(allEpisodes, searchTerm) {
  const lowerSearch = searchTerm.toLowerCase();
  const filtered = allEpisodes.filter((episode) => {
    return (
      episode.name.toLowerCase().includes(lowerSearch) || 
      episode.summary.toLowerCase().includes(lowerSearch)
    );
  });

  const stats = document.getElementById("search-stats");
  stats.textContent = `Displaying ${filtered.length} / ${allEpisodes.length} episodes`;

  makePageForEpisodes(filtered);
}

function populateSelect(allEpisodes) {
  const select = document.getElementById("episode-select");
  
  allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = makeTitle(episode.name, episode.season, episode.number);
    select.appendChild(option);
  });

  select.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    if (selectedId === "all") {
      makePageForEpisodes(allEpisodes);
    } else {
      const selectedEpisode = allEpisodes.filter(ep => ep.id == selectedId);
      makePageForEpisodes(selectedEpisode);
    }
  });
}

window.onload = setup;