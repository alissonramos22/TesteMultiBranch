CREATE PROCEDURE sp_sps_beas_modconfprod2_getaux(
	acao nvarchar(50)
	,dados nclob
)AS
BEGIN

	/* LOGS
	 * 
	 * 01/10/2025 - Isabely Bueno - Alteração de '@@' para JSON Select
	 * 09/10/2025 - Isabely Bueno - Adição de filtros de pesquisa da table
	 * 10/10/2025 - Isabely Bueno - 
	 * */
	/*	
	DECLARE acao nvarchar(50) := 'saveReprovado';
	DECLARE dados nclob := '{"linhas":[{"buchnrId":15471,"orig":"SPS_BEAS_FTSTMP","persId":"9"}]}';--'[{"qtde":2,"buchnrId":15462,"orig":"SPS_BEAS_FTSTMP","persId":"809"},{"qtde":9,"buchnrId":15463,"orig":"SPS_BEAS_FTSTMP","persId":"809"}]';
	*/
	
	DECLARE _tipo NVARCHAR(20);
	DECLARE _data NVARCHAR(20);
	DECLARE _lote NVARCHAR(20);
	DECLARE _perfil NVARCHAR(50);
	DECLARE _item NVARCHAR(20);
	DECLARE _corte	NVARCHAR(20);
	DECLARE _acabamento NVARCHAR(20);
	DECLARE _qtde NVARCHAR(20);
	DECLARE _etiquetas NVARCHAR(20);
	DECLARE _qtdeConf NVARCHAR(20);
	DECLARE _confPor NVARCHAR(20);
	DECLARE _pedido NVARCHAR(20);
	DECLARE _cliente NVARCHAR(50);
	

	SELECT  JSON_VALUE(:DADOS, '$.tipo'), -- Filtros para quando for pesquisado pela tabela	
			JSON_VALUE(:DADOS, '$.data'),
			JSON_value(:DADOS, '$.lote'),
			JSON_VALUE(:DADOS, '$.perfil'),
			JSON_VALUE(:DADOS, '$.item'),
			JSOn_VALUE(:DADOS, '$.corte'),
			JSON_VALUE(:DADOS, '$.acabamento'),
			JSON_VALUE(:DADOS, '$.qtde'),
			JSON_VALUE(:DADOS, '$.etiquetas'),
			JSON_VALUE(:DADOS, '$.qtdeConf'),
			JSON_VALUE(:DADOS, '$.confPor'),
			JSON_VALUE(:DADOS, '$.pedido'),
			JSON_VALUE(:DADOS, '$.cliente')
	INTO _tipo, _data, _lote, _perfil, _item, _corte, _acabamento, _qtde, _etiquetas, _qtdeConf, _confPor, _pedido, _cliente
	FROM DUMMY;
	
	
	linhas=SELECT *
		FROM JSON_TABLE(:DADOS, '$.linhas'
			COLUMNS(
				buchnrId NVARCHAR(50) PATH '$.buchnrId',
				persId NVARCHAR(50) PATH '$.persId',
				orig NVARCHAR(50) PATH '$.orig',
				qtde NVARCHAR(50) PATH '$.qtde'
			)
		);	
	
	IF :acao = 'getOrdens' THEN
		WITH ordens AS (
			SELECT
				'' "Selecionar",
				CASE WHEN T1.TYP = 'INDUSTRIALIZACAO' THEN 'Terceiro' ELSE 'Olga' END "Tipo",
			    TO_VARCHAR(T0."DocDate", 'dd/MM/yyyy') "DocDate",
			    COALESCE(PN."CardFName",T1."KNDNAME") "Cliente",
			    CASE WHEN T1.TYP = 'INDUSTRIALIZACAO' THEN T1.UDF1 ELSE  T0."BELNR_ID" || '/' || T0."BELPOS_ID" END "Lote",
			    IFNULL(T4."U_Perfil", SUBSTR_BEFORE(T2."ItemCode", '.'))||'.bmp' "Perfil",
			    IFNULL(T4."U_Perfil" || '.' || T4."U_Comprimento", SUBSTR_BEFORE(T2."ItemCode", '.')) "Item",
			    IFNULL(T4."U_Comprimento",(SUBSTR_REGEXPR( '(.+?)\.' IN T2."ItemCode" OCCURRENCE 4 GROUP 1))) "Corte",
			    IFNULL(T4."U_Acabamento", T2."UDF10") "Acabamento",
			    ROUND((T0."MENGE_GUT_RM"),0) "Quantidade",
			    T0."RM_ME" "UM",
			    IFNULL(T2."UDF5", '') "DataConf",
			    IFNULL(T0."UDF6", '') "QuantityConf",
			    IFNULL(T0."UDF8", '') "PersdIdConf",
			    T0."POS_ID",
			    (
			        SELECT STRING_AGG("ETIQ", '<br>') 
			        FROM (
			            SELECT COUNT(*) || ' x ' || TO_INT("Quantity") "ETIQ" 
			            FROM "SPS_PRODETIQUETAS" B0 
			            WHERE B0."BELNR_ID" = T0."BELNR_ID" 
			              AND B0."BELPOS_ID" = T0."BELPOS_ID" 
			              AND B0."Status" <> 'Cancelada' 
			            GROUP BY "Quantity"
			        ) T0
			    ) "Etiquetas",
			    T0."BELNR_ID" || '/' || T0."BELPOS_ID" "OP",
			    T0."BUCHNR_ID",
			    'BEAS_ARBZEIT' "Origem",
			    COALESCE(RT0."DocNum",RO0."DocNum") "Pedido",
			    T0.BELNR_ID,
			    T0.BELPOS_ID
			FROM
			    "BEAS_ARBZEIT" T0
			    INNER JOIN "BEAS_FTHAUPT" T1 ON T1."BELNR_ID" = T0."BELNR_ID"
			    INNER JOIN "BEAS_FTPOS" T2 ON T2."BELNR_ID" = T0."BELNR_ID" 
			      AND T2."BELPOS_ID" = T0."BELPOS_ID"
			    INNER JOIN "BEAS_FTAPL" T3 ON T3."BELNR_ID" = T0."BELNR_ID" 
			      AND T3."BELPOS_ID" = T0."BELPOS_ID" 
			      AND T3."POS_ID" = T0."POS_ID"
			    LEFT JOIN "@SPS_RMIND_PERFIL" T4 ON TO_VARCHAR(T4."DocEntry") = T1."UDF1" 
			      AND TO_VARCHAR(T4."LineId") = TO_VARCHAR(T2."UDF1")
			    LEFT JOIN OCRD PN ON PN."CardCode"=T1."KND_ID"
			    LEFT JOIN ORDR RO0 ON RO0."DocEntry"=T2."DocEntry"
			    LEFT JOIN ORDR RT0 ON RT0."U_SPS_RmInd_Entry"=T4."DocEntry" AND RT0."CANCELED"='N'
			WHERE
			    T1."TYP" IN ('MTO', 'INDUSTRIALIZACAO')
			    AND CEILING(T0."MENGE_GUT_RM") > 0
			    AND T3."AG_ID" LIKE '%EMB%'
			    AND IFNULL(T0."UDF5", '') = ''
			UNION ALL
			SELECT
				'' "Selecionar",
				CASE WHEN T1.TYP = 'INDUSTRIALIZACAO' THEN 'Terceiro' ELSE 'Olga' END "Tipo",
				TO_VARCHAR(T0."END", 'dd/MM/yyyy') "DocDate",
			    COALESCE(PN."CardFName",T1."KNDNAME") "Cliente",
			    CASE WHEN T1.TYP = 'INDUSTRIALIZACAO' 
			    	THEN T1.UDF1 
			    	ELSE T0."LOTE"
			    END "Lote",
			    IFNULL(T4."U_Perfil", SUBSTR_BEFORE(T2."ItemCode", '.'))||'.bmp' "Perfil",
			    IFNULL(T4."U_Perfil" || '.' || T4."U_Comprimento", SUBSTR_BEFORE(T2."ItemCode", '.')) "Item",
			    IFNULL(T4."U_Comprimento",(SUBSTR_REGEXPR( '(.+?)\.' IN T2."ItemCode" OCCURRENCE 4 GROUP 1))) "Corte",
			    IFNULL(T4."U_Acabamento", T2."UDF10") "Acabamento",
			    ROUND((T0."QUANTITY_OK"),0) "Quantidade",
			    'PC' "UM",
			    '', 
			    IFNULL(TO_VARCHAR(TO_INT(QUANTITY_CONFERIDO_OK)),''),
			    IFNULL((SELECT "DisplayName" FROM BEAS_PERS WHERE PERS_ID = T0.PERS_ID_CONFERIDO),''),
			    T0."POS_ID",
			    (
			        SELECT STRING_AGG("ETIQ", '<br>') 
			        FROM (
			            SELECT COUNT(*) || ' x ' || TO_INT("Quantity") "ETIQ" 
			            FROM "SPS_PRODETIQUETAS_V2" B0 
			            WHERE B0."BELNR_ID" = T0."BELNR_ID" 
			              AND B0."BELPOS_ID" = T0."BELPOS_ID" 
			              AND B0."Status" <> 'Cancelada' 
			              AND B0."NUMERODOLOTE" = T0.LOTE
			            GROUP BY "Quantity"
			        ) T0
			    ) "Etiquetas",
			    T0."BELNR_ID" || '/' || T0."BELPOS_ID",
			    T0.ID, 
			    'SPS_BEAS_FTSTMP' "Origem",
			    COALESCE(RT0."DocNum",RO0."DocNum") "Pedido",
			    T0.BELNR_ID,
			    T0.BELPOS_ID
			FROM
			    "SPS_BEAS_FTSTMP" T0
			    INNER JOIN "BEAS_FTHAUPT" T1 ON T1."BELNR_ID" = T0."BELNR_ID"
			    INNER JOIN "BEAS_FTPOS" T2 ON T2."BELNR_ID" = T0."BELNR_ID" 
			      AND T2."BELPOS_ID" = T0."BELPOS_ID"
			    INNER JOIN "BEAS_FTAPL" T3 ON T3."BELNR_ID" = T0."BELNR_ID" 
			      AND T3."BELPOS_ID" = T0."BELPOS_ID" 
			      AND T3."POS_ID" = T0."POS_ID"
			    LEFT JOIN "@SPS_RMIND_PERFIL" T4 ON TO_VARCHAR(T4."DocEntry") = T1."UDF1" 
			      AND TO_VARCHAR(T4."LineId") = TO_VARCHAR(T2."UDF1")
			    LEFT JOIN OCRD PN ON PN."CardCode"=T1."KND_ID"
			     LEFT JOIN ORDR RO0 ON RO0."DocEntry"=T2."DocEntry"
			    LEFT JOIN ORDR RT0 ON RT0."U_SPS_RmInd_Entry"=T4."DocEntry" AND RT0."CANCELED"='N'
			WHERE
			   T1."TYP" IN ('MTO', 'INDUSTRIALIZACAO','MINIMO','REFORMA','REPOSICAO')
			    AND T0."QUANTITY_OK" > 0
			   	AND T3."APLATZ_ID" LIKE '%EMB%'
			    AND T0.CONFERIDO  IS NULL 
			    AND T0.CANCELADO IS NULL
			    AND T0.OPERFINAL = 1
			    AND (EXISTS (SELECT * FROM RDR1 R1 WHERE R1."DocEntry"=T2."DocEntry" AND R1."LineNum"=T2."BaseLine" AND R1."LineStatus"='O' )
			    	OR
			    	EXISTS (SELECT * FROM "@SPS_RMIND_CAB" I0 WHERE TO_VARCHAR(I0."DocEntry")=T1."UDF1" AND I0."U_Status" IN (5,6/*,7,8*/) )
			    	)
		)
			
	
		SELECT 
			TOP 3000-- RETIRAR
			"Selecionar"
			,"Tipo"
			,"DocDate"
			,"Lote"
			,"Perfil"
			,"Item"
			,"Corte"
			,"Acabamento"
			,"Quantidade"
			,"Etiquetas"
			,"QuantityConf"
			,"PersdIdConf"
			,"DataConf"
			,"Pedido"
			,"Cliente"
			,POS_ID
			,"OP"
			,BUCHNR_ID
			,"Origem"
			, CASE 
				--WHEN T1."ConferidoQTD" <> E0."Quantity" AND NULLIF(T1."ConferidoDESC",'') IS NULL THEN 0
				WHEN COALESCE(NULLIF("PersdIdConf", ''), '') = '' THEN 0
				ELSE 1
				END 
			"podeAprovar"
			,BELNR_ID
			,BELPOS_ID
				
		FROM ordens
		WHERE "Lote" <> ''
			-- FILTROS DA TABELA NO FRONT
		AND ((:_tipo IS NULL OR :_tipo = '') OR "Tipo" LIKE '%'||:_tipo||'%') -- Filter: status
		AND ((:_data IS NULL OR :_data = '') OR "DocDate" LIKE '%'||:_data||'%') -- Filter: codAcab
		AND ((:_lote IS NULL OR :_lote = '') OR "Lote" LIKE '%'||:_lote||'%') -- Filter: descAcab
		AND ((:_perfil IS NULL OR :_perfil = '') OR "Perfil" LIKE '%'||:_perfil||'%')-- Filter: perfil
		AND ((:_item IS NULL OR :_item = '') OR "Item" LIKE '%'||:_item||'%')-- Filter: ferramenta
		AND ((:_corte IS NULL OR :_corte = '') OR "Corte" LIKE '%'||:_corte||'%')-- Filter: corte 
		AND ((:_acabamento IS NULL OR :_acabamento = '') OR "Acabamento" LIKE '%'||:_acabamento||'%')-- Filter: lote
		AND ((:_qtde IS NULL OR :_qtde = '') OR "Quantidade" LIKE '%'||:_qtde||'%') -- Filter: quantidade
		AND ((:_etiquetas IS NULL OR :_etiquetas = '') OR "Etiquetas" LIKE '%'||:_etiquetas||'%')-- Filter: peso
		AND ((:_qtdeConf IS NULL OR :_qtdeConf = '') OR "QuantityConf" LIKE '%'||:_qtdeConf||'%')-- Filter: produzido 
		AND ((:_confPor IS NULL OR :_confPor = '') OR "PersdIdConf" LIKE '%'||:_confPor||'%') -- Filter: saldo
		AND ((:_pedido IS NULL OR :_pedido = '') OR "Pedido" LIKE '%'||:_pedido||'%') -- Filter: rejeito
		AND ((:_cliente IS NULL OR :_cliente = '') OR "Cliente" LIKE '%'||:_cliente||'%') -- Filter: cliente	            
