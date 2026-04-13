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

// Function to get the list of all shows (Requirement 2)
async function getAllShows() {
  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) throw new Error("Could not load shows");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Function to get episodes based on a specific show ID (Requirement 3)
async function getEpisodesForShow(showId) {
  try {
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) throw new Error("Could not load episodes");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
