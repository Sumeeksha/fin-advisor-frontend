import { getStoredUser } from "./auth";

export function getUserId(): string {
  if (typeof window === "undefined") return "server";
  
  // 1. If user is logged in, use their real user_id
  const loggedInUser = getStoredUser();
  if (loggedInUser && loggedInUser.user_id) {
    return loggedInUser.user_id;
  }

  // 2. Otherwise, use an anonymous UUID
  let userId = localStorage.getItem("finadvisor_user_id");
  if (!userId) {
    // Generate a simple UUID-like string
    userId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem("finadvisor_user_id", userId);
  }
  return userId;
}
