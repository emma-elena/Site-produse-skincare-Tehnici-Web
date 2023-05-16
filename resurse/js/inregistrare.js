 window.onload= function(){
    var formular=document.getElementById("form_inreg");
    if(formular){
    formular.onsubmit= function(){
            if(document.getElementById("parl").value!=document.getElementById("rparl").value){
                alert("Parolele introduse nu coincid");
                return false;
            }

            return true;
        }
    }
 }

 function showTermsModal() {
    // Creați elementele fereastrei modale
    var modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
  
    var modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContainer.appendChild(modalContent);
  
    // Adăugați butonul de închidere în containerul fereastră modală
    var closeButton = document.createElement('button');
    closeButton.innerHTML = 'Închide';
    closeButton.className = 'close-button';
    closeButton.addEventListener('click', function() {
      modalContainer.remove();
    });
    modalContainer.appendChild(closeButton);
  
    // Adăugați conținutul termenilor și condițiilor în fereastra modală
    var termsText = document.createTextNode('ATENTIE! Acesta este un proiect scolar! INTRODUCERE Mulțumim pentru interesul față de compania, site-ul și produsele pe care le comercializăm prin intermediul magazinului nostru online. Vă rugăm să citiți acest document cu atenție. Acest document reprezintă condițiile utilizării site-ului și condițiile plasării de comenzi de produse prin intermediul acestuia. Prin navigarea pe site-ul nostru sau prin plasarea unei comenzi sunteți de acord cu Termenii și Condițiile descrise mai jos. Acest document reprezintă o convenție legală – un contract între dumneavoastră și noi. Dacă nu sunteți de acord cu acești Termeni sau cu Politicile indicate mai sus, vă rugăm să nu utilizați site-ul.');
    modalContent.appendChild(termsText);
  
    // Adăugați fereastra modală la pagina curentă
    document.body.appendChild(modalContainer);
  }
  