import { supabase } from '../lib/supabase';
import { debugLogger } from './debug';

const COMPONENT_NAME = 'DatabaseDiagnostic';

export interface TableInfo {
  tableName: string;
  exists: boolean;
  columns?: string[];
  rowCount?: number;
  error?: string;
}

export async function checkUsersTable(): Promise<TableInfo> {
  debugLogger.info(COMPONENT_NAME, 'Checking users table');
  
  try {
    // Try to query the table
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      debugLogger.error(COMPONENT_NAME, 'Users table query error', error);
      
      // Check if it's a "relation does not exist" error
      if (error.code === '42P01') {
        return {
          tableName: 'users',
          exists: false,
          error: 'Table does not exist'
        };
      }
      
      return {
        tableName: 'users',
        exists: true,
        error: error.message
      };
    }

    // Get column information
    const { data: columns, error: columnsError } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    let columnNames: string[] = [];
    if (!columnsError && columns) {
      // Extract column names from the empty result
      const { data: singleRow } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single();
      
      if (singleRow) {
        columnNames = Object.keys(singleRow);
      }
    }

    debugLogger.info(COMPONENT_NAME, 'Users table check complete', {
      exists: true,
      columns: columnNames,
      rowCount: count
    });

    return {
      tableName: 'users',
      exists: true,
      columns: columnNames,
      rowCount: count || 0
    };
  } catch (error) {
    debugLogger.error(COMPONENT_NAME, 'Unexpected error checking users table', error);
    return {
      tableName: 'users',
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function checkAuthUser(): Promise<{
  authenticated: boolean;
  user?: any;
  error?: string;
}> {
  debugLogger.info(COMPONENT_NAME, 'Checking auth user');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      debugLogger.error(COMPONENT_NAME, 'Auth user check error', error);
      return {
        authenticated: false,
        error: error.message
      };
    }

    if (!user) {
      debugLogger.info(COMPONENT_NAME, 'No authenticated user');
      return {
        authenticated: false
      };
    }

    debugLogger.info(COMPONENT_NAME, 'Auth user found', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }
    };
  } catch (error) {
    debugLogger.error(COMPONENT_NAME, 'Unexpected error checking auth user', error);
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runDatabaseDiagnostics() {
  debugLogger.info(COMPONENT_NAME, 'Running full database diagnostics');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    authUser: await checkAuthUser(),
    usersTable: await checkUsersTable(),
    recommendations: [] as string[]
  };

  // Add recommendations based on findings
  if (!diagnostics.authUser.authenticated) {
    diagnostics.recommendations.push('User is not authenticated - sign in required');
  }

  if (!diagnostics.usersTable.exists) {
    diagnostics.recommendations.push('Users table does not exist - database migration needed');
  } else if (diagnostics.usersTable.error) {
    diagnostics.recommendations.push(`Fix users table error: ${diagnostics.usersTable.error}`);
  }

  if (diagnostics.authUser.authenticated && diagnostics.usersTable.exists) {
    // Check if user has a profile
    const userId = diagnostics.authUser.user?.id;
    if (userId) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        diagnostics.recommendations.push('User profile missing - needs to be created');
      }
    }
  }

  debugLogger.info(COMPONENT_NAME, 'Diagnostics complete', diagnostics);
  return diagnostics;
}