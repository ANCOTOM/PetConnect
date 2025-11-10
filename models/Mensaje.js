const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema({
  emisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  receptorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  visto: { type: Boolean, default: false }
});

module.exports = mongoose.model('Mensaje', mensajeSchema);
