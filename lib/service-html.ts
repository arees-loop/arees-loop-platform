import sanitizeHtml from "sanitize-html";
/** A small rich-text allowlist. Preserve the editor's hidden program sections, never scripts or URLs. */
export function sanitizeServiceHtml(value:unknown):string {
 if(typeof value!=="string")return "";
 return sanitizeHtml(value,{
  allowedTags:["p","br","strong","b","em","i","u","s","ul","ol","li","h2","h3","h4","blockquote","div","span"],
  allowedAttributes:{div:["data-arees-section","style"],span:["style"],p:["style"]},
  allowedStyles:{"*":{"text-align":[/^left$/, /^right$/, /^center$/],"display":[/^none$/]}},
 });
}
export function escapeHtml(value:string):string {
 return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
}
