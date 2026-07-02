console.log("carregou: supabase.js");

const SUPABASE_URL = "https://ozkkwaqcxkejgrenbcha.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96a2t3YXFjeGtlamdyZW5iY2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NTMwNTMsImV4cCI6MjA5ODUyOTA1M30.UZgRDCC7gnFvnnidAtk5oWmbxg_UAieSdosIQtBC82Y";

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);