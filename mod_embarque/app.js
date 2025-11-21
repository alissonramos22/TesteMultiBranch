class customAPP {
        constructor() {
			this.cache_resource = null 
            this.scrapAdvanceEditor = new scrapReasons();
		
			this.gui();
			this.appData_clear();
			this.listarPedidos();
        }
		
		appData_clear() {
			// We clear all appData we stored previously
			this.appData = { grapa:'', docnum:0 , Liberar:[]};
		}
		
        gui() {
			// Using the UI.js library we create an input field and the container for a data grid
			let tabGrapas = 			
				ui.dgrid("dgGrapas"); 	
			let tabDetalhes=
				ui.input(_t("Pedidos Filtro"), "dgPedidos_Filter", "", { licon: "fa-search", rbutton: "fa-search", autofocus: true }) 
				+ui.columns([
						{content: ui.button('bRecarregar',"",{licon:"retweet", type:"is-flex"}),size:"2/4"},
						{content: ui.button('bLiberar',"",{licon:"truck", type:"is-flex"}),size:"2/4"},
						{content: ui.checkbox( "Somente Pendentes", "chbPendentes", true, {id:"chbPendentes"} ),size:"1/4" }
 					])
				+ui.dgrid("dgPedidos");	
			
			// Now we create the "Tab" container and set for each tab the layout defined in the previous lines
			var html = ui.tabs( "MApp", 
								[	
									{icon:ui.fa("cube"), title:_t("Pedidos"), active:true, content:tabDetalhes, id:"tabDetalhes", autofocus: true} ,
									{icon:ui.fa("box"), title:_t("Grapas"), active:true, content:tabGrapas, id:"tabGrapas",  autofocus: true }
								]
						);
						
			// Finally we render the app into the app container
			document.getElementById("app-container").innerHTML = html;

			// Start by initializing all tabs controls
			ux.tabs('MApp', 'init');
			
			 //-- TEMPORARIO
			ux.listen('changing', 'MApp',  function(e) {
											
											switch(e.detail.targetTab) {
												case "tabGrapas":	if(!this.appData.DocNum) { e.preventDefault()}; break;
											}										
									}.bind(this)
					);
			ux.listen('change', 'MApp',  function(e) {
											
											switch(e.detail.targetTab) {
												case "tabDetalhes":	this.appData_clear(); break;
											}										
									}.bind(this)
					);						
			ux.listen('click',"dgPedidos_Filter-rbutton",function (e) { this.listarPedidos(document.getElementsByName("dgPedidos_Filter")[0].value); }.bind(this));
			ux.listen('keyup',"dgPedidos_Filter",function (e) {if(e.keyCode === 13) { this.listarPedidos(document.getElementsByName("dgPedidos_Filter")[0].value);} }.bind(this));
			ux.listen('click', "bRecarregar", function (e) { this.listarPedidos(); }.bind(this));
			ux.listen('click', "bLiberar", function (e) { this.liberarPedidos(); }.bind(this));
			ux.listen('change', "chbPendentes", function (e) { this.listarPedidos(); }.bind(this));
		}
		
		listarGrapas() {			
			// Initialize the datagrid
			ux.tabs("MApp", 'active', 'tabGrapas');
			ux.dgrid('dgGrapas', {limit:30
									,fields:[ 
										{title:_t("Grapa")}
										,{title:_t(""), width:"50"}
										,{title:_t("Detalhes"), width:"500"}
										,{title:_t("Quantidade")}
										,{title:_t("Peso")}
										,{title:_t("Impresso")}
										,{title:_t("Etiqueta"),width:"250"}
										]
									,url:'?program_id='+appInfo.gid+'&page='+appInfo.appID+'&get=dgGrapas'+'&docnum='+this.appData.DocNum
									,ondraw_row:function(tbody, rid, dr){
										let row, cell, i;
										row = tbody.insertRow(-1);
										row.setAttribute('data-rid',rid);

										//console.log(dr);
										i=0;
										
										//Grapa
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[0];

										//Desenho
										cell = row.insertCell(i++); 
										cell.innerHTML = app.desenho(dr[1]);
										
										//Detalhes
										cell = row.insertCell(i++); 
										cell.innerHTML =app.detalhe(dr[2]);
										
										//Quantidade
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[3];
										
										//Peso
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[4];
										
										//Impresso
										cell = row.insertCell(i++); 
										cell.innerHTML = '<span id="Impresso_'+rid+'">'+dr[5]+'</span>';
										
										
										//Etiqueta
										cell = row.insertCell(i++); 
										cell.innerHTML = app.etiqueta(rid,dr);
										
									}
										
										
								}
							);
		
		}
		etiqueta(rid,dr) {
			//console.log(rid,dr);		
			let html = 
				'<table>'
				+'<tr><td><input type="number" id="bQtdeEtiqueta_'+rid+'" style="text-alig:center" value="" class="input" onChange="app.qtdeEtiqueta('+rid+','+dr[3]+',value,this)"></td>'
				+'<td style="height:10px; width: 20px; text-align: center;">/</td>'
				+'<td><input type="number" id="bQtdePorEtiqueta_'+rid+'" style="text-alig:center" value="" class="input" onChange="app.qtdePorEtiqueta('+rid+','+dr[3]+',value,this)"></td>'	
				+'<td style="height:10px; width: 50px; text-align: center;"><span id="restoQuantidade_'+rid+'">0</span></td>'
				+'</tr></table>'
				+'<a class="button is-flex" id="bEtiqueta_'+rid+'" onClick="app.imprimirGrapa('+dr[0]+','+rid+','+dr[6]+','+dr[7]+',this)"><span class="icon"><i class="fas fa-barcode"></i></span><span></span></a>'
			//ux.listen('click',"bEtiqueta_"+dr[0],function(e){ alert('Imprimiu grapa '+dr[0]); }.bind(this));
			return html;
		}
		
		qtdeEtiqueta(rid,qtde,value,f){
			
			let quantity = Math.floor(qtde/value);
			let resto = qtde-(Math.floor(qtde/value)*value);
			let g = ux.getElement("bQtdePorEtiqueta_"+rid);
			let h = ux.getElement("restoQuantidade_"+rid);
			
			if (resto > 0) {
				g.value = quantity
				h.innerHTML = resto
				
				this.qtdePorEtiqueta(rid,qtde,quantity,f)
			}else{
				g.value = quantity
				h.innerHTML = 0
			}
		}
		qtdePorEtiqueta(rid,qtde,value,f){
			let quantity = Math.floor(qtde/value);
			let resto = qtde-(Math.floor(qtde/value)*value);
			let g = ux.getElement("bQtdeEtiqueta_"+rid);
			let h = ux.getElement("restoQuantidade_"+rid);
			
			if (resto > 0) {
				g.value = quantity
				h.innerHTML = resto
			}else{
				g.value = quantity
				h.innerHTML = 0
			}
		}
		
		
		verPedido(d){
			this.setDados(d);
			ux.tabs("MApp", 'active', 'tabGrapas');
		}
		
		setDados(d){
			this.appData_clear();
			this.appData.DocNum=d;
			this.listarGrapas();
		}
		
		listarPedidos( filtro = "" ) {
			ux.tabs("MApp", 'active', 'tabDetalhes');
			ux.getElement('bLiberar').style.color="#00ff00";
			
			let pendentes = (ux.getElement('chbPendentes').checked) ? 'Sim' : 'Nao';
			
			// Initialize the datagrid
			ux.dgrid('dgPedidos', {timeout:1800
									,limit:50
									,fields:[ 
										{title:"Selecionar"}
										,{title:_t("Pedido")}
										,{title:_t("Linha")}
										,{title:_t("Cliente")}
										,{title:_t("Item")}
										,{title:_t("Data")}
										,{title:_t("Solicitado")}
										,{title:_t("Programado")}
										,{title:_t("Forno")}
										,{title:_t("Embalagem")}
										,{title:_t("Liberado")}
										,{title:_t("%")}
										,{title:_t("Peso")}
										,{title:_t("Grapas")}
										,{title:_t("Emb.")}
										]
									,url:'?program_id='+appInfo.gid+'&page='+appInfo.appID+'&get=dgPedidos&filter='+filtro+'&pendentes='+pendentes 
									//,onclick_row:function(d,rid) { app.verPedido(d); }
									,ondraw_row:function(tbody, rid, dr){
										let row, cell, i;
										row = tbody.insertRow(-1);
										row.setAttribute('data-rid',rid);

										//console.log(dr);
										i=0;
										
										//selecionar
										cell = row.insertCell(i++); 
										cell.innerHTML = '<input type="checkbox" name="S_'+rid+'_ok" onchange="app.selecionar('+rid+',this)">';

										//Pedido
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[1];
										
										//Linha
										cell = row.insertCell(i++); 
										cell.innerHTML =dr[2];
										
										//Cliente
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[3];
										
										//Item
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[4];
										
										//Data
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[5];
										
										//Solicitado
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[6];
										
										//Programado
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[7];
										
										//Forno
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[8];
										
										//Embalagem
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[9];
										
										//Liberado
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[10];
										
										//%
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[11];
										
										//Peso
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[12];
										
										//Grapas
										cell = row.insertCell(i++); 
										cell.innerHTML = app.detalheGrapa(dr[13]);
										cell.setAttribute('onClick',"app.verPedido('"+dr[1]+"')");
										
										//Grapas
										cell = row.insertCell(i++); 
										cell.innerHTML = dr[14]||'' ? dr[14] : 'Não';
									}
								}
							);
		}
		
		selecionar(rid, f){			
			ux.dgrid('dgPedidos').rows.value[rid][0]=(f.checked)?1:0;
		}
		
		grapaLinha(rid,value,f){
			console.log(rid,value,f);
			
			if (value === "" ){
				ux.dgrid('dgPedidos').rows.value[rid][14]="";	
			}else{	
				let url = '?program_id='+appInfo.gid+'&page='+appInfo.appID+'&get=validaGrapa'+'&grapa='+value
					;
				ux.aget(url,
						function(err, result) { 
								if ( result.hasOwnProperty('ret_code') ) {
									console.log("JDG :: Busca Grapa("+value+")", result);
									if ( result.ret_code < 0) {
										ux.dgrid('dgPedidos').rows.value[rid][14]=parseFloat(value);
									} else{
										alert("Grapa em uso!");
										ux.dgrid('dgPedidos').rows.value[rid][14]="";
										document.getElementById('hGrapa_'+rid).value="";
										document.getElementById('hGrapa_'+rid).focus();
									}
									
								}
						}.bind(this)
					);	
			}
		}
		
		
		alterouRealizado(rid,value,f){
			ux.dgrid('dgPedidos').rows.value[rid][11]=parseFloat(value);

		}
			

		liberarPedidos() {
			
			let dados = ux.dgrid('dgPedidos').rows.value;
			this.appData.Liberar = [];
			dados.forEach((linha, id) => {
				
				if (linha[0] === 1) {
					let a = {id, status:false};
					this.appData.Liberar.push(a);
				}
			});
			
			dados.forEach((linha, id ) => {
				if (linha[0] === 1) {
					//console.log(linha, id)
					let data = {
							get:'liberarPedido',
							docentry:linha[15],
							linenum:linha[16]
							
						};	
					this.startLiberar(data, id);
				}				
			});
		}
				
		startLiberar(data,id){
			ux.apost( '?program_id='+appInfo.gid+'&page='+appInfo.appID
					, data
					, function(err, result) {
						if ( !ux.aError(result,true) )  {
							if (result.ret_code<0) {
								app.appData.Liberar[app.appData.Liberar.findIndex(x => x.id === id)].status = true
								app.confirmLiberar();
							} else {
								console.log(result.ret_code+' erro');
							}
						}
					}
					,{timeout:180000}
				);	
			
		}
		
		confirmLiberar(){
			let confirmar = this.appData.Liberar;
			let pendentes = confirmar.filter( x => !x.status );
			
			if (pendentes.length === 0){
				app.appData_clear();
				app.listarPedidos(document.getElementsByName("dgPedidos_Filter")[0].value);	
				console.log('reiniciado');
			}
		}
		
		
		imprimirGrapa(grapa, rid,docentry,linenum,g){
			let f = ux.getElement("Impresso_"+rid);
			f.innerHTML = '...';	
			let etiquetas = ux.getElement("bQtdeEtiqueta_"+rid).value;
			let quantidade = ux.getElement("bQtdePorEtiqueta_"+rid).value;
			let resto = ux.getElement("restoQuantidade_"+rid).innerHTML;
			
			let dados = {
						get:'imprimirGrapa',
						grapa:grapa,
						docentry:docentry,
						linenum:linenum,
						etiquetas: etiquetas||'' ? etiquetas : 1,
						quantidade: quantidade||'' ? quantidade : 1 ,
						resto: resto
						
					};
			

			ux.apost( '?program_id='+appInfo.gid+'&page='+appInfo.appID
					, dados
					, function(err, result) {
						if ( !ux.aError(result,true) )  {
							if (result.ret_code<0) {
								console.log(`impressao da grapa ${grapa}`);
								f.innerHTML = 'Sim';
							} else {
								console.log(`${result.ret_code} Impressao da grapa ${grapa}`);
							}
						}
					}
					,{timeout:180000}
				);
				
		}
	
		desenho(dr) {
			let dados = dr.split(';');
			let html = '';
			let ultimaImagem = '';
			
			dados.forEach(item => {
				
				if (ultimaImagem === item.substring(0, item.indexOf("."))) {
					html+='';
				}else
				{
					html+='<img width="32" height="32" src="BitmapPath//'+ item.substring(0, item.indexOf(".")) /* itemCode */ +'.bmp"><br>';
					ultimaImagem = item.substring(0, item.indexOf("."))
				}
				
			});
			
			return html;
		}
				
		detalhe(dr) {
			let dados = dr.split(';');
			let html = '';
			dados.forEach(item => {
					html+=item+'<br>';
			});
			return html;
		};
		
		detalheGrapa(dr) {
			let dados = dr.split(',');
			let html = '';
			dados.forEach(item => {
					html+=item+'<br>';
			});
			return html;
		};
				
		detItem(d){
			
			return '<img width="32" height="32" src="BitmapPath//'+ d.substring(0, d.indexOf(".")) /* itemCode */ +'.bmp">'+d;
		}
		
		dateTime2format(d){
			return d.toLocaleDateString(navigator.language, {year:"numeric", month:"2-digit", day:"2-digit"})+' '+d.toLocaleTimeString(navigator.language, {hour:"2-digit",minute:"2-digit"});
		}
		
    }
	var app = new customAPP;        