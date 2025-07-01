// Compatibility layer for bcryptjs to handle ES module issues
// This ensures bcryptjs works correctly in Vercel Functions

let bcrypt: any;

try {
  // Try to import as CommonJS first
  bcrypt = require('bcryptjs');
} catch (e) {
  // If CommonJS fails, try dynamic import
  (async () => {
    bcrypt = await import('bcryptjs');
  })();
}

export default bcrypt || require('bcryptjs');
export const compare = async (password: string, hash: string): Promise<boolean> => {
  const bcryptModule = bcrypt || require('bcryptjs');
  return bcryptModule.compare(password, hash);
};

export const hash = async (password: string, rounds: number): Promise<string> => {
  const bcryptModule = bcrypt || require('bcryptjs');
  return bcryptModule.hash(password, rounds);
};