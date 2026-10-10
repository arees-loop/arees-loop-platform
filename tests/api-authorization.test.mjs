import test from 'node:test';
import assert from 'node:assert/strict';
import {NextRequest} from 'next/server';
const session=(permissions=[])=>({user:{id:'admin',role:'ADMIN',status:'ACTIVE',adminPermissions:permissions}});
globalThis.areesTest={session:session(),prisma:new Proxy({}, {get(){throw new Error('Unauthorized database access')}})};
const routes=[
 ['../app/api/admin/license-renewals/route.ts','GET'],['../app/api/admin/license-renewals/route.ts','PATCH'],
 ['../app/api/admin/guide-license-renewals/route.ts','GET'],['../app/api/admin/guide-license-renewals/route.ts','PATCH'],
 ['../app/api/admin/license-renewal-queue/route.ts','GET'],
 ['../app/api/admin/license-renewals/document/route.ts','GET'],['../app/api/admin/guide-license-renewals/document/route.ts','GET'],
 ['../app/api/admin/guides/route.ts','GET'],['../app/api/admin/guides/route.ts','PATCH'],['../app/api/admin/guides/document/route.ts','GET'],
 ['../app/api/admin/services/route.ts','GET'],['../app/api/admin/services/[id]/decision/route.ts','POST'],
 ['../app/api/admin/partners/route.ts','GET'],['../app/api/admin/partners/[id]/decision/route.ts','POST'],
 ['../app/api/admin/rewards/route.ts','GET'],['../app/api/diagnostics/loyalty-db/route.ts','GET'],
];
for(const [path,method] of routes){
 test(`API denies unprivileged admin ${path}/${method}`,async()=>{
  globalThis.areesTest.session=session();
  const route=await import(path);
  const request=new NextRequest('http://localhost/api/test',{method:method==='PATCH'?'PATCH':method==='POST'?'POST':'GET'});
  const response=await route[method](request,{params:Promise.resolve({id:'x'})});
  assert.ok([401,403].includes(response.status),`unexpected status ${response.status}`);
 });
}
const partnerRenewals=await import('../app/api/admin/license-renewals/route.ts');
function request(approved=true){return new Request('http://localhost/api/admin/license-renewals',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id:'renewal',approved,notes:'تم فحص المستند والتحقق من بيانات الترخيص',verifiedDocument:true})});}
function fixture(status='VERIFIED',partnerStatus='ACTIVE',expiry='2026-10-01',requested='2099-10-01'){
 const renewal={id:'renewal',status:'UNDER_REVIEW',licenseId:'license',partnerId:'partner',requestedExpiryDate:new Date(requested),documentPath:'doc'};
 const license={id:'license',partnerId:'partner',status,expiryDate:new Date(expiry),partner:{status:partnerStatus}};
 const writes=[];
 const tx={licenseRenewalRequest:{findUnique:async()=>renewal,updateMany:async({data})=>{writes.push(['request',data]);return {count:1}}},license:{findFirst:async()=>license,updateMany:async({where,data})=>{writes.push(['license',data,where]);return {count:1}}},auditLog:{create:async()=>writes.push(['audit'])}};
 globalThis.areesTest={session:session(['PARTNER_REQUESTS']),prisma:{$transaction:async(fn)=>fn(tx),licenseRenewalRequest:{findUnique:async()=>null}}};
 return {writes,renewal,license,tx};
}
for(const [status,partnerStatus,expiry,requested] of [['SUSPENDED','ACTIVE','2026-10-01','2099-10-01'],['REJECTED','ACTIVE','2026-10-01','2099-10-01'],['VERIFIED','SUSPENDED','2026-10-01','2099-10-01'],['VERIFIED','ACTIVE','2099-10-01','2099-09-01']]){
 test(`renewal API cannot revive or shorten ${status}/${partnerStatus}/${requested}`,async()=>{const f=fixture(status,partnerStatus,expiry,requested);assert.equal((await partnerRenewals.PATCH(request())).status,409);assert.deepEqual(f.writes,[])});
}
test('approved renewal conditionally updates license and records review/audit',async()=>{const f=fixture();assert.equal((await partnerRenewals.PATCH(request())).status,200);assert.deepEqual(f.writes.map(x=>x[0]),['license','request','audit']);assert.equal(f.writes[0][2].status,'VERIFIED');assert.deepEqual(f.writes[0][2].expiryDate,f.license.expiryDate)});
test('rejected renewal never updates license',async()=>{const f=fixture('SUSPENDED');assert.equal((await partnerRenewals.PATCH(request(false))).status,200);assert.deepEqual(f.writes.map(x=>x[0]),['request','audit']);assert.equal(f.writes[0][1].status,'REJECTED')});
test('already reviewed renewal cannot be decided again',async()=>{const f=fixture();f.renewal.status='APPROVED';assert.equal((await partnerRenewals.PATCH(request())).status,409);assert.deepEqual(f.writes,[])});
const serviceDecision=await import('../app/api/admin/services/[id]/decision/route.ts');
for(const count of [0,1]){
 test(`service publication handles mutation-time license check count ${count}`,async()=>{
  let predicate, audited=false;
  const service={id:'service',partnerId:'partner',licenseId:'license',status:'UNDER_REVIEW',partner:{status:'ACTIVE',members:[]},nameAr:'test',finalPrice:10};
  const tx={service:{updateMany:async({where})=>{predicate=where;return {count}},findUniqueOrThrow:async()=>service},auditLog:{create:async()=>{audited=true}}};
  globalThis.areesTest={session:session(['CONTENT_EXPERIENCES']),prisma:{service:{findUnique:async()=>service},license:{findFirst:async()=>({id:'license'})},$transaction:async(fn)=>fn(tx)}};
  const response=await serviceDecision.POST(new NextRequest('http://localhost/test',{method:'POST',body:JSON.stringify({action:'APPROVE'})}),{params:Promise.resolve({id:'service'})});
  assert.equal(response.status,count?200:409);assert.equal(audited,Boolean(count));assert.equal(predicate.partner.status,'ACTIVE');assert.equal(predicate.license.is.status,'VERIFIED');
 });
}
const media=await import('../app/api/media/route.ts');
test('unpublished service image cannot be fetched anonymously',async()=>{
 globalThis.areesTest={session:null,prisma:{service:{findFirst:async()=>null}}};
 assert.equal((await media.GET(new NextRequest('http://localhost/api/media?pathname=services%2Fother%2Fphoto.jpg'))).status,404);
});
test('employee cannot fetch another member private preview',async()=>{
 globalThis.areesTest={session:{user:{id:'employee',role:'PARTNER_ADMIN',status:'ACTIVE',adminPermissions:[]}},prisma:{service:{findFirst:async()=>null},partnerMember:{findFirst:async()=>({permissions:{role:'EMPLOYEE'},partner:{status:'ACTIVE'}})}}};
 assert.equal((await media.GET(new NextRequest('http://localhost/api/media?pathname=services%2Fother%2Fphoto.jpg'))).status,404);
});
test('media rejects traversal before database or blob access',async()=>{
 globalThis.areesTest={session:null,prisma:new Proxy({}, {get(){throw new Error('Unexpected DB read')}})};
 assert.equal((await media.GET(new NextRequest('http://localhost/api/media?pathname=services%2F..%2Fprivate'))).status,404);
});
test('active partner logo is served only when its stored URL matches the requested private path',async()=>{
 let lookedUpUrl;
 globalThis.areesTest={session:null,prisma:{partner:{findFirst:async({where})=>{lookedUpUrl=where.logoUrl;return {id:'active-partner'}}}},blobGet:async()=>({statusCode:200,blob:{contentType:'image/png'},stream:new ReadableStream({start(controller){controller.enqueue(new Uint8Array([1]));controller.close()}})})};
 const response=await media.GET(new NextRequest('http://localhost/api/media?pathname=partners%2Fpartner-id%2Flogo%2Fpartner.png'));
 assert.equal(response.status,200);assert.equal(lookedUpUrl,'/api/media?pathname=partners%2Fpartner-id%2Flogo%2Fpartner.png');assert.equal(response.headers.get('cache-control'),'private, no-store');
});
test('unknown partner logo is denied without reading Blob',async()=>{
 globalThis.areesTest={session:null,prisma:{partner:{findFirst:async()=>null}},blobGet:async()=>{throw new Error('Unexpected blob read')}};
 assert.equal((await media.GET(new NextRequest('http://localhost/api/media?pathname=partners%2Fother%2Flogo%2Fphoto.png'))).status,404);
});
const imageUpload=await import('../app/api/partner/services/images/route.ts');
test('ordinary customer cannot upload service images',async()=>{
 globalThis.areesTest={session:{user:{id:'customer'}},prisma:{partnerMember:{findFirst:async()=>null}}};
 assert.equal((await imageUpload.POST(new NextRequest('http://localhost/upload',{method:'POST'}))).status,403);
});
test('active partner employee without service permission cannot upload images',async()=>{
 globalThis.areesTest={session:{user:{id:'employee'}},prisma:{partnerMember:{findFirst:async()=>({permissions:{role:'EMPLOYEE'},partner:{status:'ACTIVE'}})}}};
 assert.equal((await imageUpload.POST(new NextRequest('http://localhost/upload',{method:'POST'}))).status,403);
});
