-- Migration: Fix AP Endowment Officer Paper 1 question count to official 150 questions
-- Prevents incomplete draft entry (136) from causing incorrect 286 question calculations

UPDATE papers
SET question_count = 150
WHERE id = '7c9ee5a1-0d79-422f-8cd1-13ae921d9b53'
   OR (slug = 'general-studies-mental-abilities' AND exam_group_id = 'bf9fff17-effc-4c6e-86c7-cb8effe65178');
