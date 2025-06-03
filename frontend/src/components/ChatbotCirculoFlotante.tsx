import { useRef, useState, useEffect } from 'react';
import Chatbot from './Chatbot';
import { FaComments } from 'react-icons/fa';

const ChatbotLauncher = () => {
    const [showChat, setShowChat] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
                setShowChat(false);
            }
        };

        if (showChat) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showChat]);

    return (
        <>
            {/* Circulito flotante */}
            <div
                onClick={() => setShowChat(!showChat)}
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#4B614C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 1100
                }}
            >
                <FaComments size={22} />
            </div>

            {/* Popup del chat */}
            {showChat && (
                <div
                    ref={chatRef}
                    style={{
                        position: 'fixed',
                        bottom: '140px',
                        right: '20px',
                        width: '360px',
                        height: '480px',
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '12px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                        zIndex: 1100,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <Chatbot />
                </div>
            )}
        </>
    );
};

export default ChatbotLauncher;
