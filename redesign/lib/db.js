import 'server-only';
import pg from 'pg';
let pool;
export function database(){
  if(!process.env.DATABASE_URL) throw new Error('Database unavailable');
  if(!pool) pool=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true},max:3});
  return pool;
}
