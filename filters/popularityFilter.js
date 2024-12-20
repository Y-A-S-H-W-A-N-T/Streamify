// filters/popularityFilter.js
export function popularityFilter(songs, popularity) {
    return songs.filter((song) => {
      const popularityCategory =
        (song.track_popularity || 0) <= 25
          ? "low"
          : (song.track_popularity || 0) <= 50
          ? "average"
          : (song.track_popularity || 0) <= 75
          ? "medium"
          : "high";
      
      return !popularity || popularityCategory === popularity;
    });
  }  