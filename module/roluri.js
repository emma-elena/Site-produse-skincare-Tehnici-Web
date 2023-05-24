
const Drepturi=require('./drepturi.js');

// static get tip() e un fel de constanta string care arata tipul de rol



//rol e clasa de baza
class Rol{
    static get tip() {return "generic"}
    static get drepturi() {return []}
    constructor (){
        this.cod=this.constructor.tip; //nu e obligatorie aceasta linie
    }

    areDreptul(drept){//aici se verifica daca rolul are dreptul dat in paranteza si care va fi simbolul din drepturi; drept trebuie sa fie tot Symbol
        return this.constructor.drepturi.includes(drept); //pentru ca e admin
    }
}

class RolAdmin extends Rol{
    
    static get tip() {return "admin"}
    constructor (){
        super() //super constructorul clasei de baza, aici apelez constructorul din rol, si dupa pot sa pun o propr doar a acestui rol, nu si a clasei de baza
    }

    areDreptul(){ 
        return true; //pentru ca e admin
    }
}


//aici nu am mai definit functia areDreptul pentru ca este tot cea din Rol

class RolModerator extends Rol{
    
    static get tip() {return "moderator"}
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori,
        Drepturi.vizualizareForum,
        Drepturi.stergeMesaj
    ] }
    constructor (){
        super()
    }
}

class RolClient extends Rol{
    static get tip() {return "comun"}
    static get drepturi() { return [
        Drepturi.cumparareProduse,
        Drepturi.vizualizareForum
    ] }
    constructor (){
        super()
    }
}



class RolFactory{
    //imi ofera obiectele de tip rol in functie de val din enum (comun etc.) 
    static creeazaRol(tip){ //ii transmit un tip de clasa derivata
        switch(tip){
            //imi returneaza pe banda obiect de acel tip
            case RolAdmin.tip: return new RolAdmin();
            case RolModerator.tip: return new RolModerator();
            case RolClient.tip: return new RolClient();
        }
    }
}

module.exports={
    RolFactory:RolFactory,
    RolAdmin:RolAdmin
}