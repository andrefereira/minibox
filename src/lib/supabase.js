import { createClient } from "@supabase/supabase-js";

const SUPA_URL = "https://ukmcrusozgxlhtgdftgu.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbWNydXNvemd4bGh0Z2RmdGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDY1NTQsImV4cCI6MjA5NjY4MjU1NH0.DIpB9ereanEeCYr1KSbnDSLZqZU5jK8yIcdYstRle-E";

export const sb = createClient(SUPA_URL, SUPA_KEY);
