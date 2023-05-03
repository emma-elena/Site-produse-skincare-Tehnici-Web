
const Drepturi=require('./drepturi.js');


class Rol{
    static get tip() {return "generic"}
    static get drepturi() {return []}
    constructor (){
        this.cod=this.constructor.tip;
    }

    areDreptul(drept){ //drept trebuie sa fie tot Symbol
        return Rol.drepturi.includes(drept); //pentru ca e admin
    }
}

class RolAdmin extends Rol{
    
    static get tip() {return "admin"}
    constructor (cod_rol){
        super()
    }

    areDreptul(){
        return true; //pentru ca e admin
    }
}

class RolModerator extends Rol{
    
    static get tip() {return "moderator"}
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori
    ] }
    constructor (cod_rol){
        super()
    }
}

class RolClient extends Rol{
    static get tip() {return "comun"}
    static get drepturi() { return [
        Drepturi.cumparareProduse
    ] }
    constructor (cod_rol){
        super()
    }
}



module.exports={
    RolAdmin:RolAdmin
}