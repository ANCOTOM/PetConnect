const express = require('express');
const Notificacion = require('../models/Notificacion');
const router = express.Router();

//GET 
router.get('/notificacion', async (req, res) => {
    try {
        const notificaciones = await Notificacion.find();
        res.status(200).json(notificaciones);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//POST
router.post('/notificacion', async (req, res) => {
    try {
        const nuevaNotificacion = new Notificacion(req.body);
        const notificacionGuardada = await nuevaNotificacion.save();
        res.status(201).json(notificacionGuardada);
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//Linea que exporta el router
module.exports = router;