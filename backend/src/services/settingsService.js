import Setting from '../models/Setting.js';

export async function getSettings() {
  return Setting.findOneAndUpdate({ key: 'platform' }, { $setOnInsert: { key: 'platform' } }, { new: true, upsert: true, setDefaultsOnInsert: true });
}

export async function updateSettings(changes) {
  return Setting.findOneAndUpdate({ key: 'platform' }, { $set: changes }, { new: true, upsert: true, setDefaultsOnInsert: true });
}
