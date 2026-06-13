import React, { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { Search, User } from 'lucide-react'

function Sidebar() {
    const { setSelectUser, users, getUsers, isUsersLoading, selectUser } = useChatStore()
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        getUsers()
    }, [])

    const filteredUsers = users.filter(user => 
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="w-full h-full border-r border-base-300 flex flex-col">

            {/* Search */}
            <div className="p-2 border-b border-base-300">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="input input-bordered w-full pr-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
            </div>
            
            {/* User List */}
            <div className="overflow-y-auto flex-1">
                {isUsersLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="loading loading-spinner loading-md"></div>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div 
                            key={user._id}
                            className={`flex items-center p-3 border-b border-base-200 hover:bg-base-200 cursor-pointer ${
                                selectUser?._id === user._id ? 'bg-base-200' : ''
                            }`}
                            onClick={() => setSelectUser(user)}
                        >
                            {/* Avatar */}
                            <div className="avatar mr-3">
                                <div className="w-12 h-12 rounded-full">
                                    {user.avatar ? (
                                        <img src={user.avatar} />
                                    ) : (
                                        <div className="bg-primary flex items-center justify-center w-full h-full">
                                            <User className="text-white" size={24} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{user.fullname}</h3>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <p className="text-gray-500 mb-2">No users found</p>
                        {searchTerm && (
                            <button 
                                className="btn btn-sm btn-ghost"
                                onClick={() => setSearchTerm('')}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
            

        </div>
    )
}

export default Sidebar