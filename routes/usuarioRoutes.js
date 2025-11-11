const express = require('express');
const Contact = require('../models/Usuario');
const router = express.Router();


//GET 
router.get('/usuario', async (req, res) => {
    try {
        const usuarios = await Contact.find();
        res.status(200).json(usuarios);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//POST
router.post('/usuario', async (req, res) => {
    try {
        const nuevoUsuario = new Contact(req.body);
        const usuarioGuardado = await nuevoUsuario.save();
        res.status(201).json(usuarioGuardado);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//Linea que exporta el router
module.exports = router;