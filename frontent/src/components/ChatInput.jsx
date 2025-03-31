import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { Send, Image, X } from 'lucide-react';
import toast from 'react-hot-toast';

function ChatInput() {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [file, setFile] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage, selectUser } = useChatStore();
    
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if(!selectedFile.type.startsWith('image/')) {
            toast.error('Please select an image file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        }
        reader.readAsDataURL(selectedFile);
        setFile(selectedFile);
    }
    
    const removeImage = () => {
        setImagePreview(null);
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
    
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if ((!text.trim() && !file) || !selectUser) return;
        
        setIsSending(true);
        
        try {
            await sendMessage({
                text: text.trim(),
                image: imagePreview
            });
            // Reset form
            setText('');
            removeImage();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    }
    
    return (
        <div className="border-t border-base-300 p-4">
            {imagePreview && (
                <div className="relative w-32 h-32 mb-2">
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-md"
                    />
                    <button 
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button 
                    type="button"
                    className="btn btn-circle btn-sm btn-ghost"
                    onClick={() => fileInputRef.current.click()}
                >
                    <Image size={20} />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                    />
                </button>
                
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="input input-bordered flex-1"
                    disabled={isSending}
                />
                
                <button 
                    type="submit" 
                    className="btn btn-primary btn-circle"
                    disabled={(!text.trim() && !file) || isSending}
                >
                    {isSending ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <Send size={20} />
                    )}
                </button>
            </form>
        </div>
    )
}

export default ChatInput