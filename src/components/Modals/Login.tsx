import { authModalState } from "@/atoms/authModalAtom";
import { auth } from "@/firebase/firebase";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useSetRecoilState } from "recoil";
import { toast } from "react-toastify";
type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
	const setAuthModalState = useSetRecoilState(authModalState);
	const handleClick = (type: "login" | "register" | "forgotPassword") => {
		setAuthModalState((prev) => ({ ...prev, type }));
	};
	const [inputs, setInputs] = useState({ email: "", password: "" });
	const [signInWithEmailAndPassword, user, loading, error] = useSignInWithEmailAndPassword(auth);
	const router = useRouter();
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!inputs.email || !inputs.password) return alert("Please fill all fields");
		try {
			const newUser = await signInWithEmailAndPassword(inputs.email, inputs.password);
			if (!newUser) return;
			router.push("/");
		} catch (error: any) {
			toast.error(error.message, { position: "top-center", autoClose: 3000, theme: "dark" });
		}
	};

	useEffect(() => {
		if (error) toast.error(error.message, { position: "top-center", autoClose: 3000, theme: "dark" });
	}, [error]);
	return (
		<form className="space-y-7 px-2 py-2" onSubmit={handleLogin}>
			<h3 className="text-2xl font-extrabold text-center text-brand-orange mb-2">Sign in to EliteCode</h3>
			<div className="space-y-4">
				<div>
					<label htmlFor="email" className="text-sm font-medium block mb-2 text-white/80">
						Email
					</label>
					<input
						onChange={handleInputChange}
						type="email"
						name="email"
						id="email"
						className="border-none outline-none sm:text-sm rounded-lg focus:ring-2 focus:ring-brand-orange block w-full p-3 bg-white/20 text-white placeholder-white/60 shadow-inner transition-all"
						placeholder="name@company.com"
					/>
				</div>
				<div>
					<label htmlFor="password" className="text-sm font-medium block mb-2 text-white/80">
						Password
					</label>
					<input
						onChange={handleInputChange}
						type="password"
						name="password"
						id="password"
						className="border-none outline-none sm:text-sm rounded-lg focus:ring-2 focus:ring-brand-orange block w-full p-3 bg-white/20 text-white placeholder-white/60 shadow-inner transition-all"
						placeholder="*******"
					/>
				</div>
			</div>

			<button
				type="submit"
				className="w-full text-white font-bold rounded-lg text-base px-5 py-3 mt-2 bg-gradient-to-r from-brand-orange to-pink-500 shadow-lg hover:from-pink-500 hover:to-brand-orange transition-all duration-300"
			>
				{loading ? "Loading..." : "Log In"}
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

			<div className="flex justify-between mt-4 text-sm">
				<button type="button" className="text-brand-orange hover:underline" onClick={() => handleClick("forgotPassword")}>Forgot Password?</button>
				<span className="text-white/70">Not Registered? <button type="button" className="text-blue-400 hover:underline" onClick={() => handleClick("register")}>Create account</button></span>
			</div>
		</form>
	);
};
export default Login;
