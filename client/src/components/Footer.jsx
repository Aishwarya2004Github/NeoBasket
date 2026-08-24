import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 relative overflow-hidden mt-auto">
      {/* Bottom Gradient Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-600 via-pink-500 via-yellow-400 to-cyan-500" />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-20 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />

      <div className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-5">
          
          {/* Brand & Address */}
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
            <p className="text-sm font-bold tracking-wide text-slate-400">
              © {currentYear}{" "}
              <span className="bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-400 bg-clip-text text-transparent font-black">
                NeoBasket MARKET
              </span>
              . All Rights Reserved.
            </p>

            <p className="text-xs text-slate-500 max-w-xl">
              NeoBasket, 16/3A Shree Apartments, Central Avenue,
              Kesavaperumal Puram, Chennai, Tamil Nadu – 600020, India
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6 justify-center">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-slate-400 hover:text-blue-500 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1 filter hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
            >
              <FaFacebook size={24} />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-slate-400 hover:text-pink-500 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1 filter hover:drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]"
            >
              <FaInstagram size={24} />
            </a>

            {/* Twitter / X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-slate-400 hover:text-cyan-400 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1 filter hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            >
              <FaTwitter size={24} />
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-slate-400 hover:text-blue-400 transition-all duration-300 transform hover:scale-125 hover:-translate-y-1 filter hover:drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]"
            >
              <FaLinkedin size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;