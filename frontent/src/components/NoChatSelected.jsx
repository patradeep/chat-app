import React from 'react'
import { MessageSquare } from 'lucide-react'

function NoChatSelected() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-base-200 p-6 rounded-full mb-4">
        <MessageSquare size={48} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No conversation selected</h2>
      <p className="text-gray-500 max-w-md">
        Choose a conversation from the sidebar.
      </p>
    </div>
  )
}

export default NoChatSelected