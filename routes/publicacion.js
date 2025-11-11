const express = require('express');
const Publicacion = require('../models/Publicacion');
const router = express.Router();

//GET 
router.get('/publicacion', async (req, res) => {
    try {
        const publicaciones = await Publicacion.find();
        res.status(200).json(publicaciones);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//POST
router.post('/publicacion', async (req, res) => {
    try {
        const nuevaPublicacion = new Publicacion(req.body);
        const publicacionGuardada = await nuevaPublicacion.save();
        res.status(201).json(publicacionGuardada);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//Linea que exporta el router
module.exports = router;