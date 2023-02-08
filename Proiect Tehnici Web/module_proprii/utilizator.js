//const AccesBD=require('./accesbd.js');
const crypto = require("crypto");

const { access } = require("fs");
const AccesBD = require("./accesbd");


class Utilizator{
    static tipConexiune="local";
    static tabel="utilizatori";
    static parolaCriptare="tehniciWeb"
    #eroare;

    constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={}) {
        this.id=id;

        //optional sa facem asta in constructor
        try{
           if(this.checkUsername(username))
           this.username = username;
        }
        catch(e){this.#eroare=e.message}
        
        this.username = username;
        this.nume = nume;
        this.prenume = prenume;
        this.email = email;
        this.rol=rol; //TO DO clasa Rol
        this.culoare_chat=culoare_chat;
        this.poza=poza;

        this.#eroare="";
    }

    checkName(nume){
        return nume!="" && nume.match(new RegExp("^[A-Z][a-z]+$")) ;
    }

    checkUsername(username){
        return username!="" && username.match(new RegExp("^[A-Za-z0-9]$")) ;
    }

    salvareUtilizator(){
        let parolaCriptata=crypto.scryptSync(this.parola, Utilizator.parolaCriptare, 64).toString("hex");

        AccesBD.getInstanta().insert({tabel:Utilizator.tabel, campuri:["username", "nume", "prenume", "parola", "email", "culoare_chat", "cod"], valori:[`'${this.username}'`,
        `'${this.nume}'`,`'${this.prenume}'`,`'${parolaCriptata}'`,`'${this.email}'`,`'${this.culoare_chat}'`,""]}, function(err, rez){
        if(err)
         console.log(err);

        });
    }

    set setareNume(nume){
        if (this.checkName(nume)) this.nume = nume
        else{
            throw new Error("Nume gresit")
        }
    }

    set setareUsername(username){
        if (this.checkUsername(username)) this.username = username
        else{
            throw new Error("Username gresit")
        }
    }
/*
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:obGlobal.emailServer,
                pass:"rwgmgkldxnarxrgu"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:obGlobal.emailServer,
            to:email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }
   */ 
}
