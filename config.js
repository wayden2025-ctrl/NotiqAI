// ============================================================
// NOTIQ AI — CONFIG
// Paste your keys here. See SETUP.md for where to get each one.
// ============================================================

const NOTIQ_CONFIG = {
  // From Supabase: Project Settings -> API
  SUPABASE_URL: "https://ktossaxcpzhpkwugnntc.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0b3NzYXhjcHpocGt3dWdubnRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDI1NzksImV4cCI6MjA5ODUxODU3OX0.uM8EXPEZpgcDlVSQ0KDPeY0irS0IFSfDg9LBNTYwzM0",

  // From Groq: https://console.groq.com/keys
  GROQ_API_KEY: "PASTE_YOUR_GROQ_API_KEY_HERE",
  GROQ_MODEL: "llama-3.3-70b-versatile",
  // Multimodal model used when a student uploads an IMAGE (it actually "sees"
  // the picture — diagrams, handwriting, equations). Must be a vision model
  // your Groq account can access — check console.groq.com/docs/vision for the
  // current list and swap this if needed.
  GROQ_VISION_MODEL: "qwen/qwen3.6-27b",

  // Supabase Storage bucket name for uploaded resources
  STORAGE_BUCKET: "resources",
};
