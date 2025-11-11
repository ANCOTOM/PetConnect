const express = require('express');
const Mensaje = require('../models/Mensaje');
const router = express.Router();

//GET 
router.get('/mensaje', async (req, res) => {
    try {
        const mensajes = await Mensaje.find();
        res.status(200).json(mensajes);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//POST
router.post('/mensaje', async (req, res) => {
    try {
        const nuevoMensaje = new Mensaje(req.body);
        const mensajeGuardado = await nuevoMensaje.save();
        res.status(201).json(mensajeGuardado);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//Linea que exporta el router
module.exports = router;