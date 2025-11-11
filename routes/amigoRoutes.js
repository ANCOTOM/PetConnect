const express = require('express');
const Friend = require('../models/Amigo');
const router = express.Router();

//GET 
router.get('/amigo', async (req, res) => {
    try {
        const amigos = await Friend.find();
        res.status(200).json(amigos);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//POST
router.post('/amigo', async (req, res) => {
    try {
        const nuevoAmigo = new Contact(req.body);
        const amigoGuardado = await nuevoAmigo.save();
        res.status(201).json(amigoGuardado);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//Linea que exporta el router
module.exports = router;