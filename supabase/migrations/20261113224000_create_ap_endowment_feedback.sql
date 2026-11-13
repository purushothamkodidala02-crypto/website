-- Migration: Create AP Endowment Officer Mock Test Priority Feedback table
CREATE TABLE IF NOT EXISTS public.ap_endowment_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT,
  student_email TEXT,
  paper_choice TEXT NOT NULL,
  subject_focus TEXT NOT NULL,
  specific_topics TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by user_id and created_at
CREATE INDEX IF NOT EXISTS idx_ap_endowment_feedback_user_id ON public.ap_endowment_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ap_endowment_feedback_created_at ON public.ap_endowment_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE public.ap_endowment_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own feedback
DROP POLICY IF EXISTS "Users can insert own endowment feedback" ON public.ap_endowment_feedback;
CREATE POLICY "Users can insert own endowment feedback" ON public.ap_endowment_feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to view their own feedback
DROP POLICY IF EXISTS "Users can view own endowment feedback" ON public.ap_endowment_feedback;
CREATE POLICY "Users can view own endowment feedback" ON public.ap_endowment_feedback
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Allow admins to view and manage all feedback
DROP POLICY IF EXISTS "Admins can manage endowment feedback" ON public.ap_endowment_feedback;
CREATE POLICY "Admins can manage endowment feedback" ON public.ap_endowment_feedback
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
