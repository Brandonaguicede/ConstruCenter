import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

test('catalog migration, combo persistence, rollback and access control', async () => {
 const db = new PGlite();
 try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
   CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   GRANT USAGE ON SCHEMA auth TO authenticated, anon;`);
  const base = (await readFile('supabase/schema.sql','utf8')).replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '');
  await db.exec(base);
  await db.exec(`INSERT INTO categories(id,name,slug,active) VALUES ('11111111-1111-4111-8111-111111111111','Solar','solar',false);`);
  const migration = await readFile('supabase/admin_catalog_combos.sql','utf8');
  await db.exec(migration);
  await db.exec(migration);
  assert.equal((await db.query('SELECT is_active FROM categories')).rows[0].is_active, false);
  await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
   INSERT INTO brands(id,name,slug,is_active) VALUES ('22222222-2222-4222-8222-222222222222','Marca de prueba','marca-prueba',true);
   INSERT INTO products(id,sku,name,slug,price,category_id,brand_id,stock,is_active) VALUES
   ('33333333-3333-4333-8333-333333333333','PANEL-TEST','Panel de prueba','panel-prueba',250000,'11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222',10,true);`);
  const items = [{product_id:'33333333-3333-4333-8333-333333333333',quantity:2}];
  const save = (id,name,active,rows=items) => db.query('SELECT save_energy_combo($1,$2,$3,$4,$5,$6) AS id',[id,name,'Descripción','["Beneficio"]',active,JSON.stringify(rows)]);
  const id = (await save(null,'Combo de prueba',true)).rows[0].id;
  assert.equal((await db.query('SELECT quantity FROM energy_combo_products')).rows[0].quantity,2);
  assert.equal((await db.query('SELECT stock FROM products')).rows[0].stock,10);
  await assert.rejects(save(id,'Cambio inválido',true,[{...items[0],quantity:0}]));
  await assert.rejects(save(id,'Duplicados',true,[items[0],items[0]]));
  await assert.rejects(save(id,'Cantidad decimal',true,[{...items[0],quantity:1.5}]));
  await db.exec(`RESET ROLE; CREATE FUNCTION test_reject_item() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.quantity=7 THEN RAISE EXCEPTION 'fallo simulado'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER test_reject BEFORE INSERT ON energy_combo_products FOR EACH ROW EXECUTE FUNCTION test_reject_item(); SET ROLE authenticated;`);
  await assert.rejects(save(id,'Debe revertirse',false,[{...items[0],quantity:7}]));
  assert.equal((await db.query('SELECT name FROM energy_combos')).rows[0].name,'Combo de prueba');
  assert.equal((await db.query('SELECT quantity FROM energy_combo_products')).rows[0].quantity,2);
  await assert.rejects(db.query('DELETE FROM products WHERE id=$1',[items[0].product_id]));
  await db.exec(`RESET ROLE; SET ROLE anon; SET request.jwt.claim.sub='';`);
  assert.equal((await db.query('SELECT * FROM energy_combos')).rows.length,1);
  await assert.rejects(save(null,'Sin permisos',true));
  await db.exec(`RESET ROLE; SET ROLE authenticated; SET request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';`);
  await save(id,'Borrador',false);
  await db.exec('RESET ROLE; SET ROLE anon;');
  assert.equal((await db.query('SELECT * FROM energy_combos')).rows.length,0);
  assert.equal((await db.query('SELECT * FROM energy_combo_products')).rows.length,0);
  await db.exec('RESET ROLE; SET ROLE authenticated;');
  await db.query('DELETE FROM energy_combos WHERE id=$1',[id]);
  assert.equal((await db.query('SELECT * FROM energy_combo_products')).rows.length,0);
  assert.equal((await db.query('SELECT * FROM products')).rows.length,1);
 } finally { await db.close(); }
});
