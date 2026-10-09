import test from 'node:test';
import assert from 'node:assert/strict';
import {licenseValidity,canApproveLicenseRenewal} from '../lib/license-validity.ts';
import {hasAdminPermission} from '../lib/admin-permissions.ts';
import {partnerPermissionPreset,canManagePartnerServices,canManagePartnerTeam,canViewPartnerFinances,canViewPartnerBookings} from '../lib/partner-permissions.ts';
import {sanitizeServiceHtml,escapeHtml} from '../lib/service-html.ts';
import {matchesLicenseDocument} from '../lib/license-document.ts';
import {serviceEligibilityWhere} from '../lib/services/eligibility.ts';
const now=new Date('2026-10-10T21:00:00Z');
for(const [expiry,state,days] of [['2026-10-10','EXPIRING',0],['2026-10-09','EXPIRED',-1],['2026-10-20','EXPIRING',10],['2026-10-21','VALID',11],[null,'UNKNOWN',null],['bad','UNKNOWN',null]]){
 test(`license validity ${expiry}`,()=>assert.deepEqual(licenseValidity(expiry,now),{state,daysRemaining:days}));
}
for(const status of ['VERIFIED','EXPIRED','SUSPENDED','REJECTED','PENDING']){
 test(`renewal preserves ${status} restrictions`,()=>assert.equal(canApproveLicenseRenewal({status,expiryDate:'2026-10-09'},new Date('2026-10-20'),'ACTIVE',now),['VERIFIED','EXPIRED'].includes(status)));
}
for(const [expiry,partner] of [['2026-10-09','ACTIVE'],['2026-10-08','ACTIVE'],['2026-10-20','SUSPENDED'],['bad','ACTIVE']]){
 test(`renewal rejects stale date or inactive partner ${expiry}/${partner}`,()=>assert.equal(canApproveLicenseRenewal({status:'VERIFIED',expiryDate:'2026-10-09'},new Date(expiry),partner,now),false));
}
test('expired renewal can extend to today',()=>assert.equal(canApproveLicenseRenewal({status:'EXPIRED',expiryDate:'2026-10-09'},new Date('2026-10-10'),'ACTIVE',now),true));
for(const [role,permissions,allowed] of [['ADMIN',[],false],['ADMIN',['BOOKINGS'],false],['ADMIN',['PARTNER_REQUESTS'],true],['SUPER_ADMIN',null,true],['CUSTOMER',['PARTNER_REQUESTS'],false]]){
 test(`admin permission ${role}/${permissions}`,()=>assert.equal(hasAdminPermission({role,adminPermissions:permissions,status:'ACTIVE'},'PARTNER_REQUESTS'),allowed));
}
test('inactive super admin denied',()=>assert.equal(hasAdminPermission({role:'SUPER_ADMIN',status:'PENDING_VERIFICATION',adminPermissions:[]},'PARTNER_REQUESTS'),false));
for(const invalid of [null,[],{},'OWNER',{role:'INVALID',services:{manage:true},finances:{view:true}}]){
 test(`unclassified partner denied ${JSON.stringify(invalid)}`,()=>{
  for(const check of [canManagePartnerServices,canManagePartnerTeam,canViewPartnerFinances,canViewPartnerBookings])assert.equal(check(invalid),false);
 });
}
test('owner has sensitive capabilities',()=>{const p=partnerPermissionPreset('OWNER');assert.ok(canManagePartnerTeam(p)&&canManagePartnerServices(p)&&canViewPartnerFinances(p));});
test('manager default cannot see finances or change team',()=>{const p=partnerPermissionPreset('MANAGER');assert.ok(canManagePartnerServices(p)&&canViewPartnerBookings(p));assert.equal(canManagePartnerTeam(p),false);assert.equal(canViewPartnerFinances(p),false);});
test('employee delegation and explicit revocation are respected',()=>{assert.equal(canManagePartnerServices({...partnerPermissionPreset('EMPLOYEE'),services:{manage:true}}),true);assert.equal(canManagePartnerServices({...partnerPermissionPreset('MANAGER'),services:{manage:false}}),false);});
for(const payload of ['<script>alert(1)</script><p onclick="alert(1)">text</p>','<img src=x onerror=alert(1)>','<a href="javascript:alert(1)">click</a>','<svg onload=alert(1)><script>alert(2)</script></svg>','<div style="background:url(javascript:alert(1))">test</div>']){
 test(`HTML sanitizer rejects active content ${payload.slice(0,24)}`,()=>assert.doesNotMatch(sanitizeServiceHtml(payload),/<script|onerror|onclick|onload|javascript:|<svg|background:/i));
}
test('HTML sanitizer preserves program sections and formatting',()=>assert.equal(sanitizeServiceHtml('<div data-arees-section="includes" style="display:none">سكن</div><p><strong>جولة</strong></p>'),'<div data-arees-section="includes" style="display:none">سكن</div><p><strong>جولة</strong></p>'));
test('email HTML escapes input',()=>assert.equal(escapeHtml('<b>"&\'</b>'),'&lt;b&gt;&quot;&amp;&#39;&lt;/b&gt;'));
for(const [mime,bytes] of [['application/pdf',[37,80,68,70,45]],['image/png',[137,80,78,71,13,10,26,10]],['image/jpeg',[255,216,255]],['image/webp',[82,73,70,70,0,0,0,0,87,69,66,80]]]){
 test(`valid document ${mime}`,()=>assert.equal(matchesLicenseDocument(new Uint8Array(bytes),mime),true));
 test(`spoofed document ${mime}`,()=>assert.equal(matchesLicenseDocument(new TextEncoder().encode('<html>bad</html>'),mime),false));
}
test('bookability predicate requires active partner, verified license, including today',()=>assert.deepEqual(serviceEligibilityWhere(now),{partner:{status:'ACTIVE'},license:{is:{status:'VERIFIED',expiryDate:{gte:new Date('2026-10-10T00:00:00Z')}}}}));
