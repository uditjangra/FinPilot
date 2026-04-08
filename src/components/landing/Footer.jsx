import React from "react";

const footerLinks = {
    product: ["About", "Contact", "Privacy Policy", "Terms"],
    socials: [
        { label: "GitHub", href: "https://github.com/" },
        { label: "LinkedIn", href: "https://www.linkedin.com/" },
        { label: "X", href: "https://x.com/" },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-border py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <p className="font-display text-xl font-black">Finance<span className="text-accent">Flow</span></p>
                        <p className="mt-2 text-sm text-text-secondary max-w-sm">
                            A smarter way to track EMIs, expenses, and goals in one private dashboard.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-widest font-black text-text-secondary">Company</p>
                        <ul className="mt-3 space-y-2">
                            {footerLinks.product.map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-xs uppercase tracking-widest font-black text-text-secondary">Social</p>
                        <ul className="mt-3 space-y-2">
                            {footerLinks.socials.map((item) => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <p className="mt-10 text-xs text-text-secondary">
                    &copy; {new Date().getFullYear()} FinanceFlow. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
