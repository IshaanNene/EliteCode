import { authModalState } from "@/atoms/authModalAtom";
import AuthModal from "@/components/Modals/AuthModal";
import Navbar from "@/components/Navbar/Navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

type AuthPageProps = {};

const AuthPage: React.FC<AuthPageProps> = () => {
	const authModal = useRecoilValue(authModalState);
	const [user, loading, error] = useAuthState(auth);
	const [pageLoading, setPageLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		if (user) router.push("/");
		if (!loading && !user) setPageLoading(false);
	}, [user, router, loading]);

	if (pageLoading) return null;

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#0a0a23] relative flex flex-col">
			<Navbar />
			<section className="flex-1 flex flex-col items-center justify-center py-12 px-4">
				<div className="max-w-2xl w-full flex flex-col items-center">
					<Image src="/hero.png" alt="Hero img" width={320} height={320} className="mb-6 drop-shadow-2xl rounded-2xl" />
					<h1 className="text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg mb-4">
						Welcome to EliteCode
					</h1>
					<p className="text-lg md:text-2xl text-white/90 text-center max-w-xl mb-6">
						Sign in or create an account to unlock your coding journey.
					</p>
				</div>
			</section>
			{authModal.isOpen && <AuthModal />}
		</div>
	);
};
export default AuthPage;
