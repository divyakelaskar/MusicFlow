import * as musicMetadata from 'music-metadata-browser';
import type { ID3Tags } from '@/types';

export const readID3Tags = async (file: File): Promise<ID3Tags> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const metadata = await musicMetadata.parseBlob(new Blob([arrayBuffer]));

    const { common, format, native } = metadata;
    
    // Extract artwork if available
    let artwork: { format: string; data: Uint8Array } | undefined;
    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0];
      artwork = {
        format: picture.format,
        data: new Uint8Array(picture.data)
      };
    }

    // Extract lyrics from native USLT frames
    let lyricsValue: string | undefined;
    
    if (native) {
      // Check all ID3 versions
      for (const [version, frames] of Object.entries(native)) {
        if (Array.isArray(frames)) {
          for (const frame of frames) {
            if (frame.id === 'USLT' || frame.id === 'SYLT') {
              // Handle the frame value structure
              if (frame.value) {
                // If it's an object with a text property
                if (typeof frame.value === 'object' && frame.value !== null && 'text' in frame.value) {
                  const textValue = (frame.value as any).text;
                  if (typeof textValue === 'string' && textValue.length > 0) {
                    lyricsValue = textValue;
                    break;
                  }
                }
                // If it's a string directly
                else if (typeof frame.value === 'string' && frame.value.length > 0) {
                  lyricsValue = frame.value;
                  break;
                }
              }
            }
          }
        }
        if (lyricsValue) break;
      }
    }

    const extractedTags: ID3Tags = {
      title: common.title,
      artist: common.artist,
      album: common.album,
      year: common.year?.toString(),
      genre: common.genre,
      track: common.track?.no || undefined,
      totalTracks: common.track?.of || undefined,
      disc: common.disk?.no || undefined,
      totalDiscs: common.disk?.of || undefined,
      composer: common.composer?.join(', '),
      publisher: common.label?.join(', '),
      bpm: common.bpm,
      comment: common.comment?.join(', '),
      lyrics: lyricsValue,
      albumArtist: common.albumartist,
      artwork: artwork,
      duration: format.duration,
      raw: metadata
    };

    return extractedTags;
  } catch (error) {
    console.warn('Error reading ID3 tags:', error);
    // Fallback to basic file info
    const fallbackTags: ID3Tags = {
      title: file.name.replace(/\.mp3$/i, '')
    };
    return fallbackTags;
  }
};

export const extractAlbumArt = (artwork: { format: string; data: Uint8Array }): string => {
  const base64String = btoa(
    artwork.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return `data:${artwork.format};base64,${base64String}`;
};