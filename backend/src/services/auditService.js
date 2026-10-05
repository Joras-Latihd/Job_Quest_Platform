import AuditLog from '../models/AuditLog.js';

// Records what an admin did. Logging problems are reported but never block the admin action.
export async function logAction(actor, action, { targetType, targetId, targetLabel, details } = {}) {
  try {
    await AuditLog.create({ actor: actor._id, action, targetType, targetId: targetId ? String(targetId) : undefined, targetLabel, details });
  } catch (error) {
    console.error('Could not write audit log:', error.message);
  }
}
