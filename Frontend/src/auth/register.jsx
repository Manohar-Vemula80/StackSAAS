import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "https://stacksaas.onrender.com";

function Signup() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const googleAuth = () => {
		window.location.href = `${API_BASE}/auth/google`;
	};

	const handleRegister = async (e) => {
		e.preventDefault();

		if (!name || !email || !password) {
			alert("Please fill all fields");
			return;
		}

		if (password.length < 6) {
			alert("Password must be at least 6 characters long");
			return;
		}

		setLoading(true);
		try {
			const response = await fetch(`${API_BASE}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, email, password }),
			});

			const data = await response.json();
			if (data.success) {
				alert("Registration successful! Please login.");
				navigate("/login");
			} else {
				alert(data.message || "Registration failed");
			}
		} catch (error) {
			console.error("Registration error:", error);
			alert("Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-10">
			
			<h1 className="text-[40px] font-semibold text-[#2c444e] relative flex items-center justify-center after:content-[''] after:w-[250px] after:h-[4px] after:bg-[#2c444e] after:absolute after:bottom-[-20px] after:rounded-sm">
				Sign up Form
			</h1>

			<div className="flex mt-[45px] w-full max-w-5xl min-h-[500px] flex-col overflow-hidden rounded-[50px] bg-white shadow-[3px_4px_36px_-6px_rgba(0,0,0,0.4)] md:flex-row md:h-[450px]">
				
				{/* Left Section */}
				<div className="relative overflow-hidden rounded-t-[50px] bg-indigo-600 md:rounded-l-[50px] md:rounded-tr-none h-56 md:h-auto md:flex-[1.5]">
					<img
						className="absolute inset-0 h-full w-full object-cover"
						src="./images/signup.jpg"
						alt="signup"
					/>
				</div>

				{/* Right Section */}
				<div className="flex-[2] flex flex-col items-center justify-center px-6 py-8">
					
					<h2 className="text-[25px] font-normal text-[#2c444e] mb-[20px]">
						Create Account
					</h2>

					<form onSubmit={handleRegister} className="w-full max-w-md flex flex-col gap-4">
						<input
							type="text"
							placeholder="Full Name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full h-12 p-3 rounded-lg border border-[#2c444e] text-sm outline-none"
							required
						/>

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
							className="w-full h-12 p-3 rounded-lg border border-[#2c444e] text-sm outline-none"
							required
							minLength={6}
						/>

						<button
							type="submit"
							disabled={loading}
							className="w-full h-12 rounded-lg bg-[#ffc801] text-white text-[18px] font-medium transition disabled:opacity-50"
						>
							{loading ? "Creating Account..." : "Sign Up"}
						</button>
					</form>

					<p className="text-[14px] text-[#2c444e]">or</p>

					<button
						onClick={googleAuth}
						className="w-full max-w-md h-12 rounded-lg bg-white shadow-md text-[16px] font-medium mb-5 text-[#2c444e] cursor-pointer flex items-center justify-center"
					>
						<img
							src="./images/google.png"
							alt="google icon"
							className="w-[30px] h-[30px] object-cover"
						/>
						<span className="ml-[10px]">Sign up with Google</span>
					</button>

					<p className="text-[14px] text-[#2c444e]">
						Already Have Account?{" "}
						<Link
							to="/login"
							className="text-[16px] font-medium text-[#ffc801]"
						>
							Log In
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Signup;