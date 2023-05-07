window.addEventListener("load",function(){

	prod_sel=localStorage.getItem("cos_virtual");  //luam id-urile din cosul virtual si le punem in prod_sel

	if (prod_sel){
		var vect_ids=prod_sel.split(","); //fac split si obtin vectorul de id-uri si vreau informatii despre ele
		//fetch face cerere (in loc sa caut in browser produse-cos si sa intre intr-un app.get corespunzator poate am nev prin program sa fac o astfel de cerere si fac cu fetch aici)
		fetch("/produse_cos", {		 //cerere catre server in care ii cer carac. pentru aceste id-uri din tabelul de produse

			method: "POST", 
			headers:{'Content-Type': 'application/json'}, 
			
			//ii transmit un json pt ca transmit param cu valori si cel mai simplu e sa le codific intr-un json, un obiect cu propr care la randul lor vor avea obiecte
			mode: 'cors',	 //sa fie pe acelasi site	
			cache: 'default',
			body: JSON.stringify({//pun datele pe care vreau sa e transmit catre server
				a:10,
				b:20,

				ids_prod: vect_ids

			})
		})    
		//dupa ce se termina fct fetch incepe urmatoarea cu rasp care afiseaza raspunsul primit de la fetch
		//fct json transforma raspunsul in obiect

		//rasp e ce returneaza fetch
		.then(function(rasp){ console.log(rasp); x=rasp.json(); console.log(x); return x})

		//dupa ce s-a terminat functia function(rasp) se duce la urmatoarea care primeste obiectul objson din json care nu mai e string, are valori, prop tot
		.then(function(objson) {
	
			console.log(objson);//objson e vectorul de produse

			//acum creem niste articole coresp fiecarui element din cosul virtual
			let main=document.getElementsByTagName("main")[0];
			let btn=document.getElementById("cumpara");

			//iau fiecare prod
			for (let prod of objson){
				let article=document.createElement("article");
				article.classList.add("cos-virtual");
				var h2=document.createElement("h2");
				h2.innerHTML=prod.nume;
				article.appendChild(h2);
				let imagine=document.createElement("img");
				imagine.src="/resurse/imagini/produse/"+prod.imagine;
				article.appendChild(imagine);
				
				let descriere=document.createElement("p");
				descriere.innerHTML=prod.descriere+" <b>Pret:</b>"+prod.pret;
				article.appendChild(descriere);
				main.insertBefore(article, btn);
				

			}
	
		}
		).catch(function(err){console.log(err)});




		document.getElementById("cumpara").onclick=function(){
			prod_sel=localStorage.getItem("cos_virtual");// "1,2,3"
			if (prod_sel){
				var vect_ids=prod_sel.split(",");
				fetch("/cumpara", {		
		
					method: "POST",
					headers:{'Content-Type': 'application/json'},
					
					mode: 'cors',		
					cache: 'default',
					body: JSON.stringify({
						ids_prod: vect_ids,
						a:10,
						b:"abc"
					})
				})
				.then(function(rasp){ console.log(rasp); return rasp.text()})
				.then(function(raspunsText) {
			
					console.log(raspunsText);
					if(raspunsText){
						localStorage.removeItem("cos_virtual")
						let p=document.createElement("p");
						p.innerHTML=raspunsText;
						document.getElementsByTagName("main")[0].innerHTML="";
						document.getElementsByTagName("main")[0].appendChild(p)
					}
				}).catch(function(err){console.log(err)});
			}
		}
		
	}
	else{
		document.getElementsByTagName("main")[0].innerHTML="<p>Nu aveti nimic in cos!</p>";
	}
	
	
});