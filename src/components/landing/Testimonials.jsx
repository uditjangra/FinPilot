import React from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const testimonials = [
    {
        quote: "This app helped me track my loans properly for the first time.",
        author: "Aarav Sharma",
        role: "Product Designer",
    },
    {
        quote: "I stopped missing EMI dates and finally built a real savings habit.",
        author: "Nisha Patel",
        role: "Marketing Lead",
    },
    {
        quote: "The dashboard made my monthly planning feel simple instead of stressful.",
        author: "Rahul Mehta",
        role: "Software Engineer",
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Testimonials</p>
                    <h2 className="mt-3 text-3xl md:text-4xl font-display font-black tracking-tight">
                        Trusted By People Who Want Control Over Money
                    </h2>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {testimonials.map((item, index) => (
                        <MotionDiv
                            key={item.author}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                            className="bg-surface border border-border rounded-3xl p-6"
                        >
                            <p className="text-base font-semibold text-text-primary">&ldquo;{item.quote}&rdquo;</p>
                            <p className="mt-5 text-sm font-black">{item.author}</p>
                            <p className="text-xs text-text-secondary">{item.role}</p>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
