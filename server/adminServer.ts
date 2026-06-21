import { Application, Router } from '@oak/oak'
import { DB } from 'sqlite'
import { userInfoMainDb } from './db.ts'
import { createUser } from '@/utils/userManagement/createUser.ts'

const KNOWN_TABLES = [
    'buildings', 'equips', 'fleets', 'heroes',
    'illustrate_list', 'interaction_items', 'land_list', 'vow_info'
]

function getPlayerDbPath(uname: string): string {
    return `./playerData/${uname}.db`
}

function getUserById(id: number): { id: number; uname: string; secretary_id: number } | null {
    const rows = userInfoMainDb.query<[number, string, number]>(
        'SELECT id, uname, secretary_id FROM user_info WHERE id = ?',
        [id]
    )
    if (rows.length === 0) return null
    return { id: rows[0][0], uname: rows[0][1], secretary_id: rows[0][2] }
}

function openPlayerDb(uname: string): DB | null {
    try {
        return new DB(getPlayerDbPath(uname))
    } catch {
        return null
    }
}

function rejectUnknownTable(ctx: any, name: string): boolean {
    if (!KNOWN_TABLES.includes(name)) {
        ctx.response.status = 400
        ctx.response.body = { error: 'Unknown table' }
        return true
    }
    return false
}

const router = new Router()

// --- Users ---

router.get('/api/users', (ctx) => {
    const rows = userInfoMainDb.query<[number, string, number]>(
        'SELECT id, uname, secretary_id FROM user_info'
    )
    ctx.response.body = rows.map(([id, uname, secretary_id]) => ({ id, uname, secretary_id }))
})

router.get('/api/users/:id', (ctx) => {
    const user = getUserById(Number(ctx.params.id))
    if (!user) { ctx.response.status = 404; ctx.response.body = { error: 'User not found' }; return }
    ctx.response.body = user
})

router.post('/api/users', async (ctx) => {
    const body = await ctx.request.body.json()
    const { uname } = body
    if (!uname) { ctx.response.status = 400; ctx.response.body = { error: 'uname is required' }; return }
    try {
        createUser(uname)
    } catch (e) {
        userInfoMainDb.query('DELETE FROM user_info WHERE uname = ?', [uname])
        ctx.response.status = 500
        ctx.response.body = { error: String(e) }
        return
    }
    const rows = userInfoMainDb.query<[number]>('SELECT last_insert_rowid()')
    ctx.response.status = 201
    ctx.response.body = { id: rows[0][0], uname, secretary_id: 1 }
})

router.delete('/api/users/:id', (ctx) => {
    const user = getUserById(Number(ctx.params.id))
    if (!user) { ctx.response.status = 404; ctx.response.body = { error: 'User not found' }; return }
    try { Deno.removeSync(getPlayerDbPath(user.uname)) } catch { /* ignore */ }
    userInfoMainDb.query('DELETE FROM user_info WHERE id = ?', [user.id])
    ctx.response.body = { success: true }
})

router.put('/api/users/:id', async (ctx) => {
    const user = getUserById(Number(ctx.params.id))
    if (!user) { ctx.response.status = 404; ctx.response.body = { error: 'User not found' }; return }
    const body = await ctx.request.body.json()
    if (body.uname !== undefined && body.uname !== user.uname) {
        const oldPath = getPlayerDbPath(user.uname)
        const newPath = getPlayerDbPath(body.uname)
        try { Deno.renameSync(oldPath, newPath) } catch { /* ignore */ }
        userInfoMainDb.query('UPDATE user_info SET uname = ? WHERE id = ?', [body.uname, user.id])
    }
    if (body.secretary_id !== undefined) {
        userInfoMainDb.query('UPDATE user_info SET secretary_id = ? WHERE id = ?', [body.secretary_id, user.id])
    }
    ctx.response.body = getUserById(user.id)
})

// --- Known tables data ---

