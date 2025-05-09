"use client";
import React from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { DollarSign, ShoppingBag, SquareActivity, User } from "lucide-react";
const page = () => {
  return (
    <div className="flex-1 overflow-y-auto relative z-10 min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard name="Total Sales" icon={DollarSign} value="$12000" />
          <StatCard name="Total Client" icon={User} value="14000" />
          <StatCard name="Total Product" icon={ShoppingBag} value="674" />
          <StatCard name="Stock" icon={SquareActivity} value="128128" />
        </motion.div>
      </main>
    </div>
  );
};

export default page;
