const db = require ('../db/index');
module.exports = {
    CreateCashPayment: async ({Amount,type,description,currency}) => {
      return new Promise(async (resolve, reject) => {
          try{
            let trans = await db.query(`SELECT MAX(trans_id) FROM taddmagtrans`);
            let count = trans.rows[0].max == null?  0: trans.rows[0].max;
            data = await db.query('INSERT into taddmagtrans (trans_id, amount, mode, status, type, description, currency) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING trans_id', 
            [parseInt(count)+1,Amount, "Cash","Sucessfull",type,description,currency]);
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
  CreateRazorPayPayment: async ({Amount,type,description,currency,orderid}) => {
      return new Promise(async (resolve, reject) => {
          try{
            let trans = await db.query(`SELECT MAX(trans_id) FROM taddmagtrans`);
            let count = trans.rows[0].max == null?  0: trans.rows[0].max;
            data = await db.query('INSERT into taddmagtrans (trans_id, amount, mode, status, type, description, currency, raz_oder_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING trans_id', 
            [parseInt(count)+1,Amount, "Online","Created",type,description,currency,orderid]);
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
    }
}