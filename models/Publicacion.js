const mongoose = require('mongoose');

const publicacionSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fecha: { type: Date, default: Date.now },
  descripcion: { type: String },
  imagenes: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
  comentarios: [{ type: String }]
});

module.exports = mongoose.model('Publicacion', publicacionSchema);
