//importing controllers
const { get_expense, add_expense, edit_expense, delete_expense, 
    get_chart, download_csv, get_expense_paginated } = require("../controllers/expense_controller")

module.exports = function(app){
    app.get('/expense/get-expense', get_expense),
    app.post('/expense/add-expense', add_expense),
    app.put('/expense/edit-expense/:id',edit_expense),
    app.delete('/expense/delete-expense/:id', delete_expense),
    app.get('/expense/get-chart', get_chart),
    app.post('/expense/download-csv', download_csv),
    app.get('/expense/get-expenses-paginated', get_expense_paginated)
}