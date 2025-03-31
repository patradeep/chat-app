import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useChatStore } from '../store/useChatStore'
import { User, MoreVertical } from 'lucide-react'

function ChatHeader() {
    const { onlineUsers } = useAuthStore()
    const { selectUser } = useChatStore()
    
    const isUserOnline = onlineUsers.includes(selectUser?._id)
    
    return (
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
            <div className="flex items-center">
                <div className="avatar mr-3">
                    <div className="w-10 h-10 rounded-full relative">
                        {selectUser?.avatar ? (
                            <img src={selectUser.avatar} alt={selectUser.fullname} />
                        ) : (
                            <div className="bg-primary flex items-center justify-center w-full h-full">
                                <User className="text-white" size={20} />
                            </div>
                        )}
                        {isUserOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></span>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-medium">{selectUser?.fullname}</h3>
                    <p className="text-xs text-gray-500">
                        {isUserOnline ? 'Online' : 'Offline'}
                    </p>
                </div>
            </div>
            
        </div>
    )
}

export default ChatHeader