import cloudinary from '../lib/coludinary.js';
import Message from '../models/message.model.js';
import User  from '../models/user.model.js';

export const getUsersForChat = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error in getUsersForChat: ",error.message);
        res.status(500).json({ message: error.message });
    }
}

export const getMessage = async (req, res) => {
    try {
        const {id:userToChatId}=req.params;
        const myId=req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId:myId, receiverId:userToChatId }, 
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessage: ",error.message);
        res.status(500).json({ message: error.message });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const {id:receiverId}=req.params;
        const senderId=req.user._id;
        const {text,image}=req.body;
        let imageUrl;
        if(image){
            // Upload image to cloudinary and get the secure URL
            const uploadedResponse = await cloudinary.uploader.upload(image);
            imageUrl=uploadedResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });
        await newMessage.save();

        res.status(200).json(newMessage);
    } catch (error) {
        console.error("Error in sendMessage: ",error.message);
        res.status(500).json({ message: error.message });
    }
}