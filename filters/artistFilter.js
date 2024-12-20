// filters/artistFilter.js
export function artistFilter(songs, artistTerm) {
    return songs.filter((song) => {
      const artistName = String(song.track_artist || '').toLowerCase();
      return !artistTerm || artistName.includes(artistTerm.toLowerCase().trim());
    });
  }  