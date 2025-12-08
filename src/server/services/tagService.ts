
// ============================================================================
// SERVICE LAYER - TAGS
// Path: src/server/services/tagService.ts
// ============================================================================

import { TaskTag } from '../../shared/types/task.types';
import { db } from '../db/jsonDatabase';
import { taskService } from './taskService';
import { nanoid } from 'nanoid';

class TagService {
  async getAllTags(): Promise<TaskTag[]> {
    return await db.readTags();
  }

  async createTag(name: string, color: string): Promise<TaskTag> {
    const tags = await db.readTags();
    const newTag: TaskTag = {
      id: nanoid(),
      name: name.trim(),
      color
    };
    tags.push(newTag);
    await db.writeTags(tags);
    return newTag;
  }

  async deleteTag(id: string): Promise<boolean> {
    const tags = await db.readTags();
    const filtered = tags.filter(t => t.id !== id);
    
    if (filtered.length === tags.length) return false;

    await db.writeTags(filtered);
    
    // Cleanup: Remove this tag from all tasks
    await taskService.removeTagFromAllTasks(id);
    
    return true;
  }
}

export const tagService = new TagService();
