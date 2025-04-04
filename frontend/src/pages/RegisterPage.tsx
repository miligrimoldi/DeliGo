import { useState } from 'react';

const RegisterPager = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        esAdmin: false,
        id_servicio: "",
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = event.target;
        setFormData({
            ...formData,
            [name] : type === "checked" ? checked: value,
        });
    };

    const handleSubmit()
}