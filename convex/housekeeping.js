import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { fail, nid, requireAccess, requireUser, serializeRoom, serializeTask, todayIso, assertHotelAccess } from './lib'

const tokenArg = { token: v.optional(v.string()) }

export const createTask = mutation({
  args: {
    ...tokenArg,
    hotelId: v.optional(v.string()),
    roomId: v.string(),
    type: v.optional(v.string()),
    notes: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'housekeeping')
    const room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', args.roomId))
      .unique()
    if (!room) fail(404, 'Room not found.')
    const hotelId = args.hotelId || room.hotelId
    assertHotelAccess(user, hotelId)
    const task = {
      id: nid('hk'),
      hotelId,
      roomId: room.id,
      type: args.type || 'cleaning',
      notes: args.notes || '',
      status: 'pending',
      priority: args.priority || 'medium',
      due: todayIso(),
    }
    if (args.assigneeId) task.assigneeId = args.assigneeId
    await ctx.db.insert('housekeepingTasks', task)
    return serializeTask(task)
  },
})

export const updateTask = mutation({
  args: {
    token: v.optional(v.string()),
    taskId: v.string(),
    patch: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    requireAccess(user, 'housekeeping')
    const task = await ctx.db
      .query('housekeepingTasks')
      .withIndex('by_id_field', (q) => q.eq('id', args.taskId))
      .unique()
    if (!task) fail(404, 'Task not found.')
    assertHotelAccess(user, task.hotelId)
    const allowed = ['status', 'assigneeId', 'priority', 'notes', 'type']
    const next = {}
    for (const key of allowed) {
      if (args.patch?.[key] != null) next[key] = args.patch[key]
    }
    await ctx.db.patch(task._id, next)
    let room = await ctx.db
      .query('rooms')
      .withIndex('by_id_field', (q) => q.eq('id', task.roomId))
      .unique()
    if (args.patch?.status === 'done' && room && (room.status === 'dirty' || room.status === 'cleaning')) {
      await ctx.db.patch(room._id, { status: 'available' })
      room = { ...room, status: 'available' }
    }
    return {
      task: serializeTask({ ...task, ...next }),
      room: room ? serializeRoom(room) : null,
    }
  },
})
