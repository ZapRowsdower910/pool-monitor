
<cfhttp url="#form.url#" method="get" result="response">

<cfoutput>#response.fileContent#</cfoutput>