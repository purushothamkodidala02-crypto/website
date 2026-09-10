-- Remove any FAQ questions mentioning 'exam pattern' to keep public FAQs clean and admin-controlled
delete from public.exam_page_faqs
where question ilike '%exam pattern%';
