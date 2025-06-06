import { useState, useEffect, useRef } from 'react';
import { api } from '../api.ts';

type Role = "user" | "assistant";
type Message = { role: Role; content: string };

const Chatbot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const userId = JSON.parse(localStorage.getItem("user") || "null")?.id_usuario;
    const chatKey = `chatHistory_${userId}`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const saved = localStorage.getItem(chatKey);
        if (saved) setMessages(JSON.parse(saved));
    }, [chatKey]);

    useEffect(() => {
        localStorage.setItem(chatKey, JSON.stringify(messages));
        scrollToBottom();
    }, [messages, chatKey]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const updatedMessages = [...messages, { role: "user" as const, content: input }];
        setMessages(updatedMessages);

        try {
            const res = await api.post('/api/chat', { message: input });
            setMessages([...updatedMessages, { role: "assistant" as const, content: res.data.reply }]);
        } catch (error) {
            console.error("Error en chatbot:", error);
            setMessages([...updatedMessages, { role: "assistant", content: "Error al conectar con el servidor." }]);
        }

        setInput('');
    };

    const clearChat = async () => {
        try {
            await api.post('/api/chat/clear');
            setMessages([]);
            localStorage.removeItem(chatKey);
        } catch (error) {
            console.error("Error al limpiar el historial:", error);
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: 400,
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #ccc',
            borderRadius: 10,
            overflow: 'hidden',
            boxSizing: 'border-box',
            marginTop: 10
        }}>
            <div style={{ padding: 10, borderBottom: '1px solid #eee', backgroundColor: '#f8f8f8', marginTop: 20}}>
                <strong>Chatbot</strong>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                        <p><strong>{msg.role === 'user' ? 'Tú' : 'Bot'}:</strong> {msg.content}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={{
                padding: 10,
                borderTop: '1px solid #eee',
                width: '100%',
                boxSizing: 'border-box',
                height: 158
            }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribí un mensaje..."
                    style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                />
                <button
                    onClick={sendMessage}
                    style={{ width: '100%', marginTop: 8, boxSizing: 'border-box' }}
                >
                    Enviar
                </button>
                <button
                    onClick={clearChat}
                    style={{
                        width: '100%',
                        marginTop: 5,
                        background: '#f44336',
                        color: 'white',
                        boxSizing: 'border-box',
                        height: 40
                    }}
                >
                    Limpiar conversación
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