function readTable(playerDb: DB, tableName: string) {
    const colInfo = playerDb.query<[number, string, string, number, string | null, number]>(
        `PRAGMA table_info("${tableName}")`
    )
    const columns = ['rowid', ...colInfo.map((r) => r[1])]
    const rawResult = playerDb.query(`SELECT rowid, * FROM "${tableName}"`)
    const rows: unknown[][] = []
    for (let i = 0; i < rawResult.length; i++) {
        const row: unknown[] = []
        for (let j = 0; j < columns.length; j++) {
            row.push((rawResult[i] as unknown[])[j])
        }
        rows.push(row)
    }
    return { columns, rows }
}

router.get('/api/users/:id/db/:table', (ctx) => {
    const user = getUserById(Number(ctx.params.id))
    if (!user) { ctx.response.status = 404; ctx.response.body = { error: 'User not found' }; return }
    const tableName = ctx.params.table!
    if (rejectUnknownTable(ctx, tableName)) return

    const playerDb = openPlayerDb(user.uname)
    if (!playerDb) { ctx.response.status = 404; ctx.response.body = { error: 'Player database not found' }; return }

    const result = readTable(playerDb, tableName)
    playerDb.close()
    ctx.response.body = result
})

router.put('/api/users/:id/db/:table/:rowid', async (ctx) => {
    const user = getUserById(Number(ctx.params.id))
    if (!user) { ctx.response.status = 404; ctx.response.body = { error: 'User not found' }; return }
    const tableName = ctx.params.table!
    if (rejectUnknownTable(ctx, tableName)) return

    const rowid = Number(ctx.params.rowid)
    const playerDb = openPlayerDb(user.uname)
    if (!playerDb) { ctx.response.status = 404; ctx.response.body = { error: 'Player database not found' }; return }

    const body = await ctx.request.body.json()
    const setClauses = Object.keys(body).map(k => `"${k}" = ?`).join(', ')
    const values = Object.values(body) as (string | number | boolean | null)[]
    playerDb.query(`UPDATE "${tableName}" SET ${setClauses} WHERE rowid = ?`, [...values, rowid])
    playerDb.close()
    ctx.response.body = { success: true }
})

router.post('/api/users/:id/db/:table', async (ctx) => {
    const user = getUserById(Number(ctx.params.id))
    if (!user) { ctx.response.status = 404; ctx.response.body = { error: 'User not found' }; return }
    const tableName = ctx.params.table!
    if (rejectUnknownTable(ctx, tableName)) return

    const playerDb = openPlayerDb(user.uname)
    if (!playerDb) { ctx.response.status = 404; ctx.response.body = { error: 'Player database not found' }; return }

    const body = await ctx.request.body.json()
    const cols = Object.keys(body)
    const placeholders = cols.map(() => '?').join(', ')
    const values = Object.values(body) as (string | number | boolean | null)[]
    playerDb.query(
        `INSERT INTO "${tableName}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`,
        values
    )
    playerDb.close()
    ctx.response.status = 201
    ctx.response.body = { success: true }
})

router.delete('/api/users/:id/db/:table/:rowid', (ctx) => {
    const user = getUserById(Number(ctx.params.id))
    if (!user) { ctx.response.status = 404; ctx.response.body = { error: 'User not found' }; return }
    const tableName = ctx.params.table!
    if (rejectUnknownTable(ctx, tableName)) return

    const rowid = Number(ctx.params.rowid)
    const playerDb = openPlayerDb(user.uname)
    if (!playerDb) { ctx.response.status = 404; ctx.response.body = { error: 'Player database not found' }; return }

    playerDb.query(`DELETE FROM "${tableName}" WHERE rowid = ?`, [rowid])
    playerDb.close()
    ctx.response.body = { success: true }
})

// --- Admin HTML ---

router.get('/', (ctx) => {
    ctx.response.headers.set('Content-Type', 'text/html; charset=utf-8')
    ctx.response.body = Deno.readTextFileSync('./template/admin.html')
})

const app = new Application()
app.use(router.routes())
app.use(router.allowedMethods())

const port = Number(Deno.env.get('ADMIN_PORT') ?? 0)
app.addEventListener('listen', ({ port: actualPort }) => {
    console.log(`管理面板：http://localhost:${actualPort}/`)
})
app.listen({ port })
