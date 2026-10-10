import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import pg from 'pg';
// An explicit isolated database is mandatory. Never fall back to .env.local or production.
const target=new URL(process.env.DATABASE_URL||'http://missing');
if(!['localhost','127.0.0.1'].includes(target.hostname)||target.pathname!=='/arees_ci')throw new Error('Database tests require loopback DATABASE_URL with database arees_ci');
const pool=new pg.Pool({connectionString:target.href,connectionTimeoutMillis:5000,query_timeout:10000});
test.after(()=>pool.end());
test('pending renewal partial unique indexes exist for partners and guides',async()=>{
 const {rows}=await pool.query(`SELECT indexname,indexdef FROM pg_indexes WHERE indexname IN ('LicenseRenewalRequest_one_pending_per_license','GuideLicenseRenewal_one_pending_per_application')`);
 assert.equal(rows.length,2);for(const row of rows)assert.match(row.indexdef,/UNIQUE.*WHERE.*UNDER_REVIEW/);
});
for(const [table,entityField] of [['LicenseRenewalRequest','licenseId'],['GuideLicenseRenewal','applicationId']]){
 test(`${table} permits history and rejects duplicate pending requests`,async()=>{
  const client=await pool.connect();const entity=randomUUID();
  const insert=async(status)=>{
   const columns=table==='LicenseRenewalRequest'?['id','licenseId','partnerId','submittedById','requestedExpiryDate','documentPath','status','updatedAt']:['id','applicationId','userId','licenseNumber','requestedExpiryDate','documentPath','status','updatedAt'];
   const values=[randomUUID(),entity,randomUUID(),randomUUID(),new Date('2099-01-01'),'test/doc',status,new Date()];
   return client.query(`INSERT INTO "${table}" (${columns.map(c=>'"'+c+'"').join(',')}) VALUES (${values.map((_,i)=>'$'+(i+1)).join(',')})`,values);
  };
  try{
   await client.query('BEGIN');await insert('REJECTED');await insert('APPROVED');await insert('UNDER_REVIEW');
   await client.query('SAVEPOINT duplicate_check');
   await assert.rejects(insert('UNDER_REVIEW'),error=>error.code==='23505');
   await client.query('ROLLBACK TO SAVEPOINT duplicate_check');
   const {rows}=await client.query(`SELECT count(*)::int AS n FROM "${table}" WHERE "${entityField}"=$1`,[entity]);assert.equal(rows[0].n,3);
  }finally{await client.query('ROLLBACK');client.release()}
 });
}
test('two simultaneous partner renewals cannot both remain pending',{skip:process.env.AREES_EMBEDDED_POSTGRES==='1'},async()=>{
 const first=await pool.connect(),second=await pool.connect(),entity=randomUUID();
 const sql='INSERT INTO "LicenseRenewalRequest" ("id","licenseId","partnerId","submittedById","requestedExpiryDate","documentPath","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7)';
 const values=()=>[randomUUID(),entity,'test-partner','test-user',new Date('2099-01-01'),'test/doc',new Date()];
 try{
  await first.query('BEGIN');await second.query('BEGIN');await second.query("SET LOCAL statement_timeout='5s'");
  await first.query(sql,values());
  const blocked=assert.rejects(second.query(sql,values()),error=>error.code==='23505');
  await first.query('COMMIT');await blocked;
 }finally{
  await first.query('ROLLBACK');await second.query('ROLLBACK');
  await first.query('DELETE FROM "LicenseRenewalRequest" WHERE "licenseId"=$1',[entity]);
  first.release();second.release();
 }
});
