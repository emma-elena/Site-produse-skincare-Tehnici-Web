const AccesBD=require('./accesbd.js');
const crypto=require("crypto");
const nodemailer=require("nodemailer");
const parole = require('./parole.js');

class Utilizator{
    static tipConexiune="local";
    static tabel="utilizatori";
    static parolaCriptare="prlCript";
    static lungimeCod = 64;
    static emailServer = "emma.elena.cobzariu2023@gmail.com";
    static numeDomeniu="localhost";
    #eroare;

    constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={}) {
        this.id=id;
        try{
            if(this.checkUsername(username))
                this.username = username;
            }
            catch(e){ this.#eroare=e.message}
            try{
                if(this.checkName(nume))
                    this.nume = nume;
                }
                catch(e){ this.#eroare=e.message}
        this.prenume = prenume;
        this.email = email;
        this.rol=rol; //TO DO clasa Rol
        this.culoare_chat=culoare_chat;
        this.poza=poza;

        this.#eroare="";
    }

    checkName(nume){ //returneaza un boolean
        //ma intai verifica daca e nenul
        return nume!= ""
    }

    set setareNume(nume){
        if (this.checkName(nume))
        this.nume = nume;
        else{
            throw new Error("Nume incorect")
        }
    }

    checkUsername(username){ 
        return username!= ""
    } 

    set setareUsername(username){
        if (this.checkUsername(username))
        this.username = username;
        else{
            throw new Error("Username incorect")
        }
    }

    salvareUtilizator(){
        let parolaCriptata=crypto.scryptSync(this.parola,Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
        let utiliz=this;
        let token=parole.genereazaToken(100);

        AccesBD.getInstanta(Utilizator.tipConexiune).insert({tabel:Utilizator.tabel,campuri:["username","nume","prenume","parola","email","culoare_chat","cod"],valori:[`'${this.username}'`,`'${this.nume}'`,`'${this.prenume}'`,`'${parolaCriptata}'`,`'${this.email}'`,`'${this.culoare_chat}'`,`'${token}'`]}, function(err, rez){
            if(err)
                console.log(err);
                
            utiliz.trimiteMail("Gata! Te-ai inregistrat cu succes","Username-ul este "+utiliz.username,
            `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
            )
        });
    }
   

    async trimiteMail(subiect, mesajText, mesajHtml, atasamente=[]){
        var transp= nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth:{//date login 
                user:Utilizator.emailServer,
                pass:"lmghgmepfokpzhrp"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        //genereaza html
        await transp.sendMail({
            from:Utilizator.emailServer,
            to:this.email, //TO DO
            subject:subiect,//"Te-ai inregistrat cu succes",
            text:mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }

    static getUtilizDupaUsername(username){ //selecteaza doar dupa username utilizatorul din BD si returneaza toate proprietatile, inclusiv parola aia criptata pe care o sa o folosim in mom in care vrem sa verificam ca e acel utilizator
        AccesBD.getInstanta(Utilizator.tipConexiune).select({tabel:"Utilizator", campuri:["*"], conditiiAnd:[`username=${username}`]}, function(err, rezSelect){
                if(err || rez.rows.length)
                throw new Error();

                let u = new Utilizator({id:rezSelect.rows[0].id, 
                    username:rezSelect.rows[0].username, 
                    nume:rezSelect.rows[0].nume, 
                    prenume:rezSelect.rows[0].prenume, 
                    email:rezSelect.rows[0].email, 
                    rol:rezSelect.rows[0].rol, 
                    culoare_chat:rezSelect.rows[0].culoare_chat,
                    poza:rezSelect.rows[0].poza})
        });
    }   
}
module.exports={Utilizator:Utilizator}
