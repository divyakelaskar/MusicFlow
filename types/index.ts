export interface ID3Tags {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  type?: string;
  duration?: number;
  genre?: string[];
  track?: number;
  totalTracks?: number;
  disc?: number;
  totalDiscs?: number;
  composer?: string;
  publisher?: string;
  bpm?: number;
  comment?: string;
  lyrics?: string;
  albumArtist?: string;
  artwork?: {
    format: string;
    data: Uint8Array;
  };
  // Raw ID3 frames for advanced use
  raw?: {
    [key: string]: any;
  };
}

export interface Song {
  id: string;
  file: File;
  name: string;
  artist: string;
  duration?: number;
  albumArt?: string;
  album?: string;
  colorPalette?: string[];
  id3Tags?: ID3Tags;
  // Display settings (per song or global)
  displaySettings?: DisplaySettings;
}

export interface DisplaySettings {
  showYear: boolean;
  showGenre: boolean;
  showTrackNumber: boolean;
  showDuration: boolean;
  showComposer: boolean;
  showComment: boolean;
  showLyrics: boolean;
}

export interface PlaylistState {
  songs: Song[];
  currentSongIndex: number;
  isPlaying: boolean;
  displaySettings: DisplaySettings;
}

