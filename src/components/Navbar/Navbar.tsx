import { authModalState } from "@/atoms/authModalAtom";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useSetRecoilState } from "recoil";
type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
	const setAuthModalState = useSetRecoilState(authModalState);
	const handleClick = () => {
		setAuthModalState((prev) => ({ ...prev, isOpen: true }));
	};
	return (
		<nav className="sticky top-0 z-50 w-full bg-white/10 backdrop-blur-lg shadow-md rounded-b-2xl px-4 py-2 flex items-center justify-between">
			<Link href="/" className="flex items-center h-16">
				<Image src="/logo.png" alt="EliteCode" height={48} width={48} className="rounded-xl shadow" />
				<span className="ml-3 text-2xl font-extrabold text-white tracking-wide hidden sm:inline">EliteCode</span>
			</Link>
			<div className="flex items-center">
				<button
					className="bg-gradient-to-r from-brand-orange to-pink-500 text-white px-5 py-2 rounded-lg text-base font-semibold shadow hover:from-pink-500 hover:to-brand-orange transition-all duration-300 border-2 border-transparent hover:border-brand-orange"
					onClick={handleClick}
				>
					Sign In
				</button>
			</div>
		</nav>
	);
};
export default Navbar;
