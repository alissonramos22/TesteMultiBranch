CREATE PROCEDURE sp_sps_beas_modconfprod2_getaux(
	acao nvarchar(50)
	,dados nclob
)AS
BEGIN

	/* LOGS
	 * 
	 * 01/10/2025 - Isabely Bueno - Alteração de '@@' para JSON Select
	 * */
	
	
	/*DECLARE acao nvarchar(50) := 'getOrdens';
	DECLARE dados nclob := '';*/

	DECLARE buchnrid nvarchar(50);
	DECLARE persId nvarchar(50);
	DECLARE quantity nvarchar(50);
	DECLARE orig nvarchar(50);
	
	SELECT JSON_VALUE(:dados, '$.buchnrid'),
			JSON_VALUE(:dados, '$.persId'),
			JSON_VALUE(:dados, '$.quantity'),
			JSON_VALUE(:dados, '$.orig')
	INTO buchnrid, persId, quantity, orig
	FROM DUMMY;
	
	
	IF :acao = 'getOrdens' THEN
		SELECT 
			TOP 100-- RETIRAR
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
		FROM (
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
		    COALESCE(RT0."DocNum",RO0."DocNum") "Pedido"
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
		    COALESCE(RT0."DocNum",RO0."DocNum") "Pedido"
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
		    AND T0.OPERFINAL = 1
		    AND (EXISTS (SELECT * FROM RDR1 R1 WHERE R1."DocEntry"=T2."DocEntry" AND R1."LineNum"=T2."BaseLine" AND R1."LineStatus"='O' )
		    	OR
		    	EXISTS (SELECT * FROM "@SPS_RMIND_CAB" I0 WHERE TO_VARCHAR(I0."DocEntry")=T1."UDF1" AND I0."U_Status" IN (5,6,7,8) ))
		) T0
		WHERE "Lote" <> ''
	   	ORDER BY
		    2,
		    1,
		    T0."BUCHNR_ID";
		RETURN;
	END IF;
	
		/*UDF5 = 'salva data da conclusao - SAVEALL'  
		UDF6 = 'salva a Quantidade'
		UDF7 = 'salva a grapa - que nao será mais utilzada'
		UDF8 = 'armazena quem realizou a Conferencia!.'*/
	
	IF :acao = 'conferirPost' THEN
		/*DECLARE buchnrid nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 1 GROUP 1),'');
		DECLARE pers_id nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 2 GROUP 1),'');
		DECLARE quantity nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 3 GROUP 1),'');
		DECLARE orig nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 4 GROUP 1),'');*/
		
		IF :orig = 'SPS_BEAS_FTSTMP' THEN
			update SPS_BEAS_FTSTMP set  QUANTITY_CONFERIDO_OK=:quantity, PERS_ID_CONFERIDO = :persId WHERE ID = :buchnrid;
		ELSEIF :orig = 'BEAS_ARBZEIT' THEN
			update BEAS_ARBZEIT set  UDF6=:quantity ,UDF7='',UDF8=(SELECT "DisplayName" FROM BEAS_PERS WHERE TO_VARCHAR(PERS_ID) = TO_VARCHAR(:persId)) WHERE BUCHNR_ID = :buchnrid;
		END IF;
		
		
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;
		
	IF :acao = 'salvaPost' THEN
		/*DECLARE buchnrid nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 1 GROUP 1),'');
		DECLARE orig nvarchar(50) := IFNULL(SUBSTRING_REGEXPR('@(.+?)@' IN :dados occurrence 2 GROUP 1),'');*/	
	
		IF :orig = 'SPS_BEAS_FTSTMP' THEN
			update SPS_BEAS_FTSTMP set  CONFERIDO = current_timestamp WHERE ID = :buchnrid;
		ELSEIF :orig = 'BEAS_ARBZEIT' THEN
			update BEAS_ARBZEIT set  UDF5=current_timestamp WHERE BUCHNR_ID = :buchnrid;		
		END IF;
		
		SELECT 'Sucesso' FROM DUMMY;
		RETURN;
	END IF;
	
	SELECT 'Nenhuma Ação Encontrada' FROM DUMMY;
	RETURN;
END