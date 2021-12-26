const { Pool } = require('pg');

var pool = null;

/**
 * A module that says hello!
 * @module db
 */
module.exports = {
    /**
     * 
     * @param {String} query 
     * @param {String} params 
     * @returns {Promise} pollquery
     */
    query: (query, params) => pool.query(query, params),
    connect: async ({user,host,database,password,port})=> {
        return new Promise(async (resolve,reject)=>{
            pool = new Pool({
                user: user,
                host: host,
                database: database,
                password: password,
                port: port,
            });
            //On anytime Pool failed this evet is triggerd 
            pool.on('error', (err, client) => {
                reject(err)
            })
            try{
                const client = await pool.connect();
                client.release();
                resolve("DataBase Pool Connection Sucessfull."); 
            }
            catch(err){
                reject(err);
            }
        })
    }
}