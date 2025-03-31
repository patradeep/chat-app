import { useEffect } from 'react';
import Navbar from './components/Navbar'
import { Routes,Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Home from './pages/Home'
import { useAuthStore } from './store/useAuthStore'
import {Loader} from 'lucide-react'
import { Toaster } from'react-hot-toast';

function App() {
  useEffect(() => {
    // Initialize theme from localStorage or use default
    const savedTheme = localStorage.getItem('theme') || 'cupcake';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  const {authUser, checkAuth,isCheckingAuth} = useAuthStore();
  useEffect(()=>{
    checkAuth();
  },[checkAuth])
  console.log(authUser);
  if(isCheckingAuth){
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader className='animate-spin'/>
      </div>
    )
  }
  
  
  return (
    <>
    <Navbar/>

    <Routes>

    <Route path='/' element={authUser? <Home/> : <Navigate to='/login'/>}/>
    <Route path='/signup' element={!authUser? <Signup/> : <Navigate to='/'/>}/>
    <Route path='/login' element={!authUser? <Login/> : <Navigate to='/login'/>}/>
    <Route path='/profile' element={authUser? <Profile/> : <Navigate to='/login'/>}/>
    <Route path='/settings' element={<Settings/>}/>


    </Routes>

    <Toaster/>
    </>
  )
}

export default App;