const { Pool, Client } = require('pg')

module.exports.intToBytes = {
    smallint: 2,
    integer: 4,
    bigint: 8
};

module.exports.hasUnsigned = false;

module.exports.createConnection = (info) => {

    return new Pool(info);
}

module.exports.fetchInformation = (conn, schema, tableName, cb) => { 

    var query = 'select * from information_schema.columns where table_schema = $1';

    postgresCb = (error, result) => {
        cb(error, result.rows);
    }

    if(tableName) {
        query += ' AND table_name = $2';
        conn.query(query, [schema, tableName], postgresCb);
    }
    else {
        conn.query(query, schema, postgresCb);
    }
}

module.exports.close = (conn) => {

    conn.end();
}

