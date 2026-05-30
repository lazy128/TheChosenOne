import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  url: string | null;
  onClose: () => void;
}

export function TrailerModal({ url, onClose }: Props) {
  // Lock scroll
  useEffect(() => {
    if (url) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [url]);

  if (!url) return null;

  // Check if it's a direct video file
  const isDirectVideo = url.match(/\.(mp4|webm|ogg)$/i) !== null;

  // Extract youtube ID with a very robust regex
  let videoId = "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    videoId = ytMatch[1];
  }

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 hover:text-accent-blood"
        >
          <X size={24} />
        </button>
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {videoId ? (
            <iframe
              src={embedUrl}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-none"
            />
          ) : isDirectVideo ? (
            <video 
              src={url} 
              autoPlay 
              controls 
              className="h-full w-full object-contain"
            />
          ) : (
            <iframe
              src={url}
              title="Trailer"
              allowFullScreen
              className="h-full w-full border-none bg-white"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
