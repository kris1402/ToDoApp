const express = require('express');
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const { response } = require('express');
const { write } = require('fs');
const { nextTick } = require('process');
const collection = "todo";

const schema = Joi.object().keys({
    todo : Joi.string().required()
});

//index HTML
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});
//read
app.get('/getTodos',(req,res)=>{
    db.getDB().collection(collection).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            console.log(documents);
            res.json(documents);
        }
    });
});

app.put('/:id',(req,res)=>{
    const todoID = req.params.id;
    const userInput = req.body;
    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)},{$set : {todo : userInput.todo}}, {returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else{
            console.log(result);
            res.json(result);
        }
    });
});

app.post('/',(req,res,next)=>{
    const userInput = req.body;
    //Validation
    Joi.validate(userInput, schema, (err,result)=>{
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput, (err,result)=>{
                if(err){
                    const error = new Error("Fail to insert ToDo Document");
                    error.status = 400;
                    next(error);
                }
                    //console.log(err)
                else
                res.json({result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error : null});
            });
        }
    })

});

app.delete('/:id',(req,res)=>{
    const todoID = req.params.id;
    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)},(err,result)=>{
        if(err)
            console.log(err);
        else    
            console.log(result);
    });
});


app.use((err,req,res,next)=>{
    res.status(404).json({
        error : {
            messaage : err.messaage
        }
    });
})

db.connect((err)=>{
    if(err){
        console.log('Unable to connect to data base');
        process.exit(1);
    }
    else{
        app.listen(3000,()=>{
            console.log('Connect succesfully to database, app listening on port 3000');
        });
    }

})