/**
 * Supabase Database Types
 * Auto-generated types for database schema
 */

export interface Database {
  public: {
    Tables: {
      // Define your database tables here
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      // Define your database views here
    };
    Functions: {
      // Define your database functions here
    };
    Enums: {
      // Define your database enums here
    };
  };
}