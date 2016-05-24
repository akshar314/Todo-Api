var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());
app.get('/', function(request, response) {
    response.send('TODO API');

});

//GET /todos
app.get('/todos', function(request, response) {
    var query = request.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;

    }else if(query.hasOwnProperty('completed') && query.completed === 'false'){
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length >0){
        where.description = {
            $like: '%'+query.q+'%'
        }
    }

    db.todo.findAll({where:where}).then(function(todos){
        response.json(todos);
    },function(e){
        response.status(500).send();
    });
    /*var filteredTodos = todos;
    if (queryParams.completed == 'true' && queryParams.hasOwnProperty('completed')) {
        filteredTodos = _.where(filteredTodos, { completed: true });
    } else if (queryParams.completed = 'false' && queryParams.hasOwnProperty('completed')) {
        filteredTodos = _.where(filteredTodos, { completed: false });
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {

        filteredTodos = _.filter(filteredTodos, function(todo) {

            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;

        });
    }


    response.json(filteredTodos);*/

});

//GET /todos/:id
app.get('/todos/:id', function(request, response) {
    var todoId = parseInt(request.params.id, 10); // req.param returns string we need to convert it to Int
    // var matchedTodo = _.findWhere(todos, { id: todoId });
    // var matchedTodo;
    // todos.forEach(function(todo) {
    //     if (todoId === todo.id) {
    //         matchedTodo = todo;
    //     }

    // });

    // if (matchedTodo) {
    //     response.json(matchedTodo);
    // } else {
    //     response.status(404).send(); 
    // }

    db.todo.findById(todoId).then(function(todo) {
        if (!!todo) {
            response.json(todo.toJSON());
        } else {
            response.status(404).send();
        }
    }, function(e) {
        response.status(500).send();
    });




});

// Post /todos

app.post('/todos', function(request, response) {

    var body = _.pick(request.body, 'description', 'completed');

    /*if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return response.status(400).send();
    }

    body.description = body.description.trim();
    body.id = todoNextId;

    todoNextId++;
    todos.push(body);

    // console.log("description"+request.body.description);*/
    db.todo.create(body).then(function(todo) {
        response.json(todo.toJSON());
    }, function(e) {
        response.status(404).json(e);
    });


});

app.delete('/todos/:id', function(request, response) {

    var todoId = parseInt(request.params.id, 10); // req.param returns string we need to convert it to Int
    var matchedTodo = _.findWhere(todos, { id: todoId });

    if (matchedTodo) {

        todos = _.without(todos, matchedTodo);
        response.json(matchedTodo);

    } else {
        response.status(404).send({ "error": "no Todo found with the given id" });
    }


});

app.put('/todos/:id', function(request, response) {

    var todoId = parseInt(request.params.id, 10); // req.param returns string we need to convert it to Int
    var matchedTodo = _.findWhere(todos, { id: todoId });

    if (!matchedTodo) {
        return response.status(404).send();
    }


    var body = _.pick(request.body, 'description', 'completed');
    var validAttributes = {};
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return response.status(400).send();
    }


    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return response.status(400).send();
    }

    matchedTodo = _.extend(matchedTodo, validAttributes);
    response.json(matchedTodo);



});

db.sequelize.sync().then(function() {

    app.listen(PORT, function() {

        console.log("Express running at " + PORT);

    });

});
