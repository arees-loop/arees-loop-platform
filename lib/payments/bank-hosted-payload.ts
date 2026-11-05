export function makeBankHostedPayload(amountMinor:number,trackId:string,portalId:string,password:string,responseURL:string,errorURL:string){
 if(!Number.isSafeInteger(amountMinor)||amountMinor<=0)throw Error('INVALID_AMOUNT');
 if(!/^\d+$/.test(trackId))throw Error('INVALID_TRACK_ID');
 if(!portalId||!password)throw Error('MISSING_CREDENTIALS');
 for(const url of [responseURL,errorURL])if(new URL(url).protocol!=='https:')throw Error('INVALID_CALLBACK');
 return [{amt:(amountMinor/100).toFixed(2),action:'1',password,id:portalId,currencyCode:'682',trackId,responseURL,errorURL,langid:'ar'}];
}
