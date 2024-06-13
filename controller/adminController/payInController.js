import ExcelDataModel from '../../models/excelDataSchema.js';


const calculateODandTP = async (req, res) => {
    try {
        const { fuelType, vehicleType, age, policyType } = req.query;

        // Validate the input parameters
        if (!fuelType || !vehicleType || !age || !policyType) {
            return res.status(400).json({ message: 'Missing required query parameters' });
        }

        // Build the query object based on provided parameters
        const dbQuery = {
            fuelType: fuelType,
            vehicleType: vehicleType,
            age: age,
            policyType: policyType
        };

        // Fetch the relevant record from the database
        const matchedRecord = await ExcelDataModel.findOne(dbQuery);
console.log("matchrecord",matchedRecord);
        if (!matchedRecord) {
            return res.status(404).json({ message: 'No matching record found in the database', status:"Failed"});
        }

        // Return the OD and TP values from the matched record
        res.status(200).json({
            message: 'Record found',
            data: {
                OD: matchedRecord.od,
                TP: matchedRecord.tp
            },
            status:"Success",
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
};

export { calculateODandTP };
