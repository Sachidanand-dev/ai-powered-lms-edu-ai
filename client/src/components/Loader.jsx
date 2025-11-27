import React from "react";
import { motion } from "framer-motion";
import { BarLoader, HashLoader } from "react-spinners";

const Loader = () => {
  return (
    <motion.div className="bg-slate-50 dark:bg-slate-950 w-full min-h-screen flex flex-col items-center justify-center fixed inset-0 z-50">
      <motion.div className="w-full min-h-screen flex flex-col items-center justify-center">
        <HashLoader color="#2443dc" size={60} className="" />
        <motion.div className="text-slate-900 dark:text-slate-100 text-2xl animate-pulse mt-8 mb-4 poppins-light font-medium">
          Loading...
        </motion.div>
        <BarLoader color="#2443dc" width={150} speedMultiplier={0.9} />
      </motion.div>
    </motion.div>
  );
};

export default Loader;
