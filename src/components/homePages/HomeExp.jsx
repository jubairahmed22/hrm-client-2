"use client";

import React from "react";
import homeImage from "../../assets/home-imager.jpg";
import { motion } from "framer-motion";
import AnimatedBackground from "../Background/AnimatedBackground";

const HomeExp = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-[Poppins]">

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Foreground Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl px-8 py-12 backdrop-blur-2xl 
                   bg-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.25)]
                   border border-white/30 text-center
                   hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-500"
      >
        {/* Gradient Glow Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/30 to-blue-400/20 blur-xl -z-10"></div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-4xl font-extrabold text-white drop-shadow-sm"
        >
          Welcome to your HRM Dashboard
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-lg text-white"
        >
          Streamline workforce management with modern automation and insights.
        </motion.p>

        {/* Image */}
        <motion.img
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          src={homeImage.src}
          alt="Dashboard Illustration"
          className="w-60 h-60 object-cover rounded-2xl shadow-xl mx-auto mt-8"
        />

        {/* Buttons Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mt-10 flex justify-center gap-4"
        >
          <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 active:scale-95 transition-all">
            Get Started
          </button>

          <button className="px-6 py-3 rounded-xl bg-white/50 backdrop-blur-md text-gray-900 font-semibold border border-gray-300 hover:bg-white/70 active:scale-95 transition-all">
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HomeExp;
