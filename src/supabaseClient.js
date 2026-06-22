import { createClient } from '@supabase/supabase-js'

// שליפת המשתנים מה-env (ב-Vite משתמשים ב-import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// בדיקת בטיחות קטנה - אם שכחת להגדיר אותם, תקבל שגיאה ברורה בקונסול
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables! Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)