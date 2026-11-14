import { createPublicClient } from './lib/supabase/public.ts';

async function checkDistribution() {
  const supabase = createPublicClient();
  const [papersRes, examsRes, testsRes, subjectsRes] = await Promise.all([
    supabase.from('papers').select('id, name, exam_group_id, is_active'),
    supabase.from('exam_groups').select('id, name, is_active'),
    supabase.from('mock_tests').select('id, paper_id, subject_id, title, status'),
    supabase.from('subjects').select('id, name, paper_id, is_active')
  ]);

  const exams = examsRes.data || [];
  const papers = papersRes.data || [];
  const tests = testsRes.data || [];
  const subjects = subjectsRes.data || [];

  console.log('Total tests:', tests.length);

  for (const exam of exams) {
    const examPapers = papers.filter(p => p.exam_group_id === exam.id);
    const examPaperIds = new Set(examPapers.map(p => p.id));
    const examTests = tests.filter(t => examPaperIds.has(t.paper_id));
    console.log(`Exam "${exam.name}" (active: ${exam.is_active}): ${examPapers.length} papers, ${examTests.length} tests`);
    for (const paper of examPapers) {
      const pTests = tests.filter(t => t.paper_id === paper.id);
      const pSubjects = subjects.filter(s => s.paper_id === paper.id);
      console.log(`  Paper "${paper.name}": ${pSubjects.length} subjects, ${pTests.length} tests`);
    }
  }

  // Are there tests whose paper_id is not in papers?
  const allPaperIds = new Set(papers.map(p => p.id));
  const orphaned = tests.filter(t => !allPaperIds.has(t.paper_id));
  console.log('Orphaned tests (invalid paper_id):', orphaned.length);
}

checkDistribution().catch(console.error);
