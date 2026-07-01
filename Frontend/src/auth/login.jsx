import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/usercontext";

const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { setUser } = useUser();

	const googleAuth = () => {
		window.location.href = `${API_BASE}/auth/google`;
	};

	const handleLogin = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			alert("Please enter email and password");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();
			if (data.success) {
				let userData = data.user;
				try {
					const statusRes = await fetch(`${API_BASE}/auth/status`, {
						method: "GET",
						credentials: "include",
						headers: { Accept: "application/json" },
					});
					const statusData = await statusRes.json();
					if (statusData.authenticated && statusData.user) {
						userData = statusData.user;
					}
				} catch (statusErr) {
					console.error("Status fetch after login failed:", statusErr);
				}
				if (setUser) setUser(userData);
				alert("Login successful!");
				navigate("/");
			} else {
				alert(data.message || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			alert("Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-10">
			
			<h1 className="text-[40px] font-semibold text-[#2c444e] relative flex items-center justify-center after:content-[''] after:w-[250px] after:h-[4px] after:bg-[#2c444e] after:absolute after:bottom-[-20px] after:rounded-sm">
				Log in Form
			</h1>

			<div className="flex mt-[45px] w-full max-w-5xl flex-col overflow-hidden rounded-[50px] bg-white shadow-[3px_4px_36px_-6px_rgba(0,0,0,0.4)] md:flex-row md:h-[450px]">
				
				{/* Left Section */}
				<div className="relative overflow-hidden rounded-t-[50px] bg-indigo-600 md:rounded-l-[50px] md:rounded-tr-none h-56 md:h-auto md:flex-[1.5]">
					<img
						className="absolute inset-0 h-full w-full object-cover"
						src="./images/login.jpg"
						alt="login"
					/>
				</div>

				{/* Right Section */}
				<div className="flex-[2] flex flex-col items-center justify-center px-6 py-8">
					
					<h2 className="text-[25px] font-normal text-[#2c444e] mb-[30px]">
						Members Log in
					</h2>

<form onSubmit={handleLogin} className="w-full max-w-md flex flex-col gap-4">
					<input
						type="email"
						placeholder="Email Address"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full h-12 p-3 rounded-lg border border-[#2c444e] text-sm outline-none"
						required
					/>

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full max-w-md h-[45px] p-3 my-[5px] outline-none border border-[#2c444e] rounded text-[13px]"
							required
						/>

						<button
							type="submit"
							disabled={loading}
							className="text-[18px] font-medium py-[12px] px-[25px] text-white bg-[#ffc801] rounded-[12px] mt-[10px] cursor-pointer disabled:opacity-50"
						>
							{loading ? "Logging in..." : "Log In"}
						</button>
					</form>

					<p className="text-[14px] text-[#2c444e] my-[5px]">or</p>

					<button
						onClick={googleAuth}
						className="w-full max-w-md h-[45px] rounded-[5px] bg-white shadow-md text-[16px] font-medium mb-[20px] text-[#2c444e] cursor-pointer flex items-center justify-center"
					>
						<img
							src="./images/google.png"
							alt="google icon"
							className="w-[30px] h-[30px] object-cover"
						/>
						<span className="ml-[10px]">Sign in with Google</span>
					</button>

					<p className="text-[14px] text-[#2c444e]">
						New Here?{" "}
						<Link
							to="/signup"
							className="text-[16px] font-medium text-[#ffc801]"
						>
							Sign Up
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Login;