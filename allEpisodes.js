const url = "https://api.tvmaze.com/shows/82/episodes";
async function getAllEpisodes() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sth went wrong. ${response.status}`);
    }
    const episodes = await response.json();
    return episodes;
  } catch (error) {
    console.error(error);
    return [];
  }
}
