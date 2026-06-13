import React from 'react'
import { useChatStore } from '../store/useChatStore'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import NoChatSelected from '../components/NoChatSelected'

function Home() {
  const { selectUser } = useChatStore()

  return (
    <div className='bg-base-200 min-h-screen'>
      
      <div className='flex justify-center items-center px-4 h-screen'>
        
        <div className='bg-base-100 rounded-lg w-full max-w-6xl mt-6 h-[90vh] flex overflow-hidden'>
          
          {/* Sidebar */}
          <div className={`${selectUser ? 'hidden' : 'block'} md:block w-full md:w-1/3 h-full`}>
            <Sidebar />
          </div>

          {/* Chat Area */}
          <div className={`${selectUser ? 'block' : 'hidden'} md:block flex-1 h-full`}>
            {selectUser ? <ChatContainer /> : <NoChatSelected />}
          </div>

        </div>

      </div>

    </div>
  )
}

export default Home