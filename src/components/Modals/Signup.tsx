import { authModalState } from "@/atoms/authModalAtom";
import { auth, firestore } from "@/firebase/firebase";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FirebaseError } from "firebase/app";

type SignupProps = {};

const Signup: React.FC<SignupProps> = () => {
	const setAuthModalState = useSetRecoilState(authModalState);
	const handleClick = () => {
		setAuthModalState((prev) => ({ ...prev, type: "login" }));
	};
	const [inputs, setInputs] = useState({ email: "", displayName: "", password: "" });
	const router = useRouter();
	const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
	const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!inputs.email || !inputs.password || !inputs.displayName) return alert("Please fill all fields");
		try {
			toast.loading("Creating your account", { position: "top-center", toastId: "loadingToast" });
			const newUser = await createUserWithEmailAndPassword(inputs.email, inputs.password);
			if (!newUser) return;
			const userData = {
				uid: newUser.user.uid,
				email: newUser.user.email,
				displayName: inputs.displayName,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				likedProblems: [],
				dislikedProblems: [],
				solvedProblems: [],
				starredProblems: [],
			};
			await setDoc(doc(firestore, "users", newUser.user.uid), userData);
			router.push("/");
		} catch (error: any) {
			if (error instanceof FirebaseError) {
				switch (error.code) {
					case 'auth/configuration-not-found':
						toast.error('Firebase configuration is missing or incorrect. Please contact support.', { position: "top-center" });
						break;
					case 'auth/invalid-api-key':
						toast.error('Invalid Firebase API key. Please check your configuration.', { position: "top-center" });
						break;
					default:
						toast.error(error.message, { position: "top-center" });
				}
			} else {
				toast.error(error.message, { position: "top-center" });
			}
		} finally {
			toast.dismiss("loadingToast");
		}
	};

	useEffect(() => {
		if (error) {
			alert(error.message);
		}
	}, [error]);

	return (
		<form className="space-y-7 px-2 py-2" onSubmit={handleRegister}>
			<h3 className="text-2xl font-extrabold text-center text-pink-400 mb-2">Create your EliteCode Account</h3>
			<div className="space-y-4">
				<div>
					<label htmlFor="email" className="text-sm font-medium block mb-2 text-white/80">
						Email
					</label>
					<input
						onChange={handleChangeInput}
						type="email"
						name="email"
						id="email"
						className="border-none outline-none sm:text-sm rounded-lg focus:ring-2 focus:ring-pink-400 block w-full p-3 bg-white/20 text-white placeholder-white/60 shadow-inner transition-all"
						placeholder="name@company.com"
					/>
				</div>
				<div>
					<label htmlFor="displayName" className="text-sm font-medium block mb-2 text-white/80">
						Display Name
					</label>
					<input
						onChange={handleChangeInput}
						type="text"
						name="displayName"
						id="displayName"
						className="border-none outline-none sm:text-sm rounded-lg focus:ring-2 focus:ring-pink-400 block w-full p-3 bg-white/20 text-white placeholder-white/60 shadow-inner transition-all"
						placeholder="John Doe"
					/>
				</div>
				<div>
					<label htmlFor="password" className="text-sm font-medium block mb-2 text-white/80">
						Password
					</label>
					<input
						onChange={handleChangeInput}
						type="password"
						name="password"
						id="password"
						className="border-none outline-none sm:text-sm rounded-lg focus:ring-2 focus:ring-pink-400 block w-full p-3 bg-white/20 text-white placeholder-white/60 shadow-inner transition-all"
						placeholder="*******"
					/>
				</div>
			</div>

			<button
				type="submit"
				className="w-full text-white font-bold rounded-lg text-base px-5 py-3 mt-2 bg-gradient-to-r from-pink-400 to-brand-orange shadow-lg hover:from-brand-orange hover:to-pink-400 transition-all duration-300"
			>
				{loading ? "Registering..." : "Register"}
			</button>

			<div className="flex items-center my-4">
				<hr className="flex-grow border-t border-white/20" />
				<span className="mx-2 text-white/40 text-xs">or</span>
				<hr className="flex-grow border-t border-white/20" />
			</div>
			{/* Social login placeholder */}
			<div className="flex flex-col gap-2">
				<button type="button" className="w-full py-2 rounded-lg bg-white/20 text-white font-medium hover:bg-white/40 transition-all">Continue with Google</button>
				{/* Add more social logins here if needed */}
			</div>

			<div className="flex justify-center mt-4 text-sm">
				<span className="text-white/70">Already have an account? <button type="button" className="text-brand-orange hover:underline" onClick={handleClick}>Log In</button></span>
			</div>
		</form>
	);
};
export default Signup;
