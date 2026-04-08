import React from "react";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

const MotionMain = motion.main;
const MotionDiv = motion.div;

export default function Layout({ children, title, subtitle, extraHeader }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <div className="min-h-screen bg-primary-bg pb-12">
            <Navbar />

            <MotionMain
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
            >
                {(title || extraHeader) && (
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <MotionDiv variants={itemVariants}>
                            {title && <h1 className="text-3xl font-bold text-text-primary tracking-tight font-display">{title}</h1>}
                            {subtitle && <p className="text-text-secondary mt-1">{subtitle}</p>}
                        </MotionDiv>

                        {extraHeader && (
                            <MotionDiv variants={itemVariants}>
                                {extraHeader}
                            </MotionDiv>
                        )}
                    </header>
                )}

                <MotionDiv variants={itemVariants}>
                    {children}
                </MotionDiv>
            </MotionMain>
        </div>
    );
}
