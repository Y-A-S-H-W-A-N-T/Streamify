// filters/songFilter.js
export function songFilter(songs, songTerm) {
    return songs.filter((song) => {
      const songName = String(song.track_name || '').toLowerCase();
      return !songTerm || songName.includes(songTerm.toLowerCase().trim());
    });
  }  