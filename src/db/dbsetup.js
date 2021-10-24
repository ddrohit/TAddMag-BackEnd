const db = require ('./index');

module.exports = {
    setup:()=>{
        return new Promise(async(resolve,reject)=>{
            try{

                data = await db.query(`CREATE TABLE IF NOT EXISTS taddmagtrans (
                    trans_id BIGSERIAL PRIMARY KEY,
                    amount NUMERIC NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                    mode varchar(25) NOT NULL,
                    status varchar(25) NOT NULL,
                    raz_payment_id varchar(70) ,
                    raz_oder_id varchar(70),
                    by_user_id INTEGER,
                    type varchar(15) NOT NULL,
                    description varchar(70) NOT NULL
                )`);

                data = await db.query(`CREATE TABLE IF NOT EXISTS taddmagusers (

                    user_id BIGSERIAL PRIMARY KEY,
                    first_name varchar(45) NOT NULL,
                    mobile_number varchar(12) NOT NULL UNIQUE,
                    mobile_verified BOOLEAN DEFAULT FALSE NOT NULL,
                    kyc_status BOOLEAN DEFAULT FALSE NOT NULL,  
                    dateofbirth DATE NOT NULL, 
                    age INTEGER NOT NULL,
                    address varchar(100) NOT NULL,
                    city varchar(30) NOT NULL,
                    district varchar(30) NOT NULL,
                    state varchar(30) NOT NULL,
                    pincode varchar(20) NOT NULL,
                    pancard varchar(20),
                    pancard_doc varchar(30),
                    aadhar varchar(20),
                    aadhar_doc varchar(30),
                    bank_name varchar(20),
                    bank_doc varchar(30),
                    account_number varchar(20),
                    ifsccode varchar(20),
                    refferedby varchar(20),
                    referalcode varchar(20) UNIQUE,
                    payment_id INTEGER REFERENCES taddmagtrans (trans_id) UNIQUE NOT NULL,
                    password varchar(450) NOT NULL,
                    level integer NOT NULL DEFAULT 1 NOT NULL,
                    money_earned NUMERIC NOT NULL DEFAULT 0 NOT NULL,
                    money_spent NUMERIC NOT NULL DEFAULT 500 NOT NULL,
                    no_of_referals integer NOT NULL DEFAULT 0 NOT NULL,
                    registred_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                )`);

                data = await db.query(`CREATE TABLE IF NOT EXISTS PendingPayments (
                    pp_id BIGSERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES taddmagusers (user_id) NOT NULL,
                    amount NUMERIC,
                    description varchar(70) NOT NULL,
                    payment_id INTEGER REFERENCES taddmagtrans (trans_id),
                    status varchar(20) NOT NULL
                )`);
                
                resolve("Data Base Setup Completed");
            }
            catch(err){reject(err)}
        })
    }
}