--		ORDER BY CASE WHEN "TYP" IN ('REFORMA','REPOSICAO') THEN 0 ELSE 1 END,"BELNR_ID",5,"BELPOS_ID"
	   	ORDER BY
		    2,
		    1,
		    --T0."BUCHNR_ID";
		    "BUCHNR_ID";
		RETURN;
	END IF;
	
		
		
	IF :acao = 'todosOK' THEN	
		
		UPDATE T1
		SET T1.QUANTITY_CONFERIDO_OK = T0.qtde, 
			T1.PERS_ID_CONFERIDO = T0.persId
		FROM SPS_BEAS_FTSTMP T1
		INNER JOIN :linhas T0 ON T0.orig = 'SPS_BEAS_FTSTMP' AND T0.buchnrId = T1.ID;
		
		UPDATE T1
		SET T1.UDF6 = T0.qtde,
			T1.UDF7 = '',
			T1.UDF8= (SELECT "DisplayName" FROM BEAS_PERS WHERE TO_VARCHAR(PERS_ID) = TO_VARCHAR(T0.persId)) 
		FROM BEAS_ARBZEIT T1
		INNER JOIN :linhas AS T0 ON T0.orig = 'BEAS_ARBZEIT' AND T0.buchnrId = T1.BUCHNR_ID;
	
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;
		
		/*UDF5 = 'salva data da conclusao - SAVEALL'  
		UDF6 = 'salva a Quantidade'
		UDF7 = 'salva a grapa - que nao será mais utilzada'
		UDF8 = 'armazena quem realizou a Conferencia!.'*/
	
	/* 10/10/2025 - Isabely Bueno - Antes era 'conferirPost' mas acredito que é a ação do botão salvar - Pendente: conferir com Alisson
	 * Foi alterado porque quando o usuário salva, a linha sumia da lista e não é possível salvar depois
	 */
	IF :acao = 'salvaPost' THEN 
		/*DECLARE buchnrid nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 1 GROUP 1),'');
		DECLARE pers_id nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 2 GROUP 1),'');
		DECLARE quantity nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 3 GROUP 1),'');
		DECLARE orig nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 4 GROUP 1),'');*/
		
		UPDATE T1
		SET T1.QUANTITY_CONFERIDO_OK = T0.qtde, 
			T1.PERS_ID_CONFERIDO = T0.persId
		FROM SPS_BEAS_FTSTMP T1
		INNER JOIN :linhas T0 ON T0.orig = 'SPS_BEAS_FTSTMP' AND T0.buchnrId = T1.ID;
		
		UPDATE T1
		SET T1.UDF6 = T0.qtde,
			T1.UDF7 = '',
			T1.UDF8= (SELECT "DisplayName" FROM BEAS_PERS WHERE TO_VARCHAR(PERS_ID) = TO_VARCHAR(T0.persId)) 
		FROM BEAS_ARBZEIT T1
		INNER JOIN :linhas AS T0 ON T0.orig = 'BEAS_ARBZEIT' AND T0.buchnrId = T1.BUCHNR_ID;
	
--		IF :_orig = 'SPS_BEAS_FTSTMP' THEN
--			UPDATE SPS_BEAS_FTSTMP 
--			SET QUANTITY_CONFERIDO_OK=:_qtde,
--				PERS_ID_CONFERIDO = :_persId 
--			WHERE ID = :_buchnrid;
--		ELSEIF :_orig = 'BEAS_ARBZEIT' THEN
--			UPDATE BEAS_ARBZEIT 
--			SET UDF6=:_qtde,
--				UDF7='',
--				UDF8=(SELECT "DisplayName" FROM BEAS_PERS WHERE TO_VARCHAR(PERS_ID) = TO_VARCHAR(:_persId)) 
--			WHERE BUCHNR_ID = :_buchnrid;
--		END IF;
--		
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;
		
	/* 10/10/2025 - Isabely Bueno - Antes era 'salvaPost' mas acredito que é a ação do botão aprovar - Conferir com o Alisson*/
	IF :acao = 'conferirPost' THEN
		/*DECLARE buchnrid nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 1 GROUP 1),'');
		DECLARE orig nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 2 GROUP 1),'');*/	
	
		UPDATE T1
		SET T1.CONFERIDO = current_timestamp 
		FROM SPS_BEAS_FTSTMP T1
			INNER JOIN :linhas T0 ON T0.orig = 'SPS_BEAS_FTSTMP' AND T0.buchnrId = T1.ID ;

		UPDATE T1
		SET T1.UDF5 = current_timestamp 
		FROM BEAS_ARBZEIT T1 
			INNER JOIN :linhas T0 ON T0.orig = 'BEAS_ARBZEIT' AND T0.buchnrId = T1.BUCHNR_ID;	
	
--		IF	 :_orig = 'SPS_BEAS_FTSTMP' THEN
--			update SPS_BEAS_FTSTMP set  CONFERIDO = current_timestamp WHERE ID = :_buchnrid;
--		ELSEIF :_orig = 'BEAS_ARBZEIT' THEN
--			update BEAS_ARBZEIT set  UDF5=current_timestamp WHERE BUCHNR_ID = :_buchnrid;		
--		END IF;
--		
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;


	IF :acao = 'saveReprovado' THEN 
	
		UPDATE T1
		SET T1.CANCELADO = current_timestamp, 
			T1.PERS_ID_CANCELADO = T0.persId
		FROM SPS_BEAS_FTSTMP T1
		INNER JOIN :linhas T0 ON T0.orig = 'SPS_BEAS_FTSTMP' AND T0.buchnrId = T1.ID;
	
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;

	IF :ACAO = 'getEtiquetas' THEN
	
		DECLARE belnr_id int;
		DECLARE belpos_id int;
		DECLARE lote nvarchar(100);
		
		SELECT 
			JSON_VALUE(TO_VARCHAR(:DADOS),'$.belnr_id' RETURNING  INTEGER )
			,JSON_VALUE(TO_VARCHAR(:DADOS),'$.belpos_id'  RETURNING  INTEGER )
			,JSON_VALUE(TO_VARCHAR(:DADOS),'$.lote')
		INTO 
			belnr_id
			,belpos_id
			,lote
		FROM DUMMY;
			
		uids= SELECT DISTINCT UID,BELNR_ID,BELPOS_ID FROM SPS_PRODETIQUETAS_V2 T0
		WHERE BELNR_ID = :BELNR_ID AND BELPOS_ID = :BELPOS_ID AND "Status" <> 'Cancelada'
		;		
				
		SELECT 
			0
			,IFNULL("barcode",(SELECT MAX("barcode") FROM SPS_PRODETIQUETAS_V2 A0 WHERE A0.UID = T0.UID)) "barcode"
			,"Status"
			,"quantityEtiqueta"
			,CASE
				WHEN A1."ItemCode" = 'ACABAMENTO' THEN A1."ItemName"
				ELSE  A1."ItemCode"
				END ||' - '|| T0."AMARRADO"
			,T0.UID
			,T0.ID
		FROM SPS_PRODETIQUETAS_V2 T0
			INNER JOIN :UIDS T1 ON T1.UID = T0.UID --AND T1.ID_LINHA = T0.ID_LINHA
			INNER JOIN BEAS_FTPOS A1 ON A1."BELNR_ID" = T0."BELNR_ID" AND A1.BELPOS_ID = T0.BELPOS_ID 
			INNER JOIN BEAS_FTHAUPT A2 ON A2."BELNR_ID" = A1."BELNR_ID"
		WHERE T0.BELNR_ID = :BELNR_ID AND T0.BELPOS_ID = :BELPOS_ID AND  T0."Status" <> 'Cancelada'
			AND (A2.TYP = 'INDUSTRIALIZACAO'
				OR
				(A2.TYP <> 'INDUSTRIALIZACAO' AND T0.NUMERODOLOTE = :lote)
			)
			;
		RETURN;
	END IF;
		
	IF :ACAO = 'reimprimirEtiquetas' THEN
		etiquetas=SELECT
						*
				FROM JSON_TABLE(:DADOS, '$'
					COLUMNS(
						uid nvarchar(50) PATH '$.uid',
						id int PATH '$.id',
						impressora nvarchar(100) PATH '$.printer'
					)
				);
		
		UPDATE T0 SET
			T0."Status"=CASE WHEN NULLIF(impressora,'') IS NOT NULL THEN 'RI:'||IMPRESSORA ELSE 'Gerado' END
		FROM SPS_PRODETIQUETAS_V2 T0
			INNER JOIN :ETIQUETAS T1 ON T1.UID = T0.UID AND T1.ID = T0.ID
		;
	
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;
		
	IF :ACAO = 'cancelarEtiquetas' THEN	
		etiquetas=SELECT
						*
				FROM JSON_TABLE(:DADOS, '$'
					COLUMNS(
						uid nvarchar(50) PATH '$.uid',
						id int PATH '$.id',
						impressora nvarchar(100) PATH '$.printer'
					)
				);
		
		UPDATE T0 SET
			T0."Status"='Cancelada'
		FROM SPS_PRODETIQUETAS_V2 T0
			INNER JOIN :ETIQUETAS T1 ON T1.UID = T0.UID AND T1.ID = T0.ID
		;
	
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;
		
	
	IF :ACAO = 'getImpressoras' THEN
	
		SELECT 
			''
			,''
		FROM DUMMY
		UNION ALL
		SELECT 
			DISTINCT 
			"U_Impressora"
			,CASE TO_VARCHAR(T0."Remark") 
				WHEN '1' THEN 'JCT-'	
				WHEN '2' THEN 'SBC-'
				ELSE ''
				END ||"U_Impressora" 
		FROM "@SPS_REGRA_IMP" T0
			--	INNER JOIN BEAS_PERS T1 ON T1.PERS_ID  = :pers_id
			--	AND ','||T1."BPLIds"||',' LIKE '%,'''||TO_VARCHAR(T0."Remark")||'''%,'
		ORDER BY 2
	 ;
	
	END IF;
		
	
	SELECT 'Nenhuma Ação Encontrada' FROM DUMMY;
	RETURN;
END;