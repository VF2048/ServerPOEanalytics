const express = require('express');
const app = express();
const fetch = require('node-fetch');
const mysql = require('mysql');
var connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '1234',
    database: 'mydb'
})

connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });
    

var url = 'http://api.pathofexile.com/public-stash-tabs/';
var Resp;
var stashes;
var stashess;
var i=0;

function requests(next_change_id){
    fetch(url + next_change_id)
    .then(response => {
        if(response.status == 200){
            console.log('OK');
            return response;
        }
    })
    .then(response => {
        Resp = response.json();
        decodingAnswer(Resp);
    });
    
    function decodingAnswer(Resp){
        Resp
        .then(value => {
            savevalue(value);
            console.log(value.next_change_id);
            if(next_change_id != value.next_change_id && i<=30){
                i++;
                // requests(value.next_change_id);
            };
            return stashes;
        });
    }
    return stashes;
}

requests();

function savevalue(value){
    value.stashes.map(stashe => {
        if(stashe.public == true){
            if(stashess != undefined){
                stashess = stashess.concat(stashe);
            }else{
                stashess = [stashe];
            }
            stashe.items.map(item => {
                if(stashe.stash == '~b/o' || stashe.stash == '~price'){
                    item.note = stashe.stash;
                    console.log('aaaaaaa')
                }
                connection.query('INSERT INTO posts SET ?', {
                    accountName: stashe.accountName,
                    lastCharacterName: stashe.lastCharacterName,
                    itemName: item.name + ' ' + item.typeLine,
                    price: item.note,
                },
                function (error, results, fields) {
                    if (error) throw error;
                });
            })
        }
    })

}
                
app.use((request, response, next) => {
    const itemName = " Chaos Orb";
    const sql = "SELECT * FROM posts WHERE itemName IN (?)";
 
    connection.query(sql, itemName, function(err, results) {
        if(err) console.log(err);
        else {console.log(results)};
    });

    // stashes.map(item => {
        // if(item.accountName != null){
        //     nicknames.push(item.accountName);
        // };
    //     if((item.accountName=='Vfokin')){
    //         nicknames.push(item)
    //     }
    // })
    response.header("Access-Control-Allow-Origin", "http://localhost:3001"); // update to match the domain you will make the request from
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})
app.get('/', (request, response) => {
    response.jsonp(stashess)
})

app.get('/', (request, response) => {
    throw new Error('oops')
})
app.use((err, request, response, next) => {
    console.log(err)
    response.status(500).send('Something broke!')
})

app.listen(3000)