const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes')


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//1. Middlewares
app.use(cors());
app.use(bodyParser.json());

//2.Rutas
app.use('/api/v1',usuarioRoutes);

//3. Conexion MongoDB
console.log(process.env.MONGO_URI);

mongoose
    .connect(process.env.MONGO_URI)
        .then(()=>{
            console.log('Conectado a mongo....');
            app.listen(PORT, ()=> console.log(`Servidor corriento en http://localhost:${ PORT }`));
            
            
        })
        .catch( err => console.error('Error al conectar a MongDB', err))