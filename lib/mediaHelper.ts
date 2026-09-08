/**
 * Utilitário para tratamento de mídias (Imagens, Vídeos Diretos, YouTube, Vimeo)
 */

export interface MediaDetails {
  type: 'youtube' | 'vimeo' | 'direct_video' | 'image';
  embedUrl?: string;
  thumbnailUrl?: string;
  rawUrl: string;
}

export function parseMediaUrl(url?: string): MediaDetails | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // YouTube match (watch, shorts, embed, youtu.be)
  const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      rawUrl: cleanUrl
    };
  }

  // Vimeo match
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      thumbnailUrl: '',
      rawUrl: cleanUrl
    };
  }

  // Direct video match (.mp4, .webm, .ogg)
  if (cleanUrl.match(/\.(mp4|webm|ogg)(\?.*)?$/i) || cleanUrl.includes('assets.mixkit.co')) {
    return {
      type: 'direct_video',
      rawUrl: cleanUrl
    };
  }

  // Default to regular image
  return {
    type: 'image',
    thumbnailUrl: cleanUrl,
    rawUrl: cleanUrl
  };
}

/**
 * Retorna a melhor imagem para exibir o produto.
 * Se a imageUrl for um link do YouTube, converte automaticamente para a miniatura do vídeo.
 */
export function getProductDisplayImage(imageUrl?: string, videoUrl?: string): string {
  const fallback = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800';
  
  if (imageUrl && imageUrl.trim()) {
    const parsedImg = parseMediaUrl(imageUrl);
    if (parsedImg?.type === 'youtube' && parsedImg.thumbnailUrl) {
      return parsedImg.thumbnailUrl;
    }
    return imageUrl.trim();
  }

  if (videoUrl && videoUrl.trim()) {
    const parsedVid = parseMediaUrl(videoUrl);
    if (parsedVid?.type === 'youtube' && parsedVid.thumbnailUrl) {
      return parsedVid.thumbnailUrl;
    }
  }

  return fallback;
}
