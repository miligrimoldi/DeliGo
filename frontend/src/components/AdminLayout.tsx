import { Outlet } from 'react-router-dom';
import ChatbotCirculoFlotante from ".././components/ChatbotCirculoFlotante";

const AdminLayout = () => {
    return (
        <>
            <Outlet />
            <ChatbotCirculoFlotante />
        </>
    );
};

export default AdminLayout;
