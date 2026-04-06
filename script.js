//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makeTitle(name, season, number) {
  return `${name} - S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  const movieCards = episodeList.map(
    ({ name, season, number, image, summary, url }) => {
      const movieCardTemplate = document.getElementById("movie-card");
      const movieCard = movieCardTemplate.content.cloneNode(true);
      movieCard.querySelector("h3").textContent = makeTitle(
        name,
        season,
        number,
      );
      movieCard.querySelector("img").src = image.medium;
      movieCard.querySelector("img").alt = name;
      movieCard.querySelector("p").innerHTML = summary;
      movieCard.querySelector("a").href = url;
      movieCard.querySelector("a").textContent = `https://TVMaze.com/${name}`;

      return movieCard;
    },
  );

  rootElem.append(...movieCards);
}

window.onload = setup;
