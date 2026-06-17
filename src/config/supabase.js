const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.supabaseAnonKey && !env.supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_ANON_KEY/SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey || env.supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

function createUserClient(accessToken) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

module.exports = {
  supabase,
  createUserClient
};
