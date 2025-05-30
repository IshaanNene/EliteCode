import { auth } from "@/firebase/firebase";
import React, { useState, useEffect } from "react";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
type ResetPasswordProps = {};

const ResetPassword: React.FC<ResetPasswordProps> = () => {
	const [email, setEmail] = useState("");
	const [sendPasswordResetEmail, sending, error] = useSendPasswordResetEmail(auth);
	const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const success = await sendPasswordResetEmail(email);
		if (success) {
			toast.success("Password reset email sent", { position: "top-center", autoClose: 3000, theme: "dark" });
		}
	};

	useEffect(() => {
		if (error) {
			alert(error.message);
		}
	}, [error]);
	return (
		<form className="space-y-7 px-2 py-2" onSubmit={handleReset}>
			<h3 className="text-2xl font-extrabold text-center text-blue-400 mb-2">Reset Your Password</h3>
			<p className="text-base text-white/80 text-center mb-4">
				Forgotten your password? Enter your e-mail address below, and we&apos;ll send you an e-mail allowing you to reset it.
			</p>
			<div>
				<label htmlFor="email" className="text-sm font-medium block mb-2 text-white/80">
					Your email
				</label>
				<input
					type="email"
					name="email"
					onChange={(e) => setEmail(e.target.value)}
					id="email"
					className="border-none outline-none sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-400 block w-full p-3 bg-white/20 text-white placeholder-white/60 shadow-inner transition-all"
					placeholder="name@company.com"
				/>
			</div>

			<button
				type="submit"
				className="w-full text-white font-bold rounded-lg text-base px-5 py-3 mt-2 bg-gradient-to-r from-blue-400 to-brand-orange shadow-lg hover:from-brand-orange hover:to-blue-400 transition-all duration-300"
			>
				{sending ? "Sending..." : "Reset Password"}
			</button>

			<div className="flex items-center my-4">
				<hr className="flex-grow border-t border-white/20" />
				<span className="mx-2 text-white/40 text-xs">or</span>
				<hr className="flex-grow border-t border-white/20" />
			</div>
			<div className="flex justify-center mt-4 text-sm">
				<button type="button" className="text-brand-orange hover:underline" onClick={() => window.dispatchEvent(new CustomEvent('auth-modal-switch', { detail: { type: 'login' } }))}>Back to Login</button>
			</div>
		</form>
	);
};
export default ResetPassword;
