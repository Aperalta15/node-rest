const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const _ = require('underscore');
const bodyParser = require('body-parser');
const User = require('../models/user');

const { verificaToken, verificaRole } = require('../middlewares/autenticacion');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

 

app.get('/usuario', verificaToken, function (req, res) {
    
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email,
    // })

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 0
    limite = Number(limite);
    User.find({estado: true}, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, users) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            User.count({estado: true}, (err, conteo) => {
                res.json({
                    ok: true,
                    users,
                    cuantos: conteo
                });
            });
        })
});
 
app.post('/usuario', [verificaToken, verificaRole], function (req, res) {
    let body = req.body;

    let user = new User({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    user.save((err, userDB) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            user: userDB 
        });

    });
    
});

app.put('/usuario/:id', [verificaToken, verificaRole], function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre','email','img','role','estado']);
    

    User.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, userDB) => {
        
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            userDB
        }); 
    });
});

app.delete('/usuario/:id', [verificaToken, verificaRole], function (req, res) {
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };

    User.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, usuarioBorrado) => {
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            Usuario: usuarioBorrado
        });
    });
});

module.exports = app;