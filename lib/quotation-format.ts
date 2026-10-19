/**
 * Quotation-only VAT disclosure.
 * Transport can be zero-rated; never classify a quotation without an explicit
 * verified administrative choice. The customer's accepted gross price is fixed.
 */
export type QuoteVatTreatment="STANDARD_15_INCLUDED"|"ZERO_RATED_INTERNATIONAL"|"UNDETERMINED";
export const vatTreatments:QuoteVatTreatment[]=["STANDARD_15_INCLUDED","ZERO_RATED_INTERNATIONAL","UNDETERMINED"];
export function isQuoteVatTreatment(value:unknown):value is QuoteVatTreatment{
 return typeof value==="string"&&vatTreatments.includes(value as QuoteVatTreatment);
}
export function vatBreakdown(totalSar:number,treatment:QuoteVatTreatment){
 const gross=Math.round(totalSar*100)/100;
 if(!Number.isFinite(gross)||gross<0)return {net:null,vat:null,rate:null,total:0};
 if(treatment==="ZERO_RATED_INTERNATIONAL")return {net:gross,vat:0,rate:0,total:gross};
 if(treatment==="STANDARD_15_INCLUDED"){
   const net=Math.round(gross/1.15*100)/100;
   return {net,vat:Math.round((gross-net)*100)/100,rate:15,total:gross};
 }
 return {net:null,vat:null,rate:null,total:gross};
}
export function bilingualDate(date:Date|string|null|undefined):{gregorian:string;hijri:string}{
 if(!date)return {gregorian:"غير محدد",hijri:"غير محدد"};
 const parsed=date instanceof Date?date:new Date(date);
 if(Number.isNaN(parsed.getTime()))return {gregorian:"غير محدد",hijri:"غير محدد"};
 const opts: Intl.DateTimeFormatOptions={year:"numeric",month:"long",day:"numeric",timeZone:"UTC"};
 return {
  gregorian:new Intl.DateTimeFormat("ar-SA-u-ca-gregory",opts).format(parsed),
  hijri:new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura",opts).format(parsed),
 };
}
export function sar(value:number){return new Intl.NumberFormat("en-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(value)+" SAR";}
