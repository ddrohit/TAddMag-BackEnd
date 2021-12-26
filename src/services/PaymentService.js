const db = require ('../db/index');
module.exports = {
    CreateCashPayment: async ({Amount,type,description,currency}) => {
      return new Promise(async (resolve, reject) => {
          try{
            let trans = await db.query(`SELECT MAX(trans_id) FROM taddmagtrans`);
            let count = trans.rows[0].max == null?  0: trans.rows[0].max;
            const receipt_id = "REG-"+Date.now()
            data = await db.query('INSERT into taddmagtrans (trans_id, amount, mode, status, type, description, currency, receipt_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING trans_id', 
            [parseInt(count)+1,Amount, "Cash","Sucessfull",type,description,currency,receipt_id]);
            if(data.rows.length == 0)
                throw new Exception("no trasid is returned")
            else
                resolve(data.rows[0].trans_id);
          }
          catch(error){
              console.log(error);
              reject("tranfaction failed");
          }
        
      });
    },
    DeleteCashPayment: async (id) => {
        return new Promise(async (resolve, reject) => {
            try{
              data = await db.query('DELETE FROM taddmagtrans WHERE trans_id = $1', 
                    [id]);
              if(data.rowCount == 0)
                reject("no transaction is present with the trans_id "+id);
              else
                  resolve("Transaction Removed sucessfully");
            }
            catch(error){
                console.log(error);
                reject("tranfaction remove failed");
            }
          
        });
      },
  CreateRazorPayPayment: async ({Amount,type,description,currency,orderid,receipt_id}) => {
      return new Promise(async (resolve, reject) => {
          try{
            let trans = await db.query(`SELECT MAX(trans_id) FROM taddmagtrans`);
            let count = trans.rows[0].max == null?  0: trans.rows[0].max;
            data = await db.query('INSERT into taddmagtrans (trans_id, amount,receipt_id, mode, status, type, description, currency, raz_order_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING trans_id', 
            [parseInt(count)+1,Amount,receipt_id, "Online","Created",type,description,currency,orderid]);
            if(data.rows.length == 0)
                throw new Exception("no trasid is returned")
            else
                resolve(data.rows[0].trans_id);
          }
          catch(error){
              console.log(error);
              reject("transaction failed");
          }
      });
    },
  PaymentSucessfull : async({orderid,razorpay_trans_id}) =>{
    return new Promise(async (resolve, reject) => {
        try{
              data = await db.query('UPDATE taddmagtrans SET raz_payment_id = $1, status =$2 Where raz_order_id = $3', [razorpay_trans_id,"Paid",orderid])
              resolve("Sucesfully updated staus");
        }
        catch(err){
            console.log(err);
            reject("Faild Updating status")
        }
      });
  },
  PaymentFailure: async({orderid})=>{
    return new Promise(async (resolve, reject) => {
      try{
            data = await db.query('UPDATE taddmagtrans SET raz_payment_id =$1, status = $2 Where raz_order_id = $3', [razorpay_trans_id,"Signature Failed",orderid])
            resolve("Sucesfully updated staus");
      }
      catch(err){
          console.log(err);
          reject("Faild Updating status")
      }
    });
  }
}