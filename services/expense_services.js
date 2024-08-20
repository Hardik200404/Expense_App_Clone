const expense_model = require('../models/expense_model')
const user_model = require('../models/user_model')
const Sequelize = require('sequelize')
const sequelize = require('../util/database')

async function get_expense_service(userId){
    try{
        let db_res = await expense_model.findAll({where:{
            userId: userId
        }})
        return db_res
    }catch(err){
        console.log(err)
        return {'error': err}
    }
}

async function get_expense_paginated_service(userId, page, limit, offset){
    try {
        const expenses = await expense_model.findAndCountAll({
            where: {userId: userId},
            limit: limit,
            offset: offset
        })
        return {
            total_records: expenses.count,
            total_pages: Math.ceil(expenses.count / limit),
            current_page: page,
            data: expenses.rows
        }
    } catch (err) {
        console.error(err)
        return {error: err}
    }
}

async function add_expense_service(data_to_insert){
    let expense
    try {
        // Start a transaction
        await sequelize.transaction(async (t) => {
            // Create the new expense
            expense = await expense_model.create(data_to_insert,{ transaction: t })

            // Update the user's total expenses
            await user_model.update(
                { total_expenses: Sequelize.literal(`total_expenses + ${data_to_insert.expense_cost}`)},
                { where: { id: data_to_insert.userId }, transaction: t }
            )
        })
        //console.log('Expense added successfully');
        return expense
    }
    catch(err){
        console.log(err)
        return {'error': err}
    }
}

async function edit_expense_service(data_to_insert, expense_id, userId){
    const transaction = await sequelize.transaction()
    try {
        // Fetch user and expense within the transaction
        const user = await user_model.findByPk(userId, { transaction })
        const expense = await expense_model.findByPk(expense_id, { transaction })

        if (!user || !expense) {
            throw new Error('User or Expense not found')
        }

        const oldExpenseCost = parseInt(expense.expense_cost)
        const newExpenseCost = parseInt(data_to_insert.expense_cost)

        // Update the expense table
        await expense.update(data_to_insert, { transaction })

        // Update user’s total expense if the cost has changed
        if (oldExpenseCost !== newExpenseCost) {
            let totalExpenses = parseInt(user.total_expenses)

            totalExpenses -= oldExpenseCost
            totalExpenses += newExpenseCost

            // Update the user’s total expenses
            await user.update({ total_expenses: totalExpenses }, { transaction })
        }

        // Commit the transaction
        await transaction.commit()
        console.log('Expense Updated')
        return { message: 'Expense Updated Successfully' }
    }catch(err){
        // Rollback the transaction in case of errors
        await transaction.rollback()
        console.log('Error updating expense:', err)
        return { error: err }
    }
}

async function delete_expense_service(expense_id,userId){
    try{
        await sequelize.transaction(async (t) => {
            //update expense table
            let expense = await expense_model.findByPk(expense_id)

            //update user table
            await user_model.update(
                { total_expenses: Sequelize.literal(`total_expenses - ${expense.dataValues.expense_cost}`)},
                { where: { id: userId }, transaction: t }
            )
            expense.destroy()
        })
        return {'message': 'Expense Deleted Successfully'}
    }catch(err){
        return {'error': err}
    }
}

module.exports = {
    get_expense_service,
    get_expense_paginated_service,
    add_expense_service,
    edit_expense_service,
    delete_expense_service
}