class customAPP {
	constructor() {
		this.loadApp();
	}

	async loadApp() {
		await this.appControlInit()
		// await this.appDataInit();
		await sps.getCSS().then(async (res) => {
			await sps.loadDefaultSPS_CSS().then(async (res) => {
					this.appDataInit();
					this.loadPrinters().then((res) => {
						this.gui();
				})
			})
		})
	}

	async appDataInit() {
		//resetar o appdata
		this.appData.ordens = [];
	}

	async appControlInit() {
		this.appControl = {}
		this.appControl.funcSuccess = async (params) => {
			this.getOrdens();//getCargas();
		}
		this.appControl.funcError = async (params) => {
			let html = "";
			if (params.match('EventosDesatualizados')) {
				this.appData.EventosDesatualizados = JSON.parse(params.split('|')[1])
				html += `
				<span style="font-size:1.5rem">Eventos abaixo estão desatualizados, remover seleção para continuar!</span>
				<div id="eventosDesatualizados"/>
				`
			} else {
				html += msg
			}
			ux.dialog('Erro', html
				, { buttons: [{ id: 'ok', title: _t("OK"), type: "is-danger" }] }
			)
			await this.msgEventosDesatualizados();
		}

		this.appControl.colunasViewEtiquetas = [
			{
				name: "Selec",
				title: `<INPUT TYPE = "checkbox" style="height:1rem;" name = "selec_{dados_name}_todos" onchange = "sps.table_select_all('{dados_name}',this)" />`,
				selecMode: `<input type= "checkbox" name = "selec_{dados_name}_{rid}" disabled>`,
				editMode: `<input type= "checkbox" name = "selec_{dados_name}_{rid}" disabled>`,
				inputFilter: `<input type="checkbox" name="filter_{dados_name}_{column}" {checked}/>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return value; }
			},
			{
				name: "BarCode",
				title: `Barcode`,
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
						,function: function(dados_name,col,rid,e){
							this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				]
			},
			{
				name: "Status",
				title: `Status`,
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
						,function: function(dados_name,col,rid,e){
							this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				]
			},
			{
				name: "Quantidade",
				title: `Quantidade`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function(value, row) { return [[], ['is-cell']]; },
				formatFunction: function(value) { return `${value} Peças`; },
				listenFunctions:[
					{
						listen:'click'
						,function: function(dados_name,col,rid,e){
							this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				]
			},
			{
				name: "Detalhes",
				title: `Detalhes`,
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
						,function: function(dados_name,col,rid,e){
							this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				]
			},
		]

		this.appControl.colunasMsgEventosDesatualizados = [
			{
				name: "",
				title: ``,
				selecMode: ``,
				editMode: ``,
				inputFilter: ``,
				filterValue: '',
				inputFooter: '',
				styleFunction: function (value, row) {
					let classRow = [];
					if (value) classRow.push('is-row-selected');
					return [classRow, ['is-cell']];
				},
				formatFunction: function (value) { return value; }
				, stayChecked: false
			},
			{
				name: "Carga",
				title: `Carga`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [],
				sort: true,
			},
			{
				name: "Evento",
				title: `Evento`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [],
				sort: true
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
				styleFunction: function (value, row) {
					let classRow = [];
					if (value) classRow.push('is-row-selected');
					return [classRow, ['is-cell']];
				},
				formatFunction: function (value) { return value; }
				, stayChecked: false
			},
			{
				name: "Tipo",
				title: `Tipo`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: 'Olga',
				filterColumName:'tipo',
				hidden:true,
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					/*{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					},*/{
						listen: 'dblclick'
						, function: async function (dados_name, col, rid, e) {

							let dados = this.appData.cargas
							let colunas = this.appControl.colunasOrdens;
							let container = 'main';
							let classType = 'is-sps-table-v1';
							let mode = this.appData.mode || 'selecMode';

							let cell = e.target;
							let value = cell.innerHTML;
							let name = `filter_${dados_name}_${colunas[col].name}`;
							let input = document.getElementsByName(name)[0];
							input.value = value;

							sps.table_filter({ colunas, dados, container, classType, mode, dados_name, name, i: col, apply: true });
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "DocDate",
				title: `Data`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'data',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Lote",
				title: `Lote`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'lote',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					/*{
						listen:'click'
						,function: async function(dados_name,col,rid,e){
							await this.onClickLine({dados_name,rid,e})
						}.bind(this)
					},*/{
						listen: 'dblclick'
						, function: async function (dados_name, col, rid, e) {

							let dados = this.appData.cargas
							let colunas = this.appControl.colunasOrdens;
							let container = 'main';
							let classType = 'is-sps-table-v1';
							let mode = this.appData.mode || 'selecMode';

							let cell = e.target;
							let value = cell.innerHTML;
							let name = `filter_${dados_name}_${colunas[col].name}`;
							let input = document.getElementsByName(name)[0];
							input.value = value;

							sps.table_filter({ colunas, dados, container, classType, mode, dados_name, name, i: col, apply: true });
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Perfil",
				title: `Perfil`,
				selecMode: `<img width="32" height="32" loading="lazy" src="BitmapPath//{value}" onerror="this.src='assets21//img//wbb.png'">`,
				editMode: `<img width="32" height="32" loading="lazy" src="BitmapPath//{value}" onerror="this.src='assets21//img//wbb.png'">`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'perfil',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell',]]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							let src = e.target.getAttribute('src');
							if (src) {
								await sps.imageDialog(e.target.getAttribute('src'))
							}
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Item",
				title: `Item`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'item',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Corte",
				title: `Corte`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'corte',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Acabamento",
				title: `Acabamento`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'acabamento',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Quantidade",
				title: `Qtde`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'qtde',
				inputFooter: '',
				styleFunction: function (value, row) {
					let classCell = ['is-cell']
					let classRow = []
					if (row[8] == row[10]) classRow.push('is-row-complete')
					if (row[8] > row[10] && row[10] > 0) classRow.push('is-row-partial')
					if (row[8] < row[10] && row[10] > 0) classRow.push('is-row-error')
					return [classRow, classCell];

				},
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Etiquetas",
				title: `Etiquetas`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'etiquetas',
				inputFooter: '',
				styleFunction: function(value, row) { 
					let cellClass = ['is-cell']
					if (row[8] > 0){
						cellClass.push('is-clickable')
					}
					return [[],cellClass]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen:'click'
						,function: function(dados_name,col,rid,e){

							if (e.target.classList.contains('is-clickable')){
								this.getEtiquetas({dados_name,rid,e})
								return;
							}
							this.onClickLine({dados_name,rid,e})
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "QuantityConf",
				title: `Qtde Conf`,
				selecMode: `{value}`,
				editMode: `<input type="number" id="ConferidoQTD_{rid}" value="{value}">`, //onchange="sps.table_change_value('{dados_name}',{col},{rid},this,true)
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'qtdeConf',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { if (value > 0) { return sps._formatNumber(value); } return value },
				listenFunctions: [
					{
						listen: 'dblclick'
						, function: async function (dados_name, col, rid, e) {
							this.setLineQuantityConf(dados_name, col, rid, e, true)
							e.target.blur();
						}.bind(this)
					},
					{
						listen: 'change'
						, function: async function (dados_name, col, rid, e) {
							console.log('CHANGE', { dados_name, col, rid, e })
							this.setLineQuantityConf(dados_name, col, rid, e, false)
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "PersdIdConf",
				title: `Conf Por`,
				selecMode: `<span id="ConferidoPor_{rid}">{value}</span>`,
				editMode: `<span id="ConferidoPor_{rid}">{value}</span>`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'confPor',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { if (value > 0) { return sps._formatNumber(value); } return value },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true,
			},
			{
				hidden: true,
				name: "DataConf",
				title: `Data Conf`,
				selecMode: `<span id="ConferidoData_{rid}">{value}</span>`,
				editMode: `<span id="ConferidoData_{rid}">{value}</span>`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell', 'remove-label']]; },
				formatFunction: function (value, row, rid) { return value },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true,
			},
			{
				name: "Pedido",
				title: `Pedido`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'pedido',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true
			},
			{
				name: "Cliente",
				title: `Cliente`,
				selecMode: `{value}`,
				editMode: `{value}`,
				inputFilter: `<div class="control has-icons-right"><INPUT TYPE="text" name="filter_{dados_name}_{column}" value="{filter}"/><span class="icon is-small-scale07 is-right"><i class="fa fa-filter"></i></span></div>`,
				filterValue: '',
				filterColumName:'cliente',
				inputFooter: '',
				styleFunction: function (value, row) { return [[], ['is-cell']]; },
				formatFunction: function (value) { return value; },
				listenFunctions: [
					{
						listen: 'click'
						, function: async function (dados_name, col, rid, e) {
							await this.onClickLine({ dados_name, rid, e })
						}.bind(this)
					}
				],
				sort: true
			}
		]
	}

	async setLineQuantityConf(dados_name, col, rid, e, setValue) {
		console.log('CALL setLineQuantityConf', { dados_name, col, rid, e, setValue })
		let f = document.getElementById(`ConferidoQTD_${rid}`)
		let dadosFiltered = app.appData[`${dados_name}Filtered`];

		if (setValue) { f.value = dadosFiltered[rid][8] };

		let newValue = parseInt(f.value);

		if (newValue < 0) { f.value = 0; return; }
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

		if (row[8] == row[10]) rowTR.classList.add('is-row-complete')
		if (row[8] > row[10] && row[10] > 0) {
			rowTR.classList.add('is-row-partial')
		}
		if (row[8] < row[10] && row[10] > 0) {
			rowTR.classList.add('is-row-error')
		}
	}

	async appDataInit() {
		this.appData = {
			mode: 'editMode',
			ordens: []
		};
	}

	async gui() {

		 let regra = `
		 		<div class="toggle" style="padding-right: 10px; font-weight:bold">
				<span style="padding-right: 10px;">Olga</span>
					<input type="checkbox" id="olga_terceiro">
					<label for="olga_terceiro"></label>	
				<span>Terceiro</span>
				</div>`
				

		let buttonRefresh = '<button class="button is-link nav-submit" style="margin-right:50px;" id="appRefresh"><span class="icon is-medium"><i class="fa fa-retweet" aria-hidden="true"></i></span><span></span>Recarregar</button>';
		let buttonAllOK = '<button class="button is-link nav-submit" style="margin-right:25px;" disabled="" id="appOk"><span class="icon is-medium"><i class="fa fa-list" aria-hidden="true"></i></span><span></span>Todos OK</button>';
		let buttonSalvar = '<button class="button is-link nav-submit" style="margin-right:25px;background-color:darkgoldenrod" disabled="" id="appSalvar"><span class="icon is-medium"><i class="fa fa-calculator" aria-hidden="true"></i></span><span>Salvar</span></button>'
		let buttonLiberar = '<button class="button is-link nav-submit" style="margin-right:25px;background-color:darkgreen" disabled="" id="appAprovar"><span class="icon is-medium"><i class="fa fa-check" aria-hidden="true"></i></span><span>Aprovar</span></button>';
		let buttonReprovar = '<button class="button is-link nav-submit" style="margin-right:25px;background-color:darkred" disabled="" id="appReprovar"><span class="icon is-medium"><i class="fa fa-eraser" aria-hidden="true"></i></span><span></span>Reprovar</button>';

		document.getElementById('appSave').parentNode.innerHTML = regra + buttonRefresh + buttonAllOK + buttonSalvar + buttonLiberar + buttonReprovar;//+buttonSave //buttonInfo

		let html = "";
		html += `<div id="main"></div>`
			+ `<div id="pdfViewer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 1000;">
				<button id="closePdfViewer" style="position: absolute; top: 10px; right: 120px; background: red; color: white; border: none; padding: 10px 20px; cursor: pointer;">Fechar</button>
				<div id="pdfContent" style="width: 100%; height: 100%;"></div>
			</div>`

		document.getElementById("app-container").innerHTML = html;

		//console.log('Recarregando Ordens...')
		/*sps.table_Create({
			colunas: this.appControl.colunasOrdens,
			container: 'main',
			classType: 'is-sps-table-v1',
			mode: 'selecMode',
			dados_name: 'ordens',
			clear: true,
			arrayFilter: false,
			limitRows: 200
		})*/
		await this.viewTable();
		await this.uxInit();

	}

	async uxInit() {
		ux.listen('click', 'appRefresh', async (e) => { await this.getOrdens()/*getCargas()*/ });
		ux.listen('click', 'appOk', async (e) => { await this.msgAllOk() });
		ux.listen('click', 'appSalvar', async (e) => { await this.msgSave() });
		ux.listen('click', 'appAprovar', async (e) => { await this.msgConferido() });
		ux.listen('click', 'appReprovar', async (e) => { await this.msgReprovar() });
		
		ux.listen('change', 'olga_terceiro', async(e) =>{
			
			if (e.target.checked){
				this.appControl.colunasOrdens[1].filterValue = 'Terceiro'
			}else{
				this.appControl.colunasOrdens[1].filterValue = 'Olga'
			}

			let obj = JSON.stringify({
				tipo: this.appControl.colunasOrdens[1].filterValue,
			})
			await this.getOrdens({ filters: obj });
		})
	}

	/** Botões de ação Header */
	async msgAllOk() {
		ux.dialog(_t("Atenção")
			, "Alterar todos as linhas selecionadas para [Todos OK]?"
			, {
				buttons: [
					{ id: 'ok', title: _t("Ok"), type: "is-success" }
					//,{ id: 'ok_p', title: _t("Ok e Aprovar"), type: "is-warning" }
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

	async setAllOk() {
		let selecionados = this.appData.eventosToOk;
		let selecionadosJSON = []
		for (let i = 0; i < selecionados.length; i++) {
			let linha = selecionados[i];

			let dadosLinha = {
				qtde: linha[8],
				buchnrId: linha[17],
				orig: linha[18],
				persId: appInfo.uid
			};
			selecionadosJSON.push(dadosLinha)
		}

		let dados = {
			get: 'postAux',
			acao: 'todosOK',
			dados: JSON.stringify({linhas: selecionadosJSON})
		}

		let func = async (params) => {
			this.getOrdens(); //getCargas();
		}
		let funcError = async (params) => {
			ux.dialog('Erro', params
				, { buttons: [{ id: 'ok', title: _t("OK"), type: "is-error" }] }
			)
		}
		await sps.setAux(dados, func, {}, funcError);
	}

	async msgSave() {
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

	/** Mensagens  */
	async msgEventosDesatualizados() {
		await sps.table_Create({
			colunas: this.appControl.colunasMsgEventosDesatualizados,
			container: 'eventosDesatualizados',
			classType: 'is-sps-table-v1',
			mode: 'selecMode',
			dados_name: 'EventosDesatualizados',
			clear: true,
			arrayFilter: false
		})
	}

	async msgConferido() {
		ux.dialog(_t("Atenção")
			, "Marcar como Conferido todas as linhas selecionadas?"
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

	async msgReprovar() {
		ux.dialog(_t("Atenção")
			, "Reprovar todas as linhas selecionadas?"
			, {
				buttons: [
					{ id: 'ok', title: _t("Ok"), type: "is-success" }
					, { id: 'cancel', title: _t("Cancelar"), type: "is-danger" }
				]
			}
			, async function (b) {
				if (b == 'ok') {
					await this.setReprovado();
				}
			}.bind(this)
		);
	}

	/** REQUESTS */
	async setSave() {
		let selecionados = this.appData.eventosToSave;
		let selecionadosJSON = []
		for (let i = 0; i < selecionados.length; i++) {
			let linha = selecionados[i];

			let dadosLinha = {
				qtde: linha[10],
				buchnrId: linha[17],
				orig: linha[18],
				persId: appInfo.uid
			};

			selecionadosJSON.push(dadosLinha)
		}

		let dados = {
			get: 'postAux',
			acao: 'salvaPost',//'postLinha',
			dados: JSON.stringify({linhas: selecionadosJSON})
		}

		await sps.setAux(dados, this.appControl.funcSuccess, {}, this.appControl.funcError);
	}


	async setReprovado() {
		let selecionados = this.appData.eventosToReprovar;
		let selecionadosJSON = [];
		for (let i = 0; i < selecionados.length; i++) {
			let linha = selecionados[i];
			// let dadosLinha = {
			// 	id: linha[1]
			// 	, id_linha: linha[3]
			// 	, persid: appInfo.uid
			// 	, loadingDate: linha[17]
			// }

			let dadosLinha = {
				buchnrId: linha[17],
				orig: linha[18],
				persId: appInfo.uid
			};

			selecionadosJSON.push(dadosLinha);
		}

		let dados = {
			get: 'postAux',
			acao: 'saveReprovado',//'saveConferido',
			dados: JSON.stringify({linhas: selecionadosJSON})
		}

		await sps.setAux(dados, this.appControl.funcSuccess, {}, this.appControl.funcError);
	}


	async setConferido() {
		let selecionados = this.appData.eventosToAprovar;
		let selecionadosJSON = [];
		for (let i = 0; i < selecionados.length; i++) {
			let linha = selecionados[i];
			// let dadosLinha = {
			// 	id: linha[1]
			// 	, id_linha: linha[3]
			// 	, persid: appInfo.uid
			// 	, loadingDate: linha[17]
			// }

			let dadosLinha = {
				buchnrId: linha[17],
				orig: linha[18]
			};

			selecionadosJSON.push(dadosLinha);
		}

		let dados = {
			get: 'postAux',
			acao: 'conferirPost',//'saveConferido',
			dados: JSON.stringify({linhas: selecionadosJSON})
		}

		await sps.setAux(dados, this.appControl.funcSuccess, {}, this.appControl.funcError);
	}

	async clearDados_name(dados_name){
		this.appData[dados_name] = null;
		this.appData[`${dados_name}Filtered`] = null;
		this.appData[`${dados_name}Selected`] = null;
	}

	async getOrdens(){
		let dados_name = 'ordens';
		let container = 'main';

		this.clearDados_name(dados_name)

		let params = {
		}

		this.appControl.colunasOrdens.forEach(col=>{
			if(col.hasOwnProperty('filterColumName')){
				params[col.filterColumName]=(col.filterValue||'').toString()/*.toUpperCase()*/;
			}
		})

		let data = {
			get:'getAux',
			acao:'getOrdens',
			dados:JSON.stringify(params),
			dg_limit:9999,
			dg_page:1
		}

		// Força uma espera para que os requests sejam concluídos -> Muitos dados estão sendo carregados
		await new Promise(requestAnimationFrame);
		// document.getElementById(container).innerHTML = '<b>Buscando ordens...</b>';
		await sps.getAux(data, 'ordens',this.appData).then(async (res) => {
			await this.viewTable(dados_name,container)
		})
	}

	/*
	async getOrdens(params) {
		this.appDataInit();

		let filtro = '';
		if (params) {
			filtro = params.filters;
		}

		document.getElementById('main').innerHTML = '';

		let dados = {
			get: 'getAux',
			acao: 'getOrdens',
			dados: filtro
		}

		await sps.getAux(dados, 'ordens', this.appData).then(async (res) => {
			await this.viewTable();
			// sps.table_Create({
			// 	colunas: this.appControl.colunasOrdens,
			// 	container: 'main',
			// 	classType: 'is-sps-table-v1',
			// 	mode: (this.appData.mode || 'selecMode'),
			// 	dados_name: 'ordens',
			// 	clear: true,
			// 	arrayFilter: false,
			// 	limitRows: 200
			// })
		});
	}
	*/

	async getEtiquetas({dados_name,rid,e},lastEtiqueta=false){

		let row = [];

		if (lastEtiqueta) {
			row = app.appData.lastEtiqueta
		}else{
			row = app.appData[`${dados_name}Filtered`][rid]
			app.appData.lastEtiqueta = row
		}

		let dados = {
			get:'getAux',
			acao:'getEtiquetas',
			dados: JSON.stringify({
				belnr_id:row[20],
				belpos_id:row[21],
				lote:row[3]
			}),
			dg_limit:9999,
			dg_page:1		
		}

		await sps.getAux(dados,'viewEtiquetas',this.appData).then((res)=>{
			this.viewEtiquetas(row)
		});

	}

	viewEtiquetas(row){
		let html = 
		ui.columns([
			{content:''},
			{content:ui.select("","cImpressora","",app.appControl.impressoras,{type:"is-link", licon:"fa-print"}), size:"1/5"},
			{content:ui.button('bReimprimirEtiqueta','Reimprimir',{licon:'print',type:'is-sps-button-medium'})}
			/*{content:ui.button('bCancelEtiqueta','Cancelar',{licon:'trash',type:'is-sps-button-medium is-interromper'})},*/
		])
		+'<div id="etiquetasOp"></div>'
		ux.dialog(`Etiquetas ordem: ${row[16]}/${row[17]}`, html, {id:'etiquetasDialog'});

		sps.table_Create({
			colunas:this.appControl.colunasViewEtiquetas,
			container:'etiquetasOp',
			classType:'is-sps-table-v1',
			mode:'selecMode',
			dados_name:'viewEtiquetas',
			clear:true
		})
		
		ux.listen('click','bReimprimirEtiqueta',()=>{
			this.eventoEtiqueta('reimprimirEtiquetas');
		})

		ux.listen('click','bCancelEtiqueta',()=>{
			this.eventoEtiqueta('cancelarEtiquetas');
		})
	}
	
	eventoEtiqueta(acao){
		let etiquetas = this.appData.viewEtiquetas.filter(row=> row[0]===1);

		if (etiquetas.length == 0){
			alert('Nenhuma Etiqueta Selecionada!')
			return
		}
		
		let impressora = ux.getElement('cImpressora').value

		let etiquetasJson = etiquetas.map(row=>{ return {uid:row[5],id:row[6],printer:impressora} })

		let dados = {
			get:'postAux',
			acao:acao,
			dados:JSON.stringify(etiquetasJson)
		}

		let func = () =>{
			// document.getElementById("ui_mbox").remove();
			ux.dialog('Sucesso','Alteração Realizada com Sucesso!',{buttons:[
															{ id: 'ok', title: _t("OK"), type: "is-success" }
														]}
					,async (b) => {
						if (b=='ok'){
							await this.getEtiquetas({},true);
							if (acao == 'cancelarEtiquetas'){
								document.querySelector('#etiquetasDialog .modal-card-head button.delete')?.click();
								await this.getOrdens({}); 
							}
						}
					})
		}
		sps.setAux(dados,func);
	}

	async loadPrinters(){

		let dados = {
			get:'getAux'
			,acao:"getImpressoras"
			,dados:''
		}
		sps.getAux(dados,'impressoras',this.appControl);
	}

	async checkAll() {
		if (this.appData.ordens.length === 0) { return; }
		
		//this.appData.eventosSelected = this.appData.ordens.filter(row => row[0]==1);
		this.appData.eventosToOk = this.appData.ordens.filter(row => row[0] == 1 && !row[10]);
		this.appData.eventosToSave = this.appData.ordens.filter(row => row[0] == 1);
		this.appData.eventosToAprovar = this.appData.ordens.filter(row => row[0] == 1 && row[19] == 1);
		this.appData.eventosToReprovar = this.appData.ordens.filter(row => row[0] == 1);
		
		// this.appData.eventosSelected = this.appData.cargas.filter(row => row[0]==1);
		// this.appData.eventosToOk = this.appData.cargas.filter(row => row[0]==1 && row[10] == null);
		// this.appData.eventosToSave = this.appData.cargas.filter(row => row[0]==1);
		// this.appData.eventosToAprovar = this.appData.cargas.filter(row => row[0]==1 && row[16] ==1 );
		ux.set("appOk", (this.appData.eventosToOk.length > 0) ? "enable" : "disabled"); //  ? "enabled" : "disabled" -- Não sei se esse botão é necessário nesse App
		ux.set("appSalvar", (this.appData.eventosToSave.length > 0) ? "enable" : "disabled");
		ux.set("appAprovar", (this.appData.eventosToAprovar.length > 0) ? "enable" : "disabled");
		ux.set("appReprovar", (this.appData.eventosToReprovar.length > 0) ? "enable" : "disabled");
	}

	async onClickLine({ dados_name, rid, e }) {
		if (!e.shiftKey) {
			let f = document.getElementsByName(`selec_${dados_name}_${rid}`)[0]
			sps.table_select_onclick(dados_name, rid, f);
		}
	}

	async viewTable(dados_name,container){
		// Cria uma nova tabela com os dados da requisição e os filtros aplicados
		await sps.table_Create({
			colunas: this.appControl.colunasOrdens,
			container: 'main',
			classType: 'is-sps-table-v1',
			mode: (this.appData.mode || 'selecMode'),
			dados_name: 'ordens',
			clear: true,
			arrayFilter: false,
			limitRows: 200,
			databaseFilterFunction:(e)=>{this.getOrdens()}
		})
	}

	/**
	 * Recria a tabela sem os listeners originais para modificar a tabela na hora de buscar com os filtros
	
	async viewTable(dados_name, container) {
		// this.appData.view = 'ordens';
		let oldReferences = [];
		let table = document.querySelector('#main table');

		// Guarda as referências da tabela antiga antes de removê-la
		if (table) {
			let inputs = table.querySelectorAll('.is-sps-table-v1-inputline td input')
			oldReferences = Array.from(inputs).map(x => x.value);
			table.remove();
		}

		// Cria uma nova tabela com os dados da requisição e os filtros aplicados
		// await sps.table_Create({
		// 	colunas:this.appData.colunasOrdens,
		// 	container:container,
		// 	classType:'is-sps-table-v1',
		// 	mode:this.appData.mode,
		// 	dados_name:dados_name,
		// 	clear: true,
		// 	arrayFilter:false
		// });

		await sps.table_Create({
			colunas: this.appControl.colunasOrdens,
			container: 'main',
			classType: 'is-sps-table-v1',
			mode: (this.appData.mode || 'selecMode'),
			dados_name: 'ordens',
			clear: true,
			arrayFilter: false,
			limitRows: 200
		})

		let newTable = document.querySelector('#main table');

		// Clona a tabela para não usar os EventListeners originais
		let clonedTable = newTable.cloneNode(true);
		document.querySelector('#main').appendChild(clonedTable);

		// Remove a referência recem criada
		newTable.remove();

		// Salvando a referência do filtro anterior e aplicando filtro de request nos filtros
		let newInputs = clonedTable.querySelectorAll('.is-sps-table-v1-inputline td input');

		// Requisição com base nos filtros aplicados
		const inputHandler = async (e) => {
			let values = [...newInputs].filter(x => x.type !== 'checkbox').map(x => x.value);

			values.forEach((input, col) => {
				this.appControl.colunasOrdens[col + 1].filterValue = input;
				// this.appData.colunasOrdens[col + 1].filterValue = input;
			})

			console.log("Filtros:", values);
			let obj = JSON.stringify({
				tipo: values[0],
				data: values[1],
				lote: values[2].toUpperCase(),
				perfil: values[3],
				item: values[4].toUpperCase(),
				corte: values[5],
				acabamento: values[6].toUpperCase(),
				qtde: values[7],
				etiquetas: values[8],
				qtdeConf: values[9],
				confPor: values[10],
				// dataConf: values[11],
				pedido: values[12],
				cliente: values[13].toUpperCase()
			})

			this.appControl.getOrdens_lastObjFilter = obj
			await this.getOrdens({ filters: obj });
		}

		// Aplicação dos event listeners originais do componente table_create
		newInputs.forEach((input, i) => {
			if (oldReferences[i]) { input.value = oldReferences[i] }

			input.addEventListener('keyup', async (e) => {
				if (e.key == 'Enter') {
					await inputHandler(e);
				}
			});

			input.addEventListener('dblclick', async (e) => {
				input.value = '';
				await inputHandler(e);
			});
		});

		// Adicionando Listens originais das colunas
		let trs = clonedTable.querySelectorAll('tbody tr');
		trs.forEach((tr, j) => {
			tr.querySelectorAll(`td`).forEach((td, k) => {

				if (this.appControl.colunasOrdens[k].listenFunctions) {
					this.appControl.colunasOrdens[k].listenFunctions.forEach(l => {
						td.addEventListener(l.listen, (e) => {
							console.log('LISTEN', { dados_name, col: k, rid: j, e })
							l.function('ordens', k, j, e)
						});
					})
				}
			})
		});
	}
	*/

}
var app = new customAPP;