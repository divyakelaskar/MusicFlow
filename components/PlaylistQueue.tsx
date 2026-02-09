'use client';
import { Song } from '@/types';

interface PlaylistQueueProps {
  songs: Song[];
  currentSongIndex: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (songId: string) => void;
  colors: {
    background: string;
    cardBackground: string;
    heading: string;
    subtitle: string;
  };
}

export default function PlaylistQueue({
  songs,
  currentSongIndex,
  onReorder,
  onRemove,
  colors
}: PlaylistQueueProps) {
  // Helper functions for color analysis
  const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const sRGB = [r, g, b].map(c => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const isLightColor = (hex: string) => {
    return getLuminance(hex) > 0.5;
  };

  const getContrastColor = (hex: string) => {
    return isLightColor(hex) ? '#000000' : '#FFFFFF';
  };

  const getReadableTextColor = (bgColor: string) => {
    if (isLightColor(bgColor)) {
      // For light backgrounds, use a darker variant
      return colors.subtitle || '#374151'; // Default gray-700
    } else {
      // For dark backgrounds, use light text
      return colors.cardBackground || '#FFFFFF';
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    onReorder(fromIndex, targetIndex);
  };

  const headingIsLight = isLightColor(colors.heading);
  const textColor = getReadableTextColor(colors.heading);
  const contrastColor = getContrastColor(colors.heading);

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {songs.map((song, index) => {
        const isCurrentSong = index === currentSongIndex;
        
        return (
          <div
            key={song.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-move ${isCurrentSong
                ? 'shadow-md'
                : 'hover:bg-opacity-90'
              }`}
            style={{
              backgroundColor: colors.heading,
              borderColor: isCurrentSong
                ? headingIsLight ? colors.subtitle : colors.cardBackground
                : headingIsLight ? `${colors.subtitle}40` : `${colors.cardBackground}40`,
              opacity: isCurrentSong ? 1 : 0.85
            }}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCurrentSong ? 'text-white' : ''
                  }`}
                style={{
                  backgroundColor: headingIsLight ? colors.subtitle : colors.cardBackground,
                  color: headingIsLight ? colors.cardBackground : colors.subtitle
                }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`font-medium truncate ${isCurrentSong ? 'font-bold' : ''
                    }`}
                  style={{ color: textColor }}
                >
                  {song.id3Tags?.title || song.name}
                </div>
                {song.id3Tags?.artist && (
                  <div
                    className="text-sm truncate"
                    style={{
                      color: textColor,
                      opacity: isCurrentSong ? 0.9 : 0.7
                    }}
                  >
                    {song.id3Tags.artist}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(song.id)}
              className="transition-colors p-1 rounded-full w-7 h-7 flex items-center justify-center hover:scale-110 border"
              style={{
                color: headingIsLight ? colors.heading : 'white',
                borderColor: headingIsLight ? colors.heading : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = headingIsLight ? colors.heading : 'white';
                e.currentTarget.style.borderColor = headingIsLight ? colors.heading : 'transparent';
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}