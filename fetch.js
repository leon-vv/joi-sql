const q = require('sql-concat')
const camelize = require('camelize')

module.exports = (intf, conn, { schema, table }) => {

	return new Promise((resolve, reject) => {
    
        intf.fetchInformation(conn, schema, table, (err, columns) => {

            if(err) {
                reject(err)
            }
            else {
                resolve(camelize(columns))
            }
        });
	})
}
