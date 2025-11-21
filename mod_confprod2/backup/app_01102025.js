class customAPP {
	constructor() {
		this.loadApp();
	}
	async loadApp(){
		await this.appControlInit()
		await this.appDataInit();  
		await sps.getCSS().then(async (res) => {
			await sps.loadDefaultSPS_CSS().then(async (res) => {
				this.gui();
				this.getOrdens();
			})
		})
	}
	async appControlInit(){
		this.appControl={}
		this.appControl.funcSuccess=async (params)=>{
			this.getCargas();
		}
		this.appControl.funcError=async (params)=>{
			let html = "";
			if (params.match('EventosDesatualizados')){
				this.appData.EventosDesatualizados = JSON.parse(params.split('|')[1])
				html += `
				<span style="font-size:1.5rem">Eventos abaixo estão desatualizados, remover seleção para continuar!</span>
				<div id="eventosDesatualizados"/>
				`
			}else{
				html += msg
			}
			ux.dialog('Erro',html
				,{ buttons: [{ id: 'ok', title: _t("OK"), type: "is-danger" }]}
			)
			await this.msgEventosDesatualizados();
		}

		this.appControl.colunasMsgEventosDesatualizados = [
				{
					name: "",
					title: ``,
					selecMode: ``,
					editMode: ``,
					inputFilter: ``,
					filterValue: '',
					inputFooter: '',
					styleFunction: function(value, row) { 
						let classRow = [];
						if (value) classRow.push('is-row-selected');
						return [classRow, ['is-cell']]; 
					},
					formatFunction: function(value) { return value; }
					,stayChecked:false
			},
				{
				name: "Carga",
				title: `Carga`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[],
				sort:true,					
			},
				{
				name: "Evento",
				title: `Evento`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[],
				sort:true
			}
		]

		this.appControl.colunasOrdens = [
			/*
			"Selecionar"
			,"Tipo"
			,"DocDate"
			,"Lote"
			,"Perfil"
			,"Item"
			,"Acabamento"
			,"Quantidade"
			,UM
			,"Etiquetas"
			,"QuantityConf"
			,"PersdIdConf"
			,"DataConf"
			,"Cliente"
			,POS_ID
			,"OP"
			,BUCHNR_ID
			,"Origem"
			*/
			{
				name: "Selecionar",
				title: `<INPUT TYPE = "checkbox" style="height:1.5rem;width:1.5rem;" name = "selec_{dados_name}_todos" onchange = "sps.table_select_all('{dados_name}',this)" />`,
				selecMode: `<input type= "checkbox" name = "selec_{dados_name}_{rid}" disabled {checked}>`,
				editMode: `<input type= "checkbox" name = "selec_{dados_name}_{rid}" disabled {checked}>`,
				inputFilter: `<input type="checkbox" name="filter_{dados_name}_{column}" {checked}/>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { 
					let classRow = [];
					if (value) classRow.push('is-row-selected');
					return [classRow, ['is-cell']]; 
				},
				formatFunction: function(value) { return value; }
				,stayChecked:false
			},
			{
				name: "Tipo",
				title: `Tipo`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					/*{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					},*/{
						listen:'dblclick'
						,function: async function(dados_name,col,rid,e){

							let dados = this.appData.cargas
							let colunas= this.appControl.colunasOrdens;
							let container='main';
							let classType='is-sps-table-v1';
							let mode = this.appData.mode||'selecMode';
							
							let cell = e.target;
							let value = cell.innerHTML;
							let name = `filter_${dados_name}_${colunas[col].name}`;
							let input = document.getElementsByName(name)[0];
							input.value = value;

							sps.table_filter({colunas, dados, container, classType, mode, dados_name, name, i: col, apply: true});
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "DocDate",
				title: `Data`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "Lote",
				title: `Lote`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					/*{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					},*/{
						listen:'dblclick'
						,function: async function(dados_name,col,rid,e){

							let dados = this.appData.cargas
							let colunas= this.appControl.colunasOrdens;
							let container='main';
							let classType='is-sps-table-v1';
							let mode = this.appData.mode||'selecMode';
							
							let cell = e.target;
							let value = cell.innerHTML;
							let name = `filter_${dados_name}_${colunas[col].name}`;
							let input = document.getElementsByName(name)[0];
							input.value = value;

							sps.table_filter({colunas, dados, container, classType, mode, dados_name, name, i: col, apply: true});
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "Perfil",
				title: `Perfil`,
				selecMode: `<img width="32" height="32" loading="lazy" src="BitmapPath//{value}" onerror="this.src='assets21//img//wbb.png'">`,
				editMode: `<img width="32" height="32" loading="lazy" src="BitmapPath//{value}" onerror="this.src='assets21//img//wbb.png'">`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell',]]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							let src = e.target.getAttribute('src');
							if (src){
								await sps.imageDialog(e.target.getAttribute('src'))
							}
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "Item",
				title: `Item`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "Corte",
				title: `Corte`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
				
			},
			{
				name: "Acabamento",
				title: `Acabamento`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "Quantidade",
				title: `Qtde`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { 
					let classCell = ['is-cell']
					let classRow = []
					if (row[8]== row[10]) classRow.push('is-row-complete')
					if (row[8]>row[10] && row[10]>0) classRow.push('is-row-partial')
					if (row[8]<row[10] && row[10]>0) classRow.push('is-row-error')
					return [classRow,classCell]; 
				
				},
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "Etiquetas",
				title: `Etiquetas`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "QuantityConf",
				title: `Qtde Conf`,
				selecMode: `{value}`,
				editMode: `<input type="number" id="ConferidoQTD_{rid}" value="{value}">`, //onchange="sps.table_change_value('{dados_name}',{col},{rid},this,true)
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { if (value > 0) {return sps._formatNumber(value);} return value  },
				listenFunctions:[
					{
						listen:'dblclick'
						,function: async function(dados_name,col,rid,e){
							this.setLineQuantityConf(dados_name,col,rid,e,true)
							e.target.blur();
						}.bind(this)
					},
					{
						listen:'change'
						,function: async function(dados_name,col,rid,e){
							this.setLineQuantityConf(dados_name,col,rid,e,false)
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "PersdIdConf",
				title: `Conf Por`,
				selecMode: `<span id="ConferidoPor_{rid}">{value}</span>`,
				editMode: `<span id="ConferidoPor_{rid}">{value}</span>`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { if (value > 0) {return sps._formatNumber(value);} return value  },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true,
			},
			{
				name: "DataConf",
				title: `Data Conf`,
				selecMode: `<span id="ConferidoData_{rid}">{value}</span>`,
				editMode: `<span id="ConferidoData_{rid}">{value}</span>`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell','remove-label']]; },
				formatFunction: function(value,row,rid) { return value },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true,
			},
			{
				name: "Pedido",
				title: `Pedido`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
			},
			{
				name: "Cliente",
				title: `Cliente`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; },
				listenFunctions:[
					{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort:true
			}
		]
	}
	async setLineQuantityConf(dados_name,col,rid,e,setValue){
		let f = document.getElementById(`ConferidoQTD_${rid}`)
		let dadosFiltered = app.appData[`${dados_name}Filtered`];
		
		if(setValue) {f.value = dadosFiltered[rid][8]};

		let newValue = parseInt(f.value);
		
		if (newValue < 0) { f.value=0; return;}
		dadosFiltered[rid][col] = newValue;


		/* Define outros campos */
		dadosFiltered[rid][11] = document.getElementById('uname').innerHTML;
		dadosFiltered[rid][12] = new Date().toLocaleString();

		document.getElementById(`ConferidoPor_${rid}`).innerHTML = dadosFiltered[rid][11]
		document.getElementById(`ConferidoData_${rid}`).innerHTML = dadosFiltered[rid][12]

		/* Check Style */
		let row = dadosFiltered[rid];
		let rowTR = document.getElementsByName(`row_ordens_${rid}`)[0];
		rowTR.classList = '';

		if (row[8]== row[10]) rowTR.classList.add('is-row-complete')
		if (row[8]>row[10] && row[10]>0){
			rowTR.classList.add('is-row-partial')
		}
		if (row[8]<row[10] && row[10]>0){
			rowTR.classList.add('is-row-error')
		} 
	}
	async appDataInit() {
		this.appData = {mode:'editMode'};
	}
	async gui(){
		let buttonRefresh = '<button class="button is-link nav-submit" style="margin-right:50px;" id="appRefresh"><span class="icon is-medium"><i class="fa fa-retweet" aria-hidden="true"></i></span><span></span>Recarregar</button>';
		let buttonAllOK = '<button class="button is-link nav-submit" style="margin-right:25px;" disabled="" id="appOk"><span class="icon is-medium"><i class="fa fa-list" aria-hidden="true"></i></span><span></span>Todos OK</button>';
		let buttonSalvar = '<button class="button is-link nav-submit" style="margin-right:25px;background-color:darkred" disabled="" id="appSalvar"><span class="icon is-medium"><i class="fa fa-calculator" aria-hidden="true"></i></span><span>Salvar</span></button>'
		let buttonLiberar = '<button class="button is-link nav-submit" style="margin-right:25px;background-color:darkgreen" disabled="" id="appAprovar"><span class="icon is-medium"><i class="fa fa-check" aria-hidden="true"></i></span><span>Aprovar</span></button>';
		
		document.getElementById('appSave').parentNode.innerHTML=buttonRefresh+buttonAllOK+buttonSalvar+buttonLiberar;//+buttonSave //buttonInfo
		
		let html = "";
			html+= `<div id="main"></div>`
			+`<div id="pdfViewer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 1000;">
				<button id="closePdfViewer" style="position: absolute; top: 10px; right: 120px; background: red; color: white; border: none; padding: 10px 20px; cursor: pointer;">Fechar</button>
				<div id="pdfContent" style="width: 100%; height: 100%;"></div>
			</div>`

		document.getElementById("app-container").innerHTML = html;

		await this.uxInit();
	}
	async uxInit(){
		ux.listen('click','appRefresh',async (e)=>{await this.getCargas()})
		ux.listen('click','appOk',async (e)=>{await this.msgAllOk()})
		ux.listen('click','appSalvar',async (e)=>{await this.msgSave()})
		ux.listen('click','appAprovar',async (e)=>{await this.msgConferido()})
	}
	async msgAllOk(){
		ux.dialog(_t("Atenção")
			, "Alterar todos as linhas selecinadas para [Todos OK]?"
			, {
				buttons: [
					{ id: 'ok', title: _t("Ok"), type: "is-success" }
					, { id: 'cancel', title: _t("Cancelar"), type: "is-danger" }
				]
			}
			, async function (b) {
				if (b == 'ok') {
					await this.setAllOk();
				}
			}.bind(this)
		);
	}
	async setAllOk(){
		let selecionados = this.appData.eventosToOk;
		let selecionadosJSON =[]
		for(let i=0;i<selecionados.length;i++){
			let linha = selecionados[i];
				
			let dadosLinha = {
				id:linha[1]
				,id_linha:linha[3]
				,conferido:linha[8]
				,quantidade:linha[8]
				,motivo:linha[12]||''
				,persid:appInfo.uid
				,loadingDate:linha[17]
			}
			selecionadosJSON.push(dadosLinha)
		}

		let dados = {
			get:'postAux',
			acao:'postLinha',
			dados:JSON.stringify(selecionadosJSON)
		}

		let func = async (params)=>{
			this.getCargas();
		}
		let funcError = async (params)=>{
			ux.dialog('Erro',params
				,{ buttons: [{ id: 'ok', title: _t("OK"), type: "is-error" }]}
			)
		}
		await sps.setAux(dados,func,{},funcError);
	}
	async msgSave(){
		ux.dialog(_t("Atenção")
			, "Salvar todas as linhas selecionadas?"
			, {
				buttons: [
					{ id: 'ok', title: _t("Ok"), type: "is-success" }
					, { id: 'cancel', title: _t("Cancelar"), type: "is-danger" }
				]
			}
			, async function (b) {
				if (b == 'ok') {
					await this.setSave();
				}
			}.bind(this)
		);
	}
	async setSave(){
		let selecionados = this.appData.eventosToSave;
		let selecionadosJSON =[]
		for(let i=0;i<selecionados.length;i++){
			let linha = selecionados[i];
				
			let dadosLinha = {
				id:linha[1]
				,id_linha:linha[3]
				,conferido:linha[10]
				,quantidade:linha[8]
				,motivo:linha[12]||''
				,persid:appInfo.uid
				,loadingDate:linha[17]
			}
			selecionadosJSON.push(dadosLinha)
		}

		let dados = {
			get:'postAux',
			acao:'postLinha',
			dados:JSON.stringify(selecionadosJSON)
		}

		await sps.setAux(dados,this.appControl.funcSuccess,{},this.appControl.funcError);
	}
	async msgEventosDesatualizados(){
		await sps.table_Create({
				colunas:this.appControl.colunasMsgEventosDesatualizados,
				container:'eventosDesatualizados',
				classType:'is-sps-table-v1',
				mode:'selecMode',
				dados_name:'EventosDesatualizados',
				clear: true,
				arrayFilter:false
			})
	}
	async msgConferido(){
		ux.dialog(_t("Atenção")
			, "Marcar como Conferido todas as linhas selecinoadas?"
			, {
				buttons: [
					{ id: 'ok', title: _t("Ok"), type: "is-success" }
					, { id: 'cancel', title: _t("Cancelar"), type: "is-danger" }
				]
			}
			, async function (b) {
				if (b == 'ok') {
					await this.setConferido();
				}
			}.bind(this)
		);
	}
	async setConferido(){
		let selecionados = this.appData.eventosToAprovar;
		let selecionadosJSON =[]
		for(let i=0;i<selecionados.length;i++){
			let linha = selecionados[i];
				
			let dadosLinha = {
				id:linha[1]
				,id_linha:linha[3]
				,persid:appInfo.uid
				,loadingDate:linha[17]
			}
			selecionadosJSON.push(dadosLinha)
		}

		let dados = {
			get:'postAux',
			acao:'saveConferido',
			dados:JSON.stringify(selecionadosJSON)
		}

		await sps.setAux(dados,this.appControl.funcSuccess,{},this.appControl.funcError);
	}
	async getOrdens(){
		this.appDataInit();
		document.getElementById('main').innerHTML='';
		let dados = {
			get:'getAux',
			acao:'getOrdens',
			dados:''
		}
		await sps.getAux(dados,'ordens',this.appData).then((res)=>{
			sps.table_Create({
				colunas:this.appControl.colunasOrdens,
				container:'main',
				classType:'is-sps-table-v1',
				mode:(this.appData.mode||'selecMode'),
				dados_name:'ordens',
				clear: true,
				arrayFilter:false,
				limitRows:200
			})
		});
	}
	async checkAll(){
		/*this.appData.eventosSelected = this.appData.cargas.filter(row => row[0]==1);
		this.appData.eventosToOk = this.appData.cargas.filter(row => row[0]==1 && row[10] == null);
		this.appData.eventosToSave = this.appData.cargas.filter(row => row[0]==1);
		this.appData.eventosToAprovar = this.appData.cargas.filter(row => row[0]==1 && row[16] ==1 );
		ux.set("appOk",(this.appData.eventosToOk.length > 0)?"enable":"disabled");
		ux.set("appSalvar",(this.appData.eventosToSave.length > 0 )?"enable":"disabled");
		ux.set("appAprovar",(this.appData.eventosToAprovar.length > 0)?"enable":"disabled");*/
	}
	async onClickLine({dados_name, rid,e}){
		if (!e.shiftKey){
			let f = document.getElementsByName(`selec_${dados_name}_${rid}`)[0]
			sps.table_select_onclick(dados_name,rid,f);
		}
	}
}
var app = new customAPP;