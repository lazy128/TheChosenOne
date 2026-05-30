import { motion } from "framer-motion";

const socials = [
  {
    name: "Google",
    color: "#4285F4",
    path: "M21.35 11.1H12v3.2h5.35c-.5 2.6-2.8 4.2-5.35 4.2-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.4 0 2.7.5 3.7 1.3l2.4-2.4C16.5 4.3 14.3 3.4 12 3.4 6.9 3.4 2.8 7.5 2.8 12.7s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-9 0-.7-.1-1.3-.45-1.9z",
  },
  {
    name: "Facebook",
    color: "#1877F2",
    path: "M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H8v-2.9h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8h2.6l-.4 2.9h-2.2v7C18.3 21.1 22 17 22 12z",
  },
  {
    name: "Apple",
    color: "#ffffff",
    path: "M16.4 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.6.8-.8 0-1.9-.8-3.2-.8-1.6 0-3.2 1-4 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.7 2.5 2.9 2.5 1.2-.05 1.6-.8 3-.8s1.8.8 3 .75c1.2 0 2-1.2 2.8-2.4.9-1.4 1.3-2.7 1.3-2.8-.05 0-2.5-1-2.5-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-.95.05-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1 .1 2.1-.5 2.8-1.4z",
  },
];

export function SocialButtons() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {socials.map((s, i) => (
        <motion.button
          key={s.name}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-lg border border-white/8 bg-black/30 px-2 py-2.5 text-xs text-text-muted transition-colors duration-200"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = s.color + "66";
            e.currentTarget.style.color = s.color;
            e.currentTarget.style.boxShadow = `0 0 20px ${s.color}22`;
            e.currentTarget.style.background = `${s.color}0d`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.color = "";
            e.currentTarget.style.boxShadow = "";
            e.currentTarget.style.background = "";
          }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0">
            <path d={s.path} />
          </svg>
          <span className="hidden sm:inline font-mono text-[9px] tracking-[0.15em]">
            {s.name.toUpperCase()}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
