import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://fpeivhlljqryxemvdmvm.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZWl2aGxsanFyeXhlbXZkbXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODMwMjg5MiwiZXhwIjoyMDUzODc4ODkyfQ.c5MNo3xhtA-hEzJa02nW23c6-opzVZZRcN7fKCRtIM8"

export const supabase = createClient(supabaseUrl, supabaseKey)

