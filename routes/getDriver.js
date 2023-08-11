const express = require('express');
const router = express.Router();
const db = require('../db.config.js'); 
const { get } = require('lodash');

const pool = db.pool;
const rmvPool = db.rmvPool;

router.post('/getDriver', async(req, res) => {

    const { 
        licenseNumber,
        nic
     } = req.body;

    let driver;

    try
    {
        //if license number is given
        if(licenseNumber)
        {
            //check driver details
            driver = await rmvPool.query(
                'SELECT rmv_users.*,rmv_vehicle_category.* FROM rmv_users INNER JOIN rmv_vehicle_category ON rmv_users.license_number = rmv_vehicle_category.license_number WHERE rmv_users.license_number = $1'
                , [licenseNumber]);
        }
        if(nic)
        {
            //check driver details
            driver = await rmvPool.query(
                'SELECT rmv_users.*,rmv_vehicle_category.* FROM rmv_users INNER JOIN rmv_vehicle_category ON rmv_users.license_number = rmv_vehicle_category.license_number WHERE rmv_users.nic = $1'
                , [nic]);
        }

            if(driver.rows.length === 0)
            {
                return res.status(401).json({error: "Driver's license number is not valid"});
            }
            else
            {
                let NIC = driver.rows[0].nic;
                let userID = await pool.query(
                    'SELECT userid FROM users WHERE nic = $1'
                    , [NIC]);
                

                const previousFines = await pool.query(
                    'SELECT * FROM fine INNER JOIN police_divisions ON fine.police_divisionid = police_divisions.division_id WHERE nic = $1'
                    , [NIC]);
                
                const totalDemeritPoints = await pool.query(
                    'SELECT tot_demerit_points FROM license_status WHERE user_id = $1'
                    , [userID.rows[0].userid]);

                const licenseStatus = await pool.query(
                    'SELECT license_status FROM license_status WHERE user_id = $1'
                    , [userID.rows[0].userid]);
                
                const driverDetails = {
                    license_number: driver.rows[0].license_number,
                    surname: driver.rows[0].surname,
                    other_names: driver.rows[0].other_names,
                    address: driver.rows[0].address,
                    nic: driver.rows[0].nic,
                    birth_date: driver.rows[0].birth_date,
                    date_of_issue: driver.rows[0].date_of_issue,
                    date_of_expiry: driver.rows[0].date_of_expiry,
                    restrictions: driver.rows[0].restrictions,
                    vehicle_details: [],
                    previous_fines: [],
                    total_demerit_points: totalDemeritPoints.rows[0].tot_demerit_points,
                    license_status: licenseStatus.rows[0].license_status
                };

                driver.rows.forEach(row => {
                    driverDetails.vehicle_details.push({
                        vehicle_category: row.vehicle_category,
                        vehicle_issue_date: row.vehicle_issue_date,
                        vehicle_expiry_date: row.vehicle_expiry_date
                    });
                });

                previousFines.rows.forEach(row => {
                    driverDetails.previous_fines.push({
                        offense: row.type_of_violation,
                        date: row.time,
                        location: row.location,
                        status: row.status
                    });
                });



                return res.status(200).json(driverDetails);
            }

        
    }
    catch(err)
    {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
}
);

module.exports = router;