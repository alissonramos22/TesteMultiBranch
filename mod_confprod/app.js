class customAPP {
    constructor() {
        this.loadClientes().then((res) => {
            this.gui();
            this.appData_clear();
        });
    }
    appData_clear() {
        // We clear all appData we stored previously
        this.appData = {};
    }

    gui() {
        // Using the UI.js library we create an input field and the container for a data grid
        let page =
            ui.box(
                //ui.title("Conferência de Produção - V2") +
                ui.columns([{
                        content: ui.select("Cliente", "bCliente", "", this.clientes, {
                            licon: "fa-search",
                            autofocus: true,
                            type: 'text'
                        })
                    }, {
                        content: ui.input("Lote", "bLote", "", {
                            licon: "fa-search",
                            rbutton: "fa-search",
                            autofocus: true,
                            type: 'text'
                        })
                    }
                    //,{content:ui.button("bNovo","Novo",{type:"is-link", licon:"plus"}), size:"1/5"}
                ]) +
                ui.dgrid("OrdensLista")
            );

        // Now we create the "Tab" container and set for each tab the layout defined in the previous lines
        var html = page;
        document.getElementById("app-container").innerHTML = html;

        let conferirTodos = '<button class="button is-link nav-submit" style="margin-right:25px;background-color:darkblue" disabled=""  id="appConferir"><span class="icon is-medium"><i class="fa fa-industry" aria-hidden="true"></i></span><span>Conferir Todos</span></button>';
		let buttonSave = '<button class="button is-link nav-submit" disabled="" id="appSave"><span class="icon is-medium"><i class="fa fa-check" aria-hidden="true"></i></span><span>Salvar</span></button>'
			
		document.getElementById('appSave').parentNode.innerHTML=conferirTodos+buttonSave

        this.uxInit();
    }

    uxInit() {
        ux.listen('change', "bCliente", function(e) {
            document.getElementsByName("bLote")[0].value = "";
            this.getOrdens().then((res) => {
                this.viewOrdens();
                this.checkAll();
            })
        }.bind(this));

        ux.listen('click', 'bLote-rbutton', function(e) {
            this.getOrdens().then((res) => {
                this.viewOrdens();
                this.checkAll();
            })
        }.bind(this));

        ux.listen('keyup', 'bLote', function(e) {
            if (e.keyCode == 13) {
                this.getOrdens().then((res) => {
                    this.viewOrdens();
                    this.checkAll();
                })
            };
        }.bind(this));

        ux.listen('click', "appSave", function(e) {
            this.saveAll();
        }.bind(this));

        ux.listen('click', "appConferir", function(e) {
            this.conferirAll();
        }.bind(this));
    }

    async getOrdens(){
        let filter = document.getElementsByName("bCliente")[0].value;
        let lote = document.getElementsByName("bLote")[0].value;

        filter = (filter==='')?'N':filter;
        lote = (lote==='')?'N':lote;

		let dados = {
			get:"getAux",
			acao:"getOrdens",
			dados:`@${filter}@@${lote}@`,
			dg_limit:99999,
			dg_page:1
		}

		await this.getAux(dados,'dgOrdens');
	}

    async viewOrdens() {
        ux.dgrid('OrdensLista', {
                limit: 9999,
                fields: [ {
                        title: _t("Data"),
                        width: "80px"
                    }, {
                        title: _t("Cliente"),
                        width: "300px"
                    }, {
                        title: _t("Lote"),
                        align: "center",
                        width: "120px"
                    }, {
                        title: _t(""),
                        width: "75px"
                    }, {
                        title: _t("Item"),
                        width: "150px"
                    }, {
                        title: _t("Acab."),
                        width: "60px"
                    }, {
                        title: _t("Qtd."),
                        width: "60px"
                    }, {
                        title: _t("Volumes"),
                        width: "80px"
                    }, {
                        title: _t("Conf."),
                        width: "80px"
                    }, {
                        title: _t("Confirmar"),
                        width: "80px"
                    }, {
                        title: _t("POS_ID"),
                        hidden: true
                    }

                ],
                rows:this.appData.dgOrdens,
                ondraw_row: function(tbody, rid, dr) {
                    let row, cell, i;
                    row = tbody.insertRow(-1);
                    row.setAttribute('data-rid', rid);

                    ////console.log(dr);
                    i = 0;

                    //Data
                    cell = row.insertCell(i++);
                    cell.innerHTML = dr[0];
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Cliente
                    cell = row.insertCell(i++);
                    cell.innerHTML = dr[1];
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Lote
                    cell = row.insertCell(i++);
                    cell.innerHTML = dr[2];
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Perfil
                    cell = row.insertCell(i++);
                    cell.innerHTML = app.detItem(dr[3]);
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Item
                    cell = row.insertCell(i++);
                    cell.innerHTML = dr[4];
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Acabamento
                    cell = row.insertCell(i++);
                    cell.innerHTML = dr[5];
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Quantidade
                    cell = row.insertCell(i++);
                    cell.innerHTML = dr[6] + " " + dr[7];
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    // Etiquetas
                    cell = row.insertCell(i++);
                    cell.innerHTML = dr[14];
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Quantidade Conferida
                    cell = row.insertCell(i++);
                    cell.innerHTML = ui.input("", "quantidade_" + rid, dr[10], {
                        autofocus: true,
                        type: 'number',
                    });
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";

                    //Conferido
                    let nome = dr[12];
                    let cor = "";
                    let cor_fonte = "";

                    if (nome === "") {
                        cor = "#FFFFE0";
                        cor_fonte = "white";
                    } else if (nome !== "" && parseInt(dr[6]) !== parseInt(dr[10])) {
                        cor = "#B85E73";
                        cor_fonte = "white";
                    } else if (nome !== "" && parseInt(dr[6]) === parseInt(dr[10])) {
                        cor = "#98FB98";
                        cor_fonte = "black";
                    }

                    cell = row.insertCell(i++);
                    cell.innerHTML = `<table id="confirma_${rid}" border=1 style="width:100%; height:35px; background-color:${cor}">
													<tr>
													<td>
													<span id="confirmaValue_${rid}" name="confirmaValue_${rid}" style="font-size:10px;color:${cor_fonte}">${nome}</span>
													</td>
													</tr>
													</table>`;
                    cell.style.textAlign = "center";
                    cell.style.verticalAlign = "middle";
                }
            }
        );

        let headers = document.querySelectorAll('#dg-OrdensLista th');
        //console.log(headers);
        headers.forEach(header => {
            header.style.textAlign = 'center';
            header.style.verticalAlign = 'middle';
        });

        ux.getElement('dg-OrdensLista').setAttribute('style','font-size:12px');
        await ux.wait();
        return await Promise.resolve(false);
    }

    async loadClientes() {
        if (this.clientes == null) {
            ux.aget('?program_id=' + appInfo.gid + '&page=' + appInfo.appID + '&get=getAux&acao=getClientes&dados=&dg_limit=999&dg_page=1', function(err, result) {
                if (!err && result.hasOwnProperty("value") && result.value.length > 0) {
                    this.clientes = result.value;
                    this.clientes.push(['', '']);
                } else {
                    this.clientes = [['','']];
                }

            }.bind(this));
            await ux.wait();
            return await Promise.resolve(false);
        }
        return await Promise.resolve(true);
    }

    detItem(d) {
        return '<img width="48" height="48" src="BitmapPath//' + d /* itemCode */ + '.bmp">'; //+d;
    }

    saveAll() {
        let rows = this.appData.dgOrdens.filter(x => 
            x[10] !== "" && x[12] !== ""
        );

        let apontamentos = []

        rows.forEach( row => {
            let url = '?program_id=' + appInfo.gid + '&page=' + appInfo.appID
            let data = {
                get:'postAux',
                acao:'salvaPost',
                dados: `@${row[8]}@@${row[16]}@`
            }

            let novapromise = new Promise(async (resolve,reject) => {
                await ux.apost(url
                    ,data
                    ,async function(err, result) {
                        if (!err /* && !ux.aError(result)*/ ){ 
                            resolve(result);
                        }else{
                            reject(err);
                        }
                    }.bind(this)
                    , {
                        timeout: 180000
                        , loading: true
                    }
                    )
            })

            apontamentos.push(novapromise);
        })

        Promise.all(apontamentos).then((values) =>{
			this.getOrdens().then((res) => {
                this.viewOrdens();
                this.checkAll();
            })
		})
    }


    checkAll() {
        let rows = this.appData.dgOrdens
        let valido = rows.filter(x => 
            x[10] !== "" && x[12] !== ""
        );
        if (valido.length > 0) {
            ux.set("appSave", "enable");
        } else {
            ux.set("appSave", "disabled");
        }

        let validoConf = rows.filter(x => 
            x[10] == "" && x[12] == ""
        );

        let lote = document.getElementsByName("bLote")[0].value;

        if (validoConf.length > 0 && lote !== "") {
            ux.set("appConferir", "enable");
        } else {
            ux.set("appConferir", "disabled");
        }

    }

   async conferirAll(){
        let rows = this.appData.dgOrdens.filter(x => 
            x[10] == "" && x[12] == ""
        );

        let apontamentos = []

        rows.forEach( row => {
            let url = '?program_id=' + appInfo.gid + '&page=' + appInfo.appID
            let data = {
                get:'postAux',
                acao:'conferirPost',
                dados: `@${row[8]}@@${appInfo.uid}@@${row[6]}@@${row[16]}@`
            }

            let novapromise = new Promise(async (resolve,reject) => {
                await ux.apost(url
                    ,data
                    ,async function(err, result) {
                        if (!err /* && !ux.aError(result)*/ ){ 
                            resolve(result);
                        }else{
                            reject(err);
                        }
                    }.bind(this)
                    , {
                        timeout: 180000
                        , loading: true
                    }
                    )
            })

            apontamentos.push(novapromise);
        })

        Promise.all(apontamentos).then((values) =>{
			this.getOrdens().then((res) => {
                this.viewOrdens();
                this.checkAll();
            })
		})
    }

    async getAux(dados, grid) {
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
				, loading: true
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

}

var app = new customAPP;
