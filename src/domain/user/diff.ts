import type { User, UserUpdate } from "@/domain/user/model.js";

export function generateUserChanges(
  update: UserUpdate,
  currentUser: User
): Record<string, { old: string; new: string }> {
  const changes: Record<string, { old: string; new: string }> = {};

  if (update.email !== undefined && update.email !== currentUser.email) {
    changes.email = { old: currentUser.email, new: update.email };
  }

  if (update.name !== undefined && update.name !== currentUser.name) {
    changes.name = { old: currentUser.name, new: update.name };
  }

  if (update.age !== undefined) {
    const oldAge = currentUser.age?.toString() ?? "null";
    const newAge = update.age?.toString() ?? "null";
    if (oldAge !== newAge) {
      changes.age = { old: oldAge, new: newAge };
    }
  }

  return changes;
}
