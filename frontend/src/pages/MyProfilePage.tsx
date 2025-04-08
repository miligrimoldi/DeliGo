import React, { useEffect, useState } from 'react';
import '../css/perfil.css';
import { fetchEntidades, fetchMisEntidades, asociarAEntidad } from '../api.ts';
import { useNavigate } from "react-router-dom";

const MyProfilePage = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (

        <div className='perfil-opciones'>




        </div>

    );


};

export default MyProfilePage;