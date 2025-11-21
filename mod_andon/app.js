class customAPP {
	constructor() {
		this.cache_resource = null
		this.scrapAdvanceEditor = new scrapReasons();

		this.appControl_clear();
		this.appData_clear();	
		this.gui();	
		this.stayAlive();
	}
	appControl_clear() {
		this.appControl = {
			visao:[
				["PCP",[
					["Nota",'Balança'],
					["Romaneio","Nota"],
					//["Detalhamento","Novo",2,4],
					["Conferencia","Conferência Terceiro SBC"],
					["Revisao","Revisão Terceiro SBC"],
					//["Pedido de Venda","Pedido De Venda Terceiro SBC"],
					["Vendas","Aprovação Terceiro SBC"],
					//["Liberado","Liberado Terceiro SBC"],
					//["Produção/PCP","Produção Terceiro SBC"],
					["Produzido","Produzido Terceiro SBC"]
					]
					,10
				],
				["Recebimento",[
					["Nota",'Balança'],
					["Romaneio","Nota"],
					//["Detalhamento","Novo",2,4],
					["Conferencia","Conferência Terceiro SBC"],
					["Revisao","Revisão Terceiro SBC"],
					//["Pedido de Venda","Pedido De Venda Terceiro SBC"],
					//["Aprovação/Vendas","Aprovação Terceiro SBC"],
					//["Liberado","Liberado Terceiro SBC"],
					//["Produção/PCP","Produção Terceiro SBC"],
					/*["Produzido","Produzido Terceiro SBC"]*/
					]
					,20
				]
			],
			//Status Baseado na Ultima ação realizada no documento
			colunas: [
				]
			,maxRows:0
			,maxPage:0
			,curPage:0
			,curTime:0
			,cardsPage:11
			,dataInterval:null
			,pageInterval:null
			,pageIntervalTime:9
			,medium:2
			,high:4
			,play:1
		}
	}

	minhaNovaFuncaoQueVaiFicar(){
		return 'cccc'
		// antigo -> return 'abbbbbbaaa'
	}

	appData_clear() {
		// We clear all appData we stored previously
		this.appData = {
			dados:[
				/**
				 0 - NF
				 1 - Nome Cliente
				 2 - PESO
				 3 - Data Origem (Balanca)
				 4 - Status Atual
				 5 - Data Status
				 6 - Vendedor
				 7 - Data Criação
				 */
			],
			dadosPage:[]
		};
	}
	gui() {
		// Using the UI.js library we create an input field and the container for a data grid
		let html = "";
		html += `
		<div id="andon">
		<div class="is-navigation">
			<a class="is-navbar-item" href="?program_id=terminal20&amp;page=main"><span class="icon is-small"><i class="fa fa-home" aria-hidden="true"></i></span></a>
			<div class="is-pageCount"><span id="atualPage">0/0</span></div>
			<div class="is-pageview">${this.createViews()}</div>
			<span class="is-navbar-stop"><span class="icon is-small"><i name="play_pause" class="fa fa-pause" aria-hidden="true"></i></span></span>
		</div>
		<div id="andon-area"></div>
		</div>`;
		// Finally we render the app into the app container
		document.getElementById("app-container").innerHTML = html;
		this.uxInit();
		//this.createTable();
		document.getElementById("main-navigation").remove();

	}

	createViews(){
		let html = "";
		this.appControl.visao.forEach((view,rid) =>{	
			html+=`<input type="radio" id="${view[0]}" view="${rid}" name="viewAndon" value="${view[0]}"><label for="${view[0]}">${view[0]}</label></input>`
		})
		return html
	}

	uxInit(){
		ux.listen('click','play_pause',function(e){
			this.playPause()
		}.bind(this))

		ux.listen('change','viewAndon', function(e){
			this.changeView()
		}.bind(this))
	}

	changeView(){
		clearInterval(this.appControl.dataInterval);
		this.appControl_clear();
		let check_view = ""
		document.getElementsByName('viewAndon').forEach(view =>{
			if (view.checked) { 
				check_view = view;
				return;
			}
		});

		this.appControl.colunas = this.appControl.visao[check_view.getAttribute('view')][1];
		this.appControl.cardsPage = this.appControl.visao[check_view.getAttribute('view')][2];

		this.createTable();
		this.getDados();
	}


	playPause(){
		let a = ux.getElement('play_pause');
		this.appControl.curTime = this.appControl.pageIntervalTime;
		this.appControl.play = (this.appControl.play==0)?1:0;
		if (this.appControl.play == 1){
			a.setAttribute('class','fa fa-pause')
		}else{
			a.setAttribute('class','fa fa-play')	
		}
	}
	

	createTable(){
		let html = 
			`<div id="andon-board" class="is-andon-${this.appControl.colunas.length}">
			${this.createHeader()}
			</div>
		`
		ux.getElement('andon-area').innerHTML = html;
		//this.createCards();
		//this.startTimes();
	}

	createHeader(){
		let html = "";
		this.appControl.colunas.forEach( x=> {
			html+=`<div class="is-column">
				<div class="is-column-title">${x[0]} - <span id="col_${x[1]}">0</span></div>
				<div class="is-column-data" id="${x[1]}"></div>
			</div>`
		})
		return html
	}

	createCardsPage(){
		this.appData.dadosPage.forEach(card => {
			let eCard=document.getElementById(card[0]);
			if (!eCard){
				let html =`
					<div class="is-card-title">
					<div class="is-card-id">${card[0]}</div>
					<div class="is-card-cliente">${card[1]}</div>
					</div>
					<div class="is-card-dados">
					<span class="is-card-vendedor">${card[7]}</span> - Peso: ${card[2]} - Acab: <b>${card[9]}</b> 
					<div>Data:${card[3]} - Status:${card[6]}</div>
					</div>
					<div class="is-card-time" hasInterval="N" status-date="${card[5]}" create-date="${card[8]}">00:00:00</div>
				`		
				let div = document.createElement('div');

				div.setAttribute('class','is-card');
				div.setAttribute('id',card[0]);
				div.setAttribute('status',card[4]);
				div.innerHTML = html;

				let a = document.getElementById(card[4]);
				if (a) a.appendChild(div);
			}else{
				if (eCard.getAttribute('status') !== card[4]){	
					eCard.setAttribute('status',card[4])
					let a = document.getElementById(card[4]);
					if (a) a.appendChild(eCard);
				}
			}
		})
	}

	contextMenu(){
		document.querySelectorAll('.is-card').forEach(card => {	
			card.addEventListener("contextmenu", (e) => {
				e.preventDefault();

				if (card.getAttribute('status') == 'Balança'){
					let menu = document.createElement("div")
					menu.id = "ctxmenu"
					menu.style = `top:${e.pageY-10}px;left:${e.pageX-40}px`
					menu.onmouseleave = () => ctxmenu.outerHTML = ''
					menu.innerHTML = `<p onclick="app.removerNF('${card.id}')">Ignorar Nota: ${card.id}</p>`
					document.body.appendChild(menu)
				}

				if (card.getAttribute('status') == 'Nota'){
					let menu = document.createElement("div")
					menu.id = "ctxmenu"
					menu.style = `top:${e.pageY-10}px;left:${e.pageX-40}px`
					menu.onmouseleave = () => ctxmenu.outerHTML = ''
					menu.innerHTML = `<p onclick="app.removerNF('${card.id}')">Ignorar Nota: ${card.id}</p>`
					document.body.appendChild(menu)
				}
			  });
		})
	}

	removerNF(id){
		let dados = {
			get:'postAux',
			acao:'ignorarNF',
			dados:`@${id}@`
		}

		console.log(dados)

		let funcEnd = function(){
			this.changeView()
		}.bind(this)

		this.setAux(dados,funcEnd)
	}
			

	startTimes(){

		/* trocado para apensa definir a DATA sem timer! */

		document.querySelectorAll('.is-card-time').forEach(time => {
			let status_date = new Date(time.getAttribute('status-date'));
			let ant = status_date.getTime() /1000;
			let agora_date=new Date();
			let now=agora_date.getTime() / 1000;

			let create_date = new Date(time.getAttribute('create-date'));
			let antCreate = create_date.getTime() /1000;

			let tempoCreate = now-antCreate;
			let tempo = now-ant;
			
			let days = Math.floor(tempoCreate/86400);
			let hour = Math.floor((tempoCreate%86400)/3600);


			let tAtual = this.sec2time(tempo);
			let tAcumulado = this.sec2time(tempoCreate);

			let html = (tAtual==tAcumulado)?`${tAtual}`:`${tAtual} (${tAcumulado})`

			time.textContent = html;
			time.setAttribute('hasInterval','Y');

			let status = time.parentNode.getAttribute('status');

			let medium = this.appControl.medium//app.appControl.colunas.find(x => x[1] == status)[2]
			let high = this.appControl.high//app.appControl.colunas.find(x => x[1] == status)[3]

			if (days >= high){
				time.parentNode.setAttribute('class','is-card is-card-high')
			}else if(days >= medium){
				time.parentNode.setAttribute('class','is-card is-card-medium')
			}else {
				time.parentNode.setAttribute('class','is-card')
			}
		})

		// document.querySelectorAll('.is-card-time').forEach(time => {	
		// 	let newInteval=window.setInterval(
		// 		function() { 
		// 			let status_date = new Date(time.getAttribute('status-date'));
		// 			let ant = status_date.getTime() /1000;
		// 			let agora_date=new Date();
		// 			let now=agora_date.getTime() / 1000;

		// 			let create_date = new Date(time.getAttribute('create-date'));
		// 			let antCreate = create_date.getTime() /1000;

		// 			let tempoCreate = now-antCreate;
		// 			let tempo = now-ant;
					
		// 			let days = Math.floor(tempoCreate/86400);
		// 			let hour = Math.floor((tempoCreate%86400)/3600);


		// 			let tAtual = this.sec2time(tempo);
		// 			let tAcumulado = this.sec2time(tempoCreate);

		// 			let html = (tAtual==tAcumulado)?`${tAtual}`:`${tAtual} (${tAcumulado})`

		// 			time.textContent = html;
		// 			time.setAttribute('hasInterval','Y');

		// 			let status = time.parentNode.getAttribute('status');

		// 			let medium = this.appControl.medium//app.appControl.colunas.find(x => x[1] == status)[2]
		// 			let high = this.appControl.high//app.appControl.colunas.find(x => x[1] == status)[3]

		// 			if (days >= high){
		// 				time.parentNode.setAttribute('class','is-card is-card-high')
		// 			}else if(days >= medium){
		// 				time.parentNode.setAttribute('class','is-card is-card-medium')
		// 			}else {
		// 				time.parentNode.setAttribute('class','is-card')
		// 			}		
		// 	}.bind(this))
		// 	time.setAttribute('intervalId',newInteval);
		// })
	}

	removeCards(){
		document.querySelectorAll('.is-card').forEach(card=>{
			let valido = this.appData.dados.findIndex( x=> x[0]==card.getAttribute('id'));
			if (valido === -1) card.remove()

		})
	}

	removeCardsPage(){
		document.querySelectorAll('.is-card').forEach(card=>{
			if (card.getAttribute('hasInterval') == 'Y') clearInterval(card.getAttribute('intervalId'));
			card.remove()
		})
	}

	async getDados(){

		let dados = {
			get:"getAux",
			acao:"getDados",
			dados:"",
			dg_limit:9999,
			dg_page:1
		}
		await this.getAux(dados,'dados',false).then((res)=>{
			this.startPages();
			}
		);

		/*et iGetDados = window.setInterval(async function(){
		}.bind(this),9000) */
	}

	startPages(){
		let dadosByColumn = [];
		let maxRows = 0;
		this.appControl.colunas.forEach( col=>{
			let validos = this.appData.dados.filter(row => row[4] === col[1]);
			dadosByColumn.push([col[1],validos.length,parseInt(Math.ceil(validos.length/this.appControl.cardsPage)),validos,[]]);
			if (maxRows < validos.length) maxRows = validos.length;

			let peso = 0
			validos.forEach(x=>{
				peso += parseFloat(x[2].substring(0,(x[2].length-3)))
			})

			ux.getElement(`col_${col[1]}`).innerHTML = `${validos.length} | ${ux.formatNumber(peso.toFixed(0),0,true)} Kg`;
			
		})
		this.appData.dadosByColumn=dadosByColumn;
		this.appControl.maxRows = maxRows;
		this.appControl.maxPage = parseInt(maxRows/this.appControl.cardsPage)
		this.appControl.curPage = 0
		//this.removeCards();
		//this.createCards();
		//this.startTimes();

		if (!this.appControl.dataInterval) {
			this.appControl.dataInterval = window.setInterval(async function(){
				this.newPage();
			}.bind(this),1000)
		}
	}	

	newPage(){
		if (this.appControl.play) {
			if (this.appControl.curTime+1 <= 0) { 
				//beas.resetTimer();
				this.appControl.curTime = this.appControl.pageIntervalTime;
				this.getNextPage();
			}
			let a = ux.getElement('pageSec');
			if (a) a.innerHTML=(this.appControl.curTime||0)
			this.appControl.curTime--;
		}
	}
	
	getPage(f){

		if (parseInt(f.value) > this.appControl.maxPage){
			f.value = this.appControl.maxPage
			return
		} 
		if (parseInt(f.value) < 1) {
			f.value = 1
			return
		}

		this.appControl.curPage = parseInt(f.value)-1;
		this.appControl.play=1;
		this.playPause();
		this.getNextPage();
	}

	getNextPage(){
		this.appControl.curPage++;
		if (this.appControl.curPage > this.appControl.maxPage) {
			clearInterval(this.appControl.dataInterval);
			this.appControl.dataInterval = null;
			this.getDados();
			return;
		}
		ux.getElement('atualPage').innerHTML = `Gestão à Vista - Terceiros - 
		<input id="curPage" class="is-input-curPage" type="number" value="${this.appControl.curPage}" onchange="app.getPage(this)"/>/${this.appControl.maxPage} - <span id="pageSec"></span>s
		`
		this.appData.dadosPage=[];
		this.appData.dadosByColumn.forEach(cols =>{

			let pageCol= (this.appControl.curPage > cols[2])?cols[2]:this.appControl.curPage

			let ini = (pageCol*this.appControl.cardsPage)-this.appControl.cardsPage;
			let end = (pageCol*this.appControl.cardsPage);



			cols[4] = cols[3].slice(ini,end);
			cols[4].forEach(row => {
				this.appData.dadosPage.push(row)
			})
		});

		this.removeCardsPage();
		this.createCardsPage();
		this.startTimes();
		this.contextMenu();
	}
	

	async getAux(dados, grid, loading=true) {
		ux.apost('?program_id=' + appInfo.gid + '&page=' + appInfo.appID
			, dados
			, function (err, result) {
				if (!ux.aError(result, true)) {
					if (result.value.length > 0) {
						app.appData[grid] = result.value;
					} else {
						app.appData[grid] = [];
					}
				} else {
					app.appData[grid] = [];
				}
			}
			, {
				timeout: 180000
				, loading: loading
			}
		);
		await ux.wait(); 
		return await Promise.resolve(false);
	}

	async setAux(dados, func = null,param={}) {
		ux.apost('?program_id=' + appInfo.gid + '&page=' + appInfo.appID
			, dados
			, async function (err, result) {
				if (!ux.aError(result, true)) {
					if (result.value[0][0] == 'Sucesso') {
						await func(param)
					} else {
						console.log(result.value[0][0])
					}
				} else {
					console.log(result.value[0][0])
				}
			}
			, {
				timeout: 180000
				, loading: true
			}
		);

		await ux.wait(); 
		return await Promise.resolve(false);
	}

	sec2time(s) {
		let days = Math.floor(s/86400);
		let hours = Math.floor((s%86400)/3600);
		let mins = Math.floor((s%86400)%3600/60);
		let secs = Math.floor(s%86400)%3600%60;

		let html = "";
		if (days>1) html+=days+' '+'Dias'
		else if (days>0) html+=days+' '+_t('Dia')
		else html+= (hours<10?'0':'') + hours + ':' + (mins<10?'0':'') + mins

		return html;
		//return (days>0?(days+' '+_t('Days')+' '):'') + (hours<10?'0':'') + hours + ':' + (mins<10?'0':'') + mins ; //+":"+(secs<10?'0':'')+secs
	}

	async stayAlive() {
        this.appControl.stayAlive = setInterval(() => { 
			beas.resetTimer();
			beas.ping_stop();
		 }, 5000);
        
    }
}
var app = new customAPP;
