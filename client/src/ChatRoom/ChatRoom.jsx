import React from "react";

import "./ChatRoom.css";
import useChat from "../useChat";
var CryptoJS = require("crypto-js");

const ChatRoom = (props) => {
  const key = localStorage.getItem("secret");
  const { roomId } = props.match.params;
  const { messages, sendMessage } = useChat(roomId);
  const [newMessage, setNewMessage] = React.useState("");

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = () => {
    let ciphertext = CryptoJS.AES.encrypt(newMessage, key).toString();

    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    console.log(bytes.toString(CryptoJS.enc.Utf8));
    console.log(ciphertext, newMessage, key);
    sendMessage(ciphertext);
    setNewMessage("");
  };

  return (
    <div className="chat-room-container">
      <h1 className="room-name">Room: {roomId}</h1>
      <div className="messages-container">
        <ol className="messages-list">
          {messages.map((message, i) => (
            <li
              key={i}
              className={`message-item ${
                message.ownedByCurrentUser ? "my-message" : "received-message"
              }`}
            >
              {CryptoJS.AES.decrypt(message.body, key).toString(
                CryptoJS.enc.Utf8
              )}
            </li>
          ))}
        </ol>
      </div>
      <textarea
        value={newMessage}
        onChange={handleNewMessageChange}
        placeholder="Write message..."
        className="new-message-input-field"
      />
      <button onClick={handleSendMessage} className="send-message-button">
        Send
      </button>
    </div>
  );
};

export default ChatRoom;
