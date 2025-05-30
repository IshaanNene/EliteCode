import { authModalState } from "@/atoms/authModalAtom";
import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Signup from "./Signup";
import { useRecoilValue, useSetRecoilState } from "recoil";

type AuthModalProps = {};

const AuthModal: React.FC<AuthModalProps> = () => {
	const authModal = useRecoilValue(authModalState);
	const closeModal = useCloseModal();
	return (
		<>
			<div
				className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
				onClick={closeModal}
			></div>
			<div className="fixed z-50 w-full max-w-md px-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
				<div className="relative w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
					<button
						type="button"
						className="absolute top-4 right-4 bg-white/30 hover:bg-white/60 text-brand-orange rounded-full p-2 shadow transition-all duration-200"
						onClick={closeModal}
					>
						<IoClose className="h-6 w-6" />
					</button>
					<div className="pt-2">
						{authModal.type === "login" ? <Login /> : authModal.type === "register" ? <Signup /> : <ResetPassword />}
					</div>
				</div>
			</div>
		</>
	);
};
export default AuthModal;

function useCloseModal() {
	const setAuthModal = useSetRecoilState(authModalState);

	const closeModal = () => {
		setAuthModal((prev) => ({ ...prev, isOpen: false, type: "login" }));
	};

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeModal();
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	return closeModal;
}
