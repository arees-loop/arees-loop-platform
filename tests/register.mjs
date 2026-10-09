import {registerHooks} from 'node:module';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
const root=new URL('../',import.meta.url);
const mocks={
 '@/lib/session':'export async function getCurrentSession(){return globalThis.areesTest.session}',
 '@/lib/prisma':'export const prisma=new Proxy({}, {get:(_,key)=>globalThis.areesTest.prisma[key]})',
 '@/lib/notifications/email':'export async function sendEmail(){return {sent:true}}; export function getAdminNotificationEmails(){return []}',
 '@/lib/partners/renewal-ai-review':'export async function reviewRenewalWithAi(){return {outcome:"MANUAL_REVIEW",summary:"test",issues:[],model:"test"}}',
 '@vercel/blob':'export async function get(){throw new Error("Unexpected blob access")}; export async function put(){throw new Error("Unexpected blob write")}; export async function del(){throw new Error("Unexpected blob deletion")}',
};
registerHooks({
 resolve(specifier,context,next){
  if(process.env.AREES_TEST_MOCKS==='1'&&mocks[specifier])return {url:'data:text/javascript,'+encodeURIComponent(mocks[specifier]),shortCircuit:true};
  if(specifier==='next/server')return next('next/server.js',context);
  if(specifier.startsWith('@/'))specifier=new URL(specifier.slice(2),root).href;
  if(specifier.startsWith('file:')||specifier.startsWith('.')){
   const url=new URL(specifier,context.parentURL||root);
   if(!existsSync(url)&&existsSync(fileURLToPath(url)+'.ts'))return {url:pathToFileURL(fileURLToPath(url)+'.ts').href,shortCircuit:true};
  }
  return next(specifier,context);
 },
 load(url,context,next){
  if(url.startsWith('file:')&&url.endsWith('.ts'))return {format:'module',source:ts.transpileModule(readFileSync(new URL(url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,shortCircuit:true};
  return next(url,context);
 },
});
