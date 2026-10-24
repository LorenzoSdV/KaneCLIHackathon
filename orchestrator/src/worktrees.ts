// One git worktree per feature (wt/<id>), each on its own branch, all inside the project folder.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./kane.ts";

export const WORKTREES_DIR = join(ROOT, "wt");

export function git(args: string[], cwd = ROOT): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function branchExists(branch: string): boolean {
  try {
    git(["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`]);
    return true;
  } catch {
    return false;
  }
}

// Creates wt/<name> on <branch> (branched from <base>), or reuses it if it already exists.
export function ensureWorktree(name: string, branch: string, base = "main"): string {
  const dir = join(WORKTREES_DIR, name);
  if (existsSync(dir)) return dir;
  const args = branchExists(branch) ? ["worktree", "add", dir, branch] : ["worktree", "add", "-b", branch, dir, base];
  git(args);
  return dir;
}

export function removeWorktree(name: string, { deleteBranch = false, branch = "" } = {}) {
  const dir = join(WORKTREES_DIR, name);
  if (existsSync(dir)) git(["worktree", "remove", "--force", dir]);
  if (deleteBranch && branch && branchExists(branch)) git(["branch", "-D", branch]);
}

// Commits everything in a worktree; returns false when there was nothing to commit.
export function commitAll(dir: string, message: string): boolean {
  git(["add", "-A"], dir);
  if (!git(["status", "--porcelain"], dir)) return false;
  git(["commit", "-m", message], dir);
  return true;
}
