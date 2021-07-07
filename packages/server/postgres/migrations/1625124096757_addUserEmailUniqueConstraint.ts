import {MigrationBuilder, ColumnDefinitions} from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createIndex('User', ['email'], {
    name: 'User_email_index',
    unique: true,
    concurrently: true
  })
  pgm.sql(`
      ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE USING INDEX "User_email_index";
   `)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
     ALTER TABLE "User"
       DROP CONSTRAINT "User_email_key";
   `)
}
