import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Loader, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
  const { isLoggedIn,login1 } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const validateForm = () => {
    const { email, password } = formData;
    if(email.trim() === '') return toast.error("Email is required");
    if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return toast.error("Invalid email");
    if(password.trim() === '') return toast.error("Password is required");
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(validateForm()===true) {
      login1(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-4">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered focus:outline-none focus:ring-0 focus:border-gray-300"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={isLoggedIn}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input input-bordered w-full focus:outline-none focus:ring-0 focus:border-gray-300"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={isLoggedIn}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm absolute right-2 "
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggedIn}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn btn-primary ${isLoggedIn ? 'btn-disabled' : ''}`}
                disabled={isLoggedIn}
              >
                {isLoggedIn ? (
                  <span className="flex items-center gap-2">
                    <Loader className="animate-spin h-5 w-5" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </div>
            
            <div className="divider mt-4">OR</div>
            
            <p className="text-center mt-4">
              Don't have an account? 
              <a href="/signup" className="text-primary ml-1 hover:underline">
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;