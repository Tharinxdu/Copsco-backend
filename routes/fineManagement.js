const express = require('express');
const router = express.Router();
const db = require('../db.config.js'); 
const { get } = require('lodash');
const { v4: uuidv4 } = require('uuid');

const pool = db.pool;
const rmvPool = db.rmvPool;


router.post('/issueFines', async(req, res) => {
  
    const {
        date,
        time,
        vehicleNumber,
        vehicleProvince,
        policeDivisionID,
        description,
        typeOfOffence,
        fineAmount,
        demeritPoints,
        licenseNumber
    } = req.body;


    try
    {
        //check driver details
        const driver = await rmvPool.query(
            'SELECT * FROM rmv_users WHERE license_number = $1', [licenseNumber]);

        if(driver.rows.length === 0)
        {
            return res.status(401).json({error: "Driver not found, please check the license number"});
        }
        else
        {
            //return driver details as json
            const driverDetails = driver.rows[0];
            const NIC = driverDetails.nic;
      


            //check if police division exists
            const police = await pool.query("SELECT * FROM police_divisions WHERE division_id = $1", [policeDivisionID]);

            if(police.rows.length === 0)
            {
                return res.status(401).json({error: "Invalid police division"});
            }
            else
            {
                //generate a uuid for the reference id
                const reference_ID = uuidv4();

                //set due date two weeks after the current date
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 14);
                const dueDate = currentDate.toISOString().slice(0,10);

                const fine = await pool.query(
                    "INSERT INTO fine (reference_id, date, time, vehicle_number, vehicle_province, police_divisionid, type_of_offence, amount, demerit_points, due_date, nic,description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12) RETURNING *",
                    [reference_ID, date, time, vehicleNumber, vehicleProvince, policeDivisionID, typeOfOffence, fineAmount, demeritPoints, dueDate, NIC,description]
                );

                if(fine != null)
                {
                    return res.status(200).json({
                        message: "Fine issued successfully"
                    });
                }
                else
                {
                    return res.status(401).json({error: "Error issuing fine, please try again"});
                }
            }
        }   
    }

    catch(err)
    {
        console.error(err.message);
    }

});

router.get('/getFineDetails', async(req, res) => {
    const { referenceID } = req.body;

    try
    {
        const fine = await pool.query("SELECT * FROM fine WHERE reference_id = $1", [referenceID]);

        if(fine.rows.length === 0)
        {
            return res.status(401).json({error: "Fine not found"});
        }
        else
        {
            return res.status(200).json(fine.rows[0]);
        }
    }
    catch(err)
    {
        console.error(err.message);
    }
});




module.exports = router;
