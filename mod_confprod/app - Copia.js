class customAPP {
    constructor() {
        this.globalfunctions = {
            confirma: function({
                rid
            }) {
                let rows = ux.dgrid('OrdensLista').rows.value;
                if (rows[rid][12] === '') {
                    let s = ux.getElement('confirma_' + rid);

                    let teste = rows[rid];
                    let buchnrid = rows[rid][8];
                    let pacote = rows[rid][10];
                    let grapa = '';
                    let grapaInputs = document.querySelectorAll(`#grapaContainer_${rid} input[type="text"]`);

                    for (let i = 0; i < grapaInputs.length; i++) {

                        grapa += grapaInputs[i].value;

                        if (i < grapaInputs.length - 1) {
                            grapa += ';';
                        }
                    }



                    if (pacote !== '' && grapa !== '' && rows[rid][6] === parseInt(rows[rid][10])) {
                        s.style.background = "#98FB98";
                        let dados = {
                            get: 'salvaConferido',
                            buchnrid: buchnrid,
                            pacote: pacote,
                            grapa: grapa
                        };

                        //console.log(dados);

                        ux.apost('?program_id=' + appInfo.gid + '&page=' + appInfo.appID, dados, function(err, result) {
                            if (!ux.aError(result, true)) {
                                //console.log(result.ret_code);
                                app.getOrdens(document.getElementsByName("bCliente")[0].value).then((res) => {
                                    app.uxInitGrid();
                                    app.checkAll();
                                });
                            } else {
                                //console.log(result.ret_code);
                            }
                        }, {
                            timeout: 180000
                        });
                    } else if (pacote !== '' && grapa !== '' && rows[rid][6] !== parseInt(rows[rid][10])) {
                        s.style.background = "#B85E73";
                        let dados = {
                            get: 'naoConforme',
                            buchnrid: buchnrid,
                            pacote: pacote,
                            grapa: grapa
                        };

                        //console.log(dados);

                        ux.apost('?program_id=' + appInfo.gid + '&page=' + appInfo.appID, dados, function(err, result) {
                            if (!ux.aError(result, true)) {
                                //console.log(result.ret_code);
                                app.getOrdens(document.getElementsByName("bCliente")[0].value).then((res) => {
                                    app.uxInitGrid();
                                    app.checkAll();
                                });
                            } else {
                                //console.log(result.ret_code);
                            }
                        }, {
                            timeout: 180000
                        });

                    }
                    
                    else {
                        ux.dialog("Erro!", "Informar quantidade conferida e grapas", {
                            buttons: [{
                                id: 'ok',
                                title: _t("Ok"),
                                type: "is-danger"
                            }]
                        });
                    }
                } else {
                    ux.dialog("ALERTA!", "Cancelar Conferência?", {
                        buttons: [{
                            id: 'ok',
                            title: _t("Sim"),
                            type: "is-success"
                        }, {
                            id: 'cancel',
                            title: _t("Cancelar"),
                            type: "is-danger"
                        }]
                    }, function(b) {
                        if (b === 'cancel') {} else {
                            let s = ux.getElement('confirma_' + rid);
                            s.style.background = "#FFFFE0";

                            let buchnrid = rows[rid][8];
                            let pacote = rows[rid][10];
                            let grapa = '';
                            let grapaInputs = document.querySelectorAll(`#grapaContainer_${rid} input[type="text"]`);

                            for (let i = 0; i < grapaInputs.length; i++) {

                                grapa += grapaInputs[i].value;

                                if (i < grapaInputs.length - 1) {
                                    grapa += ';';
                                }
                            }

                            let dados = {
                                get: 'removeConferido',
                                buchnrid: buchnrid,
                                pacote: pacote,
                                grapa: grapa
                            };

                            //console.log(dados);

                            ux.apost('?program_id=' + appInfo.gid + '&page=' + appInfo.appID, dados, function(err, result) {
                                if (!ux.aError(result, true)) {
                                    //console.log(result.ret_code);
                                    app.getOrdens(document.getElementsByName("bCliente")[0].value).then((res) => {
                                        app.uxInitGrid();
                                        app.checkAll();
                                    });
                                } else {
                                    //console.log(result.ret_code);
                                }
                            }, {
                                timeout: 180000
                            });
                        }
                    }.bind(this));
                }
            }
        }


        //lista de colunas que não recebem a função padrão!
        this.ignoreCol = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        this.colunas = [
            ['data_', null, ''],
            ['Cliente_', null, ''],
            ['Lote_', null, ''],
            ['Perfil_', null, ''],
            ['Item_', null, ''],
            ['Acabamento_', null, ''],
            ['Quantidade_', null, ''],
            ['um_', null, ''],
            ['buchnrid_', null, ''],
            ['pacotes_', null, ''],
            ['quantidade_', null, 'change'],
            ['grapa_', null, 'change'],
            ['confirma_', this.globalfunctions.confirma, 'click']

        ]


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
                ui.title("Conferência de Produção - V2") +
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

        this.uxInit();
    }

    uxInit() {
        ux.listen('change', "bCliente", function(e) {
            document.getElementsByName("bLote")[0].value = "";
            this.getOrdens().then((res) => {
                this.uxInitGrid();
                this.checkAll();
            });
        }.bind(this));

        ux.listen('click', 'bLote-rbutton', function(e) {
            this.getOrdens().then((res) => {
                this.uxInitGrid();
                this.checkAll();
            });
        }.bind(this));

        ux.listen('keyup', 'bLote', function(e) {
            if (e.keyCode == 13) {
                this.getOrdens().then((res) => {
                    this.uxInitGrid();
                    this.checkAll();
                })
            };
        }.bind(this));

        ux.listen('click', "appSave", function(e) {
            this.saveAll();
        }.bind(this));
    }

    async getOrdens() {

        let filter = document.getElementsByName("bCliente")[0].value;
        let lote = document.getElementsByName("bLote")[0].value;

        ux.dgrid('OrdensLista', {
                timeout: 1800,
                limit: 100,
                fields: [{
                        title: _t("#"),
                        width: "70px"
                    }, {
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
                        title: _t("Grapa"),
                        width: "80px"
                    }, {
                        title: _t("Confirmar"),
                        width: "80px"
                    }, {
                        title: _t("POS_ID"),
                        hidden: true
                    }

                ],
                url: '?program_id=' + appInfo.gid + '&page=' + appInfo.appID + '&get=getOrdens' + '&filter=' + filter + '&lote=' + lote,
                ondraw_row: function(tbody, rid, dr) {
                    let row, cell, i;
                    row = tbody.insertRow(-1);
                    row.setAttribute('data-rid', rid);

                    ////console.log(dr);
                    i = 0;

                    // Exibir etiquetas
                    cell = row.insertCell(i++);
                    cell.innerHTML = `
                    <style>
                        .custom-button2 {
                            background-color: #209cee;
                            color: #FFFFFF;
                            width: 100%;
                            height:80px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .barcode-icon {
                            font-size: 36px;
                            font-color: #FFFFFF;
                        }
                    </style>

                    <div id="etiquetasContainer_${rid}">
                        <button id="bEtiquetas_${rid}" class="custom-button2 etiquetas-button">
                            <i class="fas fa-barcode barcode-icon"></i>
                        </button>
                    </div>`;


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

                    // Grapa
                    cell = row.insertCell(i++);
                    cell.innerHTML = `
                        <style>
                            .custom-button {
                                background-color: #209cee;
                                color: #ffffff;
                                margin-bottom: 10px; /* Adicione margem inferior aos botões */
                            }
                        </style>
                        
                        <div id="grapaContainer_${rid}">
                            <input width="80px" id="grapa_${rid}_0" type="text" value="${dr[11]}" /><br><br>
                            <button id="addGrapa_${rid}" class="custom-button" onclick="app.addGrapaInput(${rid})">+</button>
                            <button id="removeGrapa_${rid}" class="custom-button" onclick="app.removeGrapaInput(${rid})">-</button>
                        </div>`;
                        
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
                    cell.innerHTML = `<table id="confirma_${rid}" border=1 style="width:100%; height:80px; background-color:${cor}">
													<tr>
													<td>
													<span id="confirmaValue_${rid} name="confirmaValue_${rid}" style="color:${cor_fonte}">${nome}</span>
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

    uxInitGrid() {
        let rows = ux.dgrid('OrdensLista').rows.value;

        rows.forEach((x, rid) => {
            // Inicializa outras colunas
            this.colunas.forEach((y, col) => {
                let result = this.ignoreCol.filter(z => z === col);
                if (result.length === 0) {
                    ux.listen(y[2], y[0] + rid, function(e) {
                        this.facilitadorLinha(rid, col,
                            (y[2] === 'click') ? '' : document.getElementsByName(y[0] + rid)[0].value,
                            y[1], {
                                rid
                            }, y[0] + rid);
                    }.bind(this));
                }
            });

            x.lote = x[2];

            // Adicione um ouvinte de evento ao botão bEtiqueta dentro da célula da grade
            let etiquetasButton = document.getElementById(`bEtiquetas_${rid}`);
            if (etiquetasButton) {
                etiquetasButton.addEventListener('click', (event) => {
                    // Recupere o valor do "Lote" da linha atual e passe-o para a função exibirEtiquetas
                    this.exibirEtiquetas(x.lote);
                });
            }
        });
    }


    facilitadorLinha(rid, col, value, func = null, params, atual) {
        let force = false;
        let rows = ux.dgrid('OrdensLista').rows.value;

        if (col !== 12) {
            rows[rid][col] = value;
        }
        if (func) {
            func(params = {
                ...params,
                atual,
                force
            })
        };
    }


    async loadClientes() {
        if (this.clientes == null) {
            ux.aget('?program_id=' + appInfo.gid + '&page=' + appInfo.appID + '&get=getClientes&dg_limit=999&dg_page=1', function(err, result) {
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

    checkAll() {
        let rows = ux.dgrid('OrdensLista').rows.value;
        let valido = rows.filter(x => x[13] !== "" &&
            x[10] !== "" &&
            x[11] !== ""
        );
        if (valido.length > 0) {
            ux.set("appSave", "enable");
        } else {
            ux.set("appSave", "disabled");
        }
    }

    saveRecursive(rows, count) {
        if (rows.length) {
            let row = rows[0]
            const op = row[15].split('/');
            let acao = '';
            let quant = 0;

            if (row[6] > parseInt(row[10])) {
                quant = row[6] - parseInt(row[10]);
                acao = 'entrada';
            } else if (row[6] < parseInt(row[10])) {
                quant = parseInt(row[10]) - row[6];
                acao = 'transf';
            }

            let dados = {
                get: 'salvar',
                cardcode: document.getElementsByName("bCliente")[0].value,
                op: op[0],
                posOp: op[1],
                posId: row[13],
                acao: acao,
                quant: quant,
                dep: 'C0000766'
            }

            //console.log("Dados: ", dados);

            let rowsN = rows.slice(1, rows.length);
            count += 1;

            ux.apost('?program_id=' + appInfo.gid + '&page=' + appInfo.appID, dados, function(err, result) {
                if (!ux.aError(result, true)) {
                    //console.log(result.ret_code)

                    app.saveRecursive(rowsN, count);
                } else {
                    //console.log(result.ret_code)
                }
            }, {
                timeout: 180000
            });
        } else {
            let dados = {
                get: 'endLine'
            }
            ux.apost('?program_id=' + appInfo.gid + '&page=' + appInfo.appID, dados, function(err, result) {
                if (!ux.aError(result, true)) {
                    if (result.ret_code > 0) {
                        ux.dialog("Salvo!", "Conferência de produção concluída com sucesso!", {
                            buttons: [{
                                id: 'ok',
                                title: _t("Salvo"),
                                type: "is-success"
                            }]
                        });
                        app.clientes = null;
                        app.loadClientes().then((res) => {
                            app.gui();
                        });
                    } else {
                        //console.log(result.ret_code)
                    }
                } else {
                    //console.log(result.ret_code)
                }
            }, {
                timeout: 180000
            });
        }
    }

    saveAll() {
        let rows = ux.dgrid('OrdensLista').rows.value.filter(x => x[12] !== "");
        //console.log(rows);
        let count = 0;
        this.saveRecursive(rows, count);
    }


    addGrapaInput(rid) {
        const grapaContainer = document.getElementById(`grapaContainer_${rid}`);
        const inputCount = grapaContainer.querySelectorAll('input[type="text"]').length;
        const newInput = document.createElement('input');
        newInput.setAttribute('type', 'text');
        newInput.setAttribute('id', `grapa_${rid}_${inputCount}`);
        newInput.value = ''; // Define o valor inicial como vazio
        newInput.style.marginBottom = '10px'; // Adicione espaço vertical ajustando o valor em pixels
        grapaContainer.insertBefore(newInput, document.getElementById(`addGrapa_${rid}`));
    }


    removeGrapaInput(rid) {
        const grapaContainer = document.getElementById(`grapaContainer_${rid}`);
        const inputCount = grapaContainer.querySelectorAll('input[type="text"]').length;

        // Verifique se há mais de um input de grapa antes de tentar remover
        if (inputCount > 1) {
            // Se houver mais de um input, remova o último
            const lastInput = document.getElementById(`grapa_${rid}_${inputCount - 1}`);
            grapaContainer.removeChild(lastInput);
        }
    }

    exibirEtiquetas(lote) {
        let s = new extendedSearch({
            id: 'exibirEtiquetasT',
            title: _t('Etiquetas'),
            // Utilize this para acessar o valor do "Lote" da linha atual
            url: '?program_id=' + appInfo.gid + '&limit=1000&page=' + appInfo.appID + '&get=viewEtiquetas&lote=' + lote + '&filter=*q*',
            fields: [{
                    title: _t("Lote")
                },
                {
                    title: _t("Quantidade")
                },
                {
                    title: _t("Status")
                }
            ]
        });
        s.search();
    }


}

var app = new customAPP;
