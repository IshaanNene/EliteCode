import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import Topbar from "@/components/Topbar/Topbar";
import useHasMounted from "@/hooks/useHasMounted";
// Commented out unused imports
// import { firestore } from "@/firebase/firebase";
// import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
	const [loadingProblems, setLoadingProblems] = useState(true);
	const hasMounted = useHasMounted();

	// Commented out problem submission logic
	// const [inputs, setInputs] = useState({
	// 	id: "",
	// 	title: "",
	// 	difficulty: "",
	// 	category: "",
	// 	videoId: "",
	// 	link: "",
	// 	order: 0,
	// 	likes: 0,
	// 	dislikes: 0,
	// });

	// Commented out input change handler
	// const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	setInputs({
	// 		...inputs,
	// 		[e.target.name]: e.target.value,
	// 	});
	// };

	// Commented out submit handler
	// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	// 	e.preventDefault();
	// 	//convert inputs.order to number
	// 	const newProblem = {
	// 		...inputs,
	// 		order: Number(inputs.order),
	// 	};
	// 	await setDoc(doc(firestore, "problems", inputs.id), newProblem);
	// 	alert("saved to db");
	// };

	if (!hasMounted) return null;

	return (
		<>
			<main className="min-h-screen bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#0a0a23]">
				<Topbar />

				{/* Hero Section */}
				<section className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-r from-brand-orange/80 to-pink-600/80 shadow-lg">
					<h1 className="text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg mb-4">
						Level Up Your Coding Skills
					</h1>
					<p className="text-lg md:text-2xl text-white/90 text-center max-w-2xl mb-6">
						Practice hand-picked coding problems, track your progress, and ace your next technical interview.
					</p>
					<Link href="#problems">
						<button className="bg-white text-brand-orange font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-brand-orange hover:text-white transition-all duration-300 text-lg">
							Get Started
						</button>
					</Link>
				</section>

				{/* Main Heading */}
				<h2 className="text-2xl md:text-3xl text-center text-gray-200 font-semibold uppercase mt-12 mb-2 tracking-wide">
					&ldquo; Quality Over Quantity &rdquo;
				</h2>
				<p className="text-center text-gray-400 mb-8 text-base md:text-lg">
					Curated problems, real interview experience.
				</p>

				{/* Problems Table */}
				<div id="problems" className="relative overflow-x-auto mx-auto px-2 pb-10 max-w-5xl">
					{loadingProblems && (
						<div className="max-w-4xl mx-auto w-full animate-pulse">
							{[...Array(10)].map((_, idx) => (
								<LoadingSkeleton key={idx} />
							))}
						</div>
					)}
					<table className="text-sm text-left text-gray-300 w-full rounded-2xl shadow-2xl overflow-hidden bg-dark-layer-2 border border-dark-fill-3">
						{!loadingProblems && (
							<thead className="text-xs text-gray-200 uppercase bg-dark-fill-3 border-b border-dark-fill-2">
								<tr>
									<th scope="col" className="px-1 py-3 w-0 font-semibold">Status</th>
									<th scope="col" className="px-6 py-3 w-0 font-semibold">Title</th>
									<th scope="col" className="px-6 py-3 w-0 font-semibold">Difficulty</th>
									<th scope="col" className="px-6 py-3 w-0 font-semibold">Category</th>
									<th scope="col" className="px-6 py-3 w-0 font-semibold">Solution</th>
								</tr>
							</thead>
						)}
						<ProblemsTable setLoadingProblems={setLoadingProblems} />
					</table>
				</div>
			</main>
		</>
	);
}

const LoadingSkeleton = () => {
	return (
		<div className="flex items-center space-x-12 mt-4 px-6">
			<div className="w-6 h-6 shrink-0 rounded-full bg-dark-layer-1"></div>
			<div className="h-4 sm:w-52  w-32  rounded-full bg-dark-layer-1"></div>
			<div className="h-4 sm:w-52  w-32 rounded-full bg-dark-layer-1"></div>
			<div className="h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1"></div>
			<span className="sr-only">Loading...</span>
		</div>
	);
};