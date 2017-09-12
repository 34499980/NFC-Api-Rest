module.exports = function (app) {
    var Empleado = require('./app');

    //GET
    findAllEmpleados = function (req, res) {
        Empleado.find(function (err, empleado){
            if (!err) res.send(empleado);
            else console.log('ERROR:' + err);
        });
    }
    //GET
    findById = function (req, res) {
        Empleado.findById(req.params.id, function (err, empleado) {
            if (!err) res.send(empleado);
            else console.log('ERROR:' + err);
        });
    }
    //POST
    addEmpleado = function (req, res) {
        console.log('POST');
        console.log(req.body);

        var empleado = new Empleado({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            legajo: req.body.legajo,
            IdSube: req.body.IdSube
        });
        empleado.save(function (err) {
            if (!err) console.log('Empleado guardado!');
            else console.log('ERROR:' + err);
        });
        res.send(empleado);
    };
    //PUT Update
    updateEmpleado = function (req, res) {
        Empleado.findById(req.params.id, function (err, empleado) {
            empleado.nombre = req.body.nombre;
            empleado.apellido = req.body.apellido;
            empleado.legajo = req.body.legajo;
            empleado.IdSube = req.body.IdSube;
        });
        empleado.save(function (err) {
            if (!err) console.log('Empleado Actualizado!');
            else console.log('ERROR:' + err);
        })
    };
    //DELETE
    deleteEmpleado = function (req, res) {
        Empleado.findById(req.params.id, function (err, empleado) {
            empleado.remove(function (err) {
                if (!err) console.log('Empleado borrado');
                else console.log('ERROR:' + err);
            })
        });
    }
        //API Routes
       app.get('/empleado', findAllEmpleados);
       app.get('/empleado/:id', findById);
       app.get('/empleado', addEmpleado);
       app.get('/empleado/:id', updateEmpleado)
       app.get('/empleado:id', deleteEmpleado)
}
