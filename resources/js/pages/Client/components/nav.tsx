'use client';

 
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartPulseIcon, ShoppingBagIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

const btnDark = 'group inline-flex items-center justify-center gap-2 rounded-full bg-[#0F1115] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#337983] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F1115]';

/** [label, href] pairs used when no `links` prop is passed. */
export const defaultLinks: string[][] = [
    ['Services', '#services'],
    ['Doctors', '#doctors'],
    ['Clinics', '#clinics'],
    ['Products', '#products'],
    ['FAQ', '#faq'],
];

type NavProps = {
    cartCount?: number;
    /** Optional [label, href] pairs, e.g. ['Services', '#services'] */
    links?: string[][];
};

/** Hide-on-scroll navbar: sliding pill on desktop, animated sidebar on mobile. */
export default function Nav({ cartCount = 0, links = defaultLinks }: NavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('');
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [showNav, setShowNav] = useState(true);

    const spring = { type: 'spring' as const, stiffness: 400, damping: 40 };
    const sidebarVariants = { closed: { x: '100%', transition: spring }, opened: { x: 0, transition: spring } };
    const linkVariants = {
        closed: { opacity: 0, x: 20 },
        opened: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.08 } }),
    };
    const pillSpring = { type: 'spring' as const, stiffness: 500, damping: 35, mass: 0.5 };

    useEffect(() => {
        let last = window.scrollY;
        const onScroll = () => {
            const y = window.scrollY;
            if (y <= 20) setShowNav(true);
            else if (y > last) setShowNav(false);
            else if (y < last) setShowNav(true);
            last = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [isOpen]);

    const bar = (anim: object) => (
        <motion.span animate={anim} className={`h-0.5 w-[22px] origin-center rounded-full ${isOpen ? 'bg-[#337983]' : 'bg-[#3B3F4A]'}`} />
    );

    return (
        <>
            <motion.header
                initial={false}
                animate={{ y: showNav ? 0 : '-120%' }}
                transition={spring}
                className="fixed left-0 top-4 z-[10000] w-full px-4 py-4 text-[#0F1115] sm:px-8"
            >
                <div className="relative mx-auto flex max-w-[1280px] items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1.5 pl-1.5 pr-4 text-base font-semibold tracking-tight backdrop-blur-lg">
                        <span className="grid size-8 place-items-center rounded-full bg-[#337983] text-white"><HeartPulseIcon className="size-4" /></span>nuria
                    </Link>

                    {/* Desktop pill with sliding hover + active indicator */}
                    <nav
                        aria-label="Main"
                        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 backdrop-blur-lg lg:flex"
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {links.map(([label, href]) => {
                            const hovered = hoveredItem === label;
                            const active = activeItem === label;
                            return (
                                <a
                                    key={href}
                                    href={href}
                                    aria-current={active ? 'true' : undefined}
                                    onMouseEnter={() => setHoveredItem(label)}
                                    onFocus={() => setHoveredItem(label)}
                                    onBlur={() => setHoveredItem(null)}
                                    onClick={() => setActiveItem(label)}
                                    className="relative rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] outline-none focus-visible:ring-2 focus-visible:ring-[#337983]"
                                >
                                    {hovered && <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full border border-slate-200 bg-white shadow-sm" transition={pillSpring} />}
                                    {!hoveredItem && active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-full border border-slate-200 bg-white shadow-sm" transition={pillSpring} />}
                                    <span className={`relative z-10 transition-colors ${active ? 'text-[#337983]' : ''}`}>{label}</span>
                                </a>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        <a href="#products" aria-label={`Cart, ${cartCount} items`} className="relative grid size-10 place-items-center rounded-full border border-slate-200 bg-white/80 backdrop-blur-lg transition hover:border-[#337983]">
                            <ShoppingBagIcon className="size-5" />
                            {cartCount > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#337983] text-[11px] font-semibold text-white">{cartCount}</span>}
                        </a>
                        <Link href="/clinics" className="hidden rounded-full bg-[#337983] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#0F1115] sm:inline-block">Book online</Link>
                        <button
                            type="button"
                            aria-label={isOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isOpen}
                            onClick={() => setIsOpen((p) => !p)}
                            className={`flex size-10 items-center justify-center rounded-xl border bg-white/80 backdrop-blur-lg transition-colors lg:hidden ${isOpen ? 'border-[#337983]' : 'border-slate-300'}`}
                        >
                            <span className="flex flex-col gap-1.5">
                                {bar(isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 })}
                                {bar(isOpen ? { opacity: 0 } : { opacity: 1 })}
                                {bar(isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 })}
                            </span>
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile sidebar (outside the transformed header so `fixed` works) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm" />
                        <motion.aside
                            key="sidebar"
                            aria-label="Menu"
                            variants={sidebarVariants}
                            initial="closed"
                            animate="opened"
                            exit="closed"
                            className="fixed right-0 top-0 z-[9999] h-screen w-[290px] bg-white p-8 shadow-xl"
                        >
                            <div className="flex h-full flex-col justify-between">
                                <nav aria-label="Mobile" className="mt-24 flex flex-col gap-7">
                                    {links.map(([label, href], i) => (
                                        <motion.a key={href} href={href} custom={i} variants={linkVariants} onClick={() => { setActiveItem(label); setIsOpen(false); }}
                                            className="text-xl font-medium uppercase tracking-wider text-zinc-900 transition-colors hover:text-[#337983]">{label}</motion.a>
                                    ))}
                                    <motion.div custom={links.length} variants={linkVariants}>
                                        <Link href="/clinics" onClick={() => setIsOpen(false)} className={`${btnDark} w-full`}>Book online</Link>
                                    </motion.div>
                                </nav>
                                <div className="flex flex-col gap-5 pb-4">
                                    <div>
                                        <motion.h4 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-1 text-xs font-black uppercase tracking-wider">Nuria Health</motion.h4>
                                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-[12px] italic leading-relaxed text-gray-500">Verified clinics, doctors<br />and health products.</motion.p>
                                    </div>
                                    <motion.div className="flex flex-col gap-1" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 0.7 } } }}>
                                        <motion.span variants={{ hidden: { opacity: 0, x: -5 }, visible: { opacity: 1, x: 0 } }} className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#337983]">Connect</motion.span>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold uppercase">
                                            {['LinkedIn', 'Instagram', 'Facebook', 'X'].map((s) => (
                                                <motion.a key={s} href="#" variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -2 }} className="transition-colors hover:text-[#337983]">{s}</motion.a>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
