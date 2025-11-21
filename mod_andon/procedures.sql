ALTER PROCEDURE sp_sps_beas_modandon_getaux(
	IN acao nvarchar(50)
	,IN dados Nvarchar(5000)
)AS
BEGIN

	IF :acao = 'getDados' THEN
	
		notasEntrada=SELECT 
				T2."U_SKILL_CardCode" "CardCode"
				,T0."Serial"
				,T0."DocDate"
				,ifnull(T3."TaxId0",'SEM CNPJ')||' - '||"CardCode"||'-'||"CardName" "ORIGEM" 
				,(SELECT SUM("Quantity") FROM PCH1 A0 WHERE A0."DocEntry"=T0."DocEntry" and "Dscription" = 'PERFIS AL DIVERSOS') "QtdeEntrada"   
				,(SELECT MIN("unitMsr") FROM PCH1 A0 WHERE A0."DocEntry"=T0."DocEntry" and "Dscription" = 'PERFIS AL DIVERSOS') "umEntrada"
				,T1."ItemCode" 
				,T0."CreateDate"
				,T0."CreateTS"
				,'' "Acabamento"
			FROM OPCH T0
				INNER JOIN (SELECT DISTINCT "DocEntry","WhsCode","ItemCode" FROM PCH1 WHERE "ItemCode" like 'PC.%') T1 ON T1."DocEntry"=T0."DocEntry"
				INNER JOIN OWHS T2 ON T2."WhsCode" = T1."WhsCode"
				INNER JOIN PCH12 T3 ON T3."DocEntry"=T0."DocEntry"  
			WHERE 
				T0."CANCELED"='N'
			--AND T0."Serial"=4524 
			;
	

			
		SELECT 
			"DocEntry_RMIND"
			,LEFT("U_CardName",20) "Nome"
			,"UM"
			,"Data1"
			,DESCRICAO
			,"Data2"
			,"Data3"
			,"SlpName"
			,"Data4"
			,"U_Acabamento"
		FROM
		(SELECT 
			DISTINCT
			TO_VARCHAR(T0."Serial_RMIND"||'('||T0."DocEntry_RMIND"||')') "DocEntry_RMIND"
			,T1."U_CardName" 
			,TO_VARCHAR(CAST(ROUND(T1."U_TotalEntrada",2) AS DECIMAL(28,2)))||' '||T1."U_UMEntrada"  "UM"
			,TO_VARCHAR(T5."CreateDate",'dd/MM/yyyy')||' '||TO_VARCHAR(TO_TIME(LPAD(T5."CreateTS",6,'0'),'HH24miss'),'HH24:mi') "Data1"
			,T2.DESCRICAO 
			,TO_VARCHAR(T0.STATUS_DATE,'yyyy/MM/dd HH24:mi') "Data2"
			,TO_VARCHAR(T0.STATUS_DATE,'dd/MM/yyyy HH24:mi') "Data3"
			,T4."SlpName"
			,TO_VARCHAR(T5."CreateDate",'yyyy/MM/dd')||' '||TO_VARCHAR(TO_TIME(LPAD(T5."CreateTS",6,'0'),'HH24miss'),'HH24:mi') "Data4"
			,T1."U_Acabamento"
		FROM SPS_STATUS_PEDIDOS T0
			INNER JOIN "@SPS_RMIND_CAB" T1 ON T1."DocEntry"  = T0."DocEntry_RMIND" 
			INNER JOIN SPS_STATUS_PEDIDOS_STATUS T2 ON T2.STATUS =T0.STATUS 
			LEFT JOIN OCRD T3 ON T3."CardCode"=T1."U_CardCode"
			LEFT JOIN OSLP T4 ON T4."SlpCode" = T3."SlpCode"
			LEFT JOIN :notasEntrada  T5 ON T5."Serial" = T0."Serial_RMIND" AND T5."CardCode"=T1."U_CardCode"
		WHERE T0."Serial_RMIND" IS NOT NULL
		UNION ALL
		SELECT
			DISTINCT TO_VARCHAR(T0."Serial")
			,T4."CardName"
			,CAST(ROUND(ifnull(T0."QtdeEntrada",0),2) AS DECIMAL(28,2))||' '||T0."umEntrada"
			,TO_VARCHAR(T0."CreateDate",'dd/MM/yyyy')||' '||TO_VARCHAR(TO_TIME(LPAD(T0."CreateTS",6,'0'),'HH24miss'),'HH24:mi') "Data"
			,'Nota'
			,TO_VARCHAR(T0."CreateDate",'yyyy/MM/dd')||' '||TO_VARCHAR(TO_TIME(LPAD(T0."CreateTS",6,'0'),'HH24miss'),'HH24:mi')
			,TO_VARCHAR(T0."CreateDate",'dd/MM/yyyy')||' '||TO_VARCHAR(TO_TIME(LPAD(T0."CreateTS",6,'0'),'HH24miss'),'HH24:mi')
			,T6."SlpName"
			,TO_VARCHAR(T0."CreateDate",'yyyy/MM/dd')||' '||TO_VARCHAR(TO_TIME(LPAD(T0."CreateTS",6,'0'),'HH24miss'),'HH24:mi') "Data4"
			,'' "Acabamento"
		FROM :notasEntrada T0
			LEFT JOIN (SELECT 
					"U_CardCode"
					,"U_Serial"
					,SUM("U_TotalUtilEntrada") "UtilQtdeEntrada"
				FROM "@SPS_RMIND_CAB" 
				WHERE "U_Status" not in (9) 
				GROUP BY "U_CardCode"
					,"U_Serial") T3 ON T3."U_Serial" = T0."Serial" and T3."U_CardCode"=T0."CardCode"
			INNER JOIN OCRD T4 ON T4."CardCode"=T0."CardCode"
			LEFT JOIN CRD7 T5 ON T5."CardCode" = T4."CardCode" and T5."Address"=''
			LEFT JOIN OSLP T6 ON T6."SlpCode" = T4."SlpCode" 
			INNER JOIN OITM T7 ON T7."ItemCode" = T0."ItemCode" 
		WHERE (T4."CardType" IN ('C', 'L') 
					AND T4."validFor" = 'Y') 
				and (
					ROUND(ifnull(T0."QtdeEntrada",0)-ifnull(T3."UtilQtdeEntrada",0),0) > 0
				)
				AND TO_VARCHAR(T0."Serial") NOT IN (SELECT "U_Complemento" FROM "@SPS_RMIND_CAB" WHERE "U_Complemento" IS NOT NULL )
				AND TO_VARCHAR(T0."Serial") NOT IN (SELECT "U_NFComplementar" FROM "@SPS_RMIND_CAB" WHERE "U_NFComplementar" IS NOT NULL )
				AND T3."U_Serial" IS NULL --ANULA QUANDO JA EXISTE
		UNION ALL
		
		
		SELECT 
			DISTINCT
			TO_VARCHAR(T0."U_Serial")||'('||T0."DocEntry"||')'
			,T0."U_CardName"
			,TO_VARCHAR(CAST(ROUND(T0."U_TotalEntrada",2) AS DECIMAL(28,2)))||' '||T0."U_UMEntrada" 
			,TO_VARCHAR(T5."CreateDate",'dd/MM/yyyy')||' '||TO_VARCHAR(TO_TIME(LPAD(T5."CreateTS",6,'0'),'HH24miss'),'HH24:mi')
			,CASE WHEN Z2.DESCRICAO = 'Novo' THEN 'Nota' ELSE Z2.DESCRICAO END 
			,TO_VARCHAR(T0."UpdateDate",'yyyy/MM/dd')||' '||TO_VARCHAR(TO_TIME(LPAD(T0."UpdateTime",6,'0'),'HH24miss'),'HH24:mi')
			,TO_VARCHAR(T0."UpdateDate",'dd/MM/yyyy')||' '||TO_VARCHAR(TO_TIME(LPAD(T0."UpdateTime",6,'0'),'HH24miss'),'HH24:mi')
			,T4."SlpName"
			,TO_VARCHAR(T5."CreateDate",'yyyy/MM/dd')||' '||TO_VARCHAR(TO_TIME(LPAD(T5."CreateTS",6,'0'),'HH24miss'),'HH24:mi')
			,T0."U_Acabamento"
		FROM "@SPS_RMIND_CAB" T0
			LEFT JOIN ORDR T2 ON T2."U_SPS_RmInd_Entry" = T0."DocEntry"
			INNER JOIN "CUFD" Z0 ON Z0."TableID" = '@SPS_RMIND_CAB' AND Z0."AliasID" = 'Status'
			INNER JOIN "UFD1" Z1 ON Z1."FieldID" = Z0."FieldID" AND Z1."TableID" = Z0."TableID" AND Z1."FldValue"=T0."U_Status"
			INNER JOIN SPS_STATUS_PEDIDOS_STATUS Z2 ON Z2.STATUS=UPPER(Z1."Descr")
			LEFT JOIN OCRD T3 ON T3."CardCode"=T0."U_CardCode"
			LEFT JOIN OSLP T4 ON T4."SlpCode" = T3."SlpCode"
			LEFT JOIN :notasEntrada  T5 ON T5."Serial" = T0."U_Serial" AND T5."CardCode"=T0."U_CardCode"		
		WHERE NOT EXISTS(SELECT * FROM SPS_STATUS_PEDIDOS A0 WHERE A0."DocEntry_RMIND" = T0."DocEntry")
			AND NOT EXISTS(SELECT * FROM SPS_STATUS_PEDIDOS_HIST A0 WHERE A0."DocEntry_RMIND" = T0."DocEntry")
		--AND "U_Serial" <> '82111'
		
		--BALANCA
		UNION ALL
		SELECT 
			T1."Nota"||'(R:'||T0.ID||')'
			,T1."Cliente"
			,IFNULL(T1."Peso",'0')||' KG'
			,TO_VARCHAR(T0."CreateDate",'dd/MM/yyyy HH24:mi') "Data1"
			,'Balança'
			,TO_VARCHAR(T0."CreateDate",'yyyy/MM/dd HH24:mi') "Data2"
			,TO_VARCHAR(T0."CreateDate",'dd/MM/yyyy HH24:mi') "Data3"
			,'Nenhum Vendedor' "SlpName"
			,TO_VARCHAR(T0."CreateDate",'yyyy/MM/dd HH24:mi') "Data4"
			,'INDEF'
		FROM SPS_BALANCA_CAB T0
		LEFT JOIN SPS_BALANCA_LIN T1 ON T1.ID = T0.ID 
		LEFT JOIN OPCH T2 ON TO_VARCHAR(T2."Serial") = T1."Nota" AND T2."CreateDate" >= TO_DATE(T0."CreateDate")
		WHERE "Removido" = 'N' AND T2."DocEntry" IS NULL
			AND T1."Ignorar"=0
		
		)		
		WHERE "Data4" >= '2024/10/07'
		ORDER BY 9 ASC
		;
		RETURN;
	END IF;
	
	IF :acao = 'ignorarNF' THEN
	
		DECLARE id nvarchar(50) := SUBSTR_REGEXPR('@(.+?)@' IN :dados OCCURRENCE 1 GROUP 1);
		
		UPDATE T1 SET "Ignorar" = 1 FROM SPS_BALANCA_LIN T1 WHERE T1."Nota"||'(R:'||T1.ID||')' = :id;
	
		SELECT 'Sucesso' FROM DUMMY;
	END IF;
	SELECT 'Nenhuma Ação Encontrada' FROM DUMMY;
END
--