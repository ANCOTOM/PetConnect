const mongoose = require('mongoose');

const mascotaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  especie: { type: String, required: true },
  raza: { type: String },
  edad: { type: Number },
  fotoMascota: { type: String }
}, { _id: false });

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  fotoUsuario: { type: String },
  fechaRegistro: { type: Date, default: Date.now },
  mascotas: [mascotaSchema]
});

module.exports = mongoose.model('Usuario', usuarioSchema);
