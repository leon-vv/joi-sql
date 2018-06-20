const pFinally = require('p-finally')

const mysql = require('mysql')
const { Pool, Client } = require('pg')

const mysqlInt = require('./mysql-interface.js');
const postgresInt = require('./postgres-interface.js');

const build = require('./build')
const fetch = require('./fetch')

module.exports = argv => {
	const { database, schema, table, host, user, password, camel, connection } = Object.assign({
		host: '127.0.0.1',
		user: 'root',
		password: '',
	}, argv)

	if (typeof schema !== 'string'
	        || typeof table !== 'string'
	        || typeof database !== 'string') {

		throw new Error('you must pass in schema, table and database arguments');
    } else if (database !== 'postgresql' && database !== 'mysql') {
    
        throw new Error('Only postgresql and mysql are supported.. pull requests accepted!');
	} else {

	    let intf = database === 'mysql' ? mysqlInt : postgresInt;

		const conn = connection || intf.createConnection({
            host, user, password
		});

		return pFinally(fetch(intf, conn, { schema, table }).then(columns => {
			return build(intf, columns, camel)
		}), () => {
			intf.close(conn)
		})
	}
}
