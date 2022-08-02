// https://www.youtube.com/watch?v=EN6Dx22cPRI

const express = require('express');
const mysql = require('mysql');
const app = express();

// create Connection

let db;
 
 function handleDisconnect() {
	 
	 
 db = mysql.createConnection({
  host     : 'remotemysql.com',
  user     : 'bm42IsP6El',
  password : 'cNcCUnt5cn',
  database: 'bm42IsP6El'
});

// Connect
db.connect(function(err) {
    if (err) {
  
      throw err;
   
    }
  
    console.log('connected as id ' + db.threadId);
  });

// https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
  db.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
		console.log("DETECTION HERE.....");
	
		db = mysql.createPool({
		  host     : 'remotemysql.com',
		  user     : 'bm42IsP6El',
		  password : 'cNcCUnt5cn',
		  database: 'bm42IsP6El'
		});
	
	
	
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
 
 
 }
 
 
 
 
 handleDisconnect();
 
 
// Create new DB
app.get('/createdb', (req, res) => {

    let sql = 'CREATE DATABASE nodemysql';
    db.query(sql, (err, result) => {

        if(err) 
			
			{
				console.log("FUUUUUUUUUUUUUCK");
			}

        console.log(result);

        res.send('database created.');


    })
});


// Create table
app.get('/createpoststable', (req, res) => {

        let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY (id) )';

        db.query(sql, (err, result) => {
            if(err) throw err;
            console.log(result);
            res.send('Posts table created...');
        });

});


// Insert post 1
app.get('/addpost1', (req, res) => {

    let post = {title: 'Post MILLION!', body: 'This is post number million' };


    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);

        console.log("POST 1 added.");

    });

});


// Insert post 2
app.get('/addpost2', (req, res) => {

    let post = {title: 'Post two', body: 'This is post number two' };
    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);

        console.log("POST 2 added.");

    });

});



// Select all posts 
app.get('/getposts', (req, res) => {
    let sql = 'SELECT * FROM posts';
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);

        console.log("Posts fetched...");

    });
});


// Select single post
app.get('/getpost/:id', (req, res) => {
    let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, data) => {
        if(err) throw err;
        //console.log((data));

        const result = Object.values(JSON.parse(JSON.stringify(data)));

        console.log(result);
        console.log(result[0].id);
        console.log(result[0].title);        
        console.log(result[0].body);        

        console.log("Single Post fetched...");

    });
});

// Update post
app.get('/updatepost/:id', (req, res) => {
    let newTitle = 'Updated Title';

    let sql = `UPDATE posts SET title = '${newTitle}' WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        //console.log("HERE IS THE TITLE....");
        //console.log(result[0][0]);

        console.log("Post updated...");

    });
});



// Delete post
app.get('/deletepost/:id', (req, res) => {
    let newTitle = 'Updated Title';

    let sql = `DELETE FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        //console.log("HERE IS THE TITLE....");
        //console.log(result[0][0]);

        console.log("Post deleted...");

    });
});


app.listen('3000', () => {

    console.log('Server started on port 3000.')
});
