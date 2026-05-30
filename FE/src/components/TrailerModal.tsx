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

  // Extract youtube ID
  let videoId = "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  if (match && match[1]) {
    videoId = match[1];
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
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-text-muted gap-4">
              <p>Không thể nhúng video này trực tiếp.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent-blood hover:underline">
                Xem trên trang chủ video
              </a>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
