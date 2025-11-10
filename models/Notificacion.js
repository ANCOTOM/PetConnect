const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, required: true },
  mensaje: { type: String },
  fecha: { type: Date, default: Date.now },
  leido: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notificacion', notificacionSchema);
