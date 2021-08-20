const db = require("../db");
const headcount = 7;
const end_level = 6;
const levelamounts = {2:1500,3:3000,4:4000,5:5000}

const checkPromotion = async (level) => {
    return new Promise(async (resolve, reject) => {
        try{
              let result = await db.query(`Select COUNT(*) FROM taddmagusers WHERE level = $1`,[level])
              let totalcount = result.rows[0].count;
              if(totalcount % headcount == 0){
                  let user_id = totalcount/headcount;
                  res = await db.query(`UPDATE taddmagusers SET level = level + 1 WHERE level = $1 AND user_id = $2`,[level,user_id]);
                  if(res.rowCount != 0)
                    await db.query(`INSERT INTO PendingPayments (user_id,amount,description,status) VALUES ($1,$2,$3,$4)`,
                          [user_id,levelamounts[level+1],"For promotion to level "+(parseInt(level)+1),"Pending"]);
                  resolve();
              }
              resolve();
        }
      catch(err){
          reject(err);
      }
    });
  }

module.exports = {
    checkAllLevelPromotion:async () =>{
        return new Promise(async (resolve, reject) => {
            for(let i = 1; i < end_level; i++ )
                await checkPromotion(i);
            resolve();
        });
    }
}