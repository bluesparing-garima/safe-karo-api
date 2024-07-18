import creditAndDebit from '../../models/accountsModels/creditAndDebitSchema.js';

// Create a new credit and debit transaction
export const createCredit = async(req,res) =>{
    try{
        const {
            type,
            account,
            accountCode,
            amount,
            userName,
            remarks,
            createdBy,
            createdOn
        }= req.body;
        const newCreditAndDebit = new creditAndDebit()
    }catch(error){
        return 
    }
}