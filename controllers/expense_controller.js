const { verify_jwt_token }  = require('../util/jwt')
const get_date_time = require('../util/date_time_now')
const upload_csv = require('../util/s3_upload')
const generate_csv = require('../util/generate_csv')

const { get_expense_service, get_expense_paginated_service, add_expense_service,
    edit_expense_service, delete_expense_service } = require('../services/expense_services')

async function get_expense(req,res){
    let userId = verify_jwt_token(req.headers.authorization)

    let db_res = await get_expense_service(userId)
    if(db_res.error){
        res.status(500).send(JSON.stringify({error: db_res.error}))
    }else{
        res.status(200).send(db_res)
    }
}

async function get_expense_paginated(req, res){
    let userId = verify_jwt_token(req.headers.authorization)
    const page = parseInt(req.query.page) || 1  // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10  // Number of records per page
    const offset = (page - 1) * limit

    let response = await get_expense_paginated_service(userId, page, limit, offset)
    if(response.error){
        res.status(500).json(response)
    }else{
        res.status(200).json(response)
    }
}

async function add_expense(req,res){
    let userId = verify_jwt_token(req.headers.authorization)
    let date_time = get_date_time()
    let data_to_insert = {
        expense_cost: req.body.expense_cost,
        description: req.body.description,
        category: req.body.category,
        created_at: date_time,
        userId: userId
    }
    
    let expense = await add_expense_service(data_to_insert)
    if(expense.error){
        res.status(500).send(JSON.stringify({error: db_res.error}))
    }else{
        res.status(201).send(expense)
    }
}

async function edit_expense(req,res){
    let expense_id = req.params.id
    let userId = verify_jwt_token(req.headers.authorization)

    let data_to_insert = {
        expense_cost: req.body.expense_cost,
        description: req.body.description,
        category: req.body.category,
        userId: userId
    }

    let response = await edit_expense_service(data_to_insert, expense_id, userId)
    if(response.error){
        res.status(500).json({ error: response.error })
    }else{
        res.status(201).send(response)
    }
}

async function delete_expense(req,res){
    let expense_id = req.params.id
    let userId = verify_jwt_token(req.headers.authorization)
    
    let response = await delete_expense_service(expense_id, userId)
    if(response.error){
        res.status(500).json({ error: response.error })
    }else{
        res.status(204).send()
    }
}

async function get_chart(req,res){
    let userId = verify_jwt_token(req.headers.authorization)
    let date_time = get_date_time()
    date_time = date_time.split(":").join("-")
    date_time = date_time.split(" ").join('-')
    let filePath = `csv_files/user-${userId}-income-expense-${date_time}.csv`

    let db_res = await get_expense_service(userId)
    if(db_res.error){
        res.status(500).send(JSON.stringify({error: db_res.error}))
    }else{
        let records = []
        for(let data of db_res){
            records.push(data.dataValues)
        }

        generate_csv(records,filePath)
        
        filePath = filePath.split('/')[1]
        res.status(200).send({
            db_res: db_res,
            file_id: filePath
        })
    }
}

async function download_csv(req,res){
    let filePath = 'csv_files/' + req.body.file_id
    try{
        response = await upload_csv(filePath)
        res.status(200).send({file_url: response})
    }catch(err){
        console.log(err)
        res.status(500).send({error: err})
    }
}

module.exports = {
    get_expense, add_expense, edit_expense, delete_expense, 
    get_chart, download_csv, get_expense_paginated
}