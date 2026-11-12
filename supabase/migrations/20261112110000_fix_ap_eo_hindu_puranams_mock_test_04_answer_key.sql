-- Migration: Rebalance answer key distribution for AP Endowment Officer · Hindu Puranams · Mock Test 04
-- Mock Test ID: ba9acc09-2b13-44c5-975b-ffec54727a1d
-- Paper ID:     48070adb-d7a4-4968-b474-5e642b107e9f (Hindu Philosophy & Temple System)
-- Subject ID:   4290a68c-c509-4461-b8bc-9f96604646de (Hindu Puranams)
--
-- Issue: 22 of 25 questions in Mock Test 04 had their correct option parked in slot B
-- (distribution: A=2, B=22, C=1, D=0).
-- Fix: Swap option B <-> target slot (both EN and TE) and update correct_answer on 16 questions
-- to achieve a balanced distribution (A=6, B=6, C=6, D=7) while preserving all question content
-- and explanations, and fix the mixed-script Telugu typo in Q01 ('దశాavatarాలలో' -> 'దశావతారాలలో').
-- Historical test_attempt_session_questions snapshots are intentionally left unchanged so past
-- attempt reviews and scores remain consistent with retained student selections.

begin;

do $$
declare
  v_mock_test_id uuid;
  v_assigned_count integer := 0;
  v_updated_count integer := 0;
  v_spec jsonb := $json$[
    {"q_order": 1,  "import_key_lower": "appsc_eo_p2_m4_q01", "question_en_norm": "how many incarnations of lord vishnu from the traditional dasavatara appeared in the 'satya yuga' (krita yuga)?", "target_answer": "C"},
    {"q_order": 2,  "import_key_lower": "appsc_eo_p2_m4_q02", "question_en_norm": "which mountain served as the churning rod (churning staff) during the churning of the milk ocean (samudra manthana)?", "target_answer": "D"},
    {"q_order": 3,  "import_key_lower": "appsc_eo_p2_m4_q03", "question_en_norm": "in the legend of samudra manthana, which serpent king served as the churning rope?", "target_answer": "A"},
    {"q_order": 4,  "import_key_lower": "appsc_eo_p2_m4_q04", "question_en_norm": "which divine incarnation of lord vishnu supported the sinking mount mandara on his back during samudra manthana?", "target_answer": "B"},
    {"q_order": 5,  "import_key_lower": "appsc_eo_p2_m4_q05", "question_en_norm": "due to whose curse did the devas lose their divine splendor and wealth (sri-heena), precipitating the churning of the ocean?", "target_answer": "D"},
    {"q_order": 6,  "import_key_lower": "appsc_eo_p2_m4_q06", "question_en_norm": "when the lethal poison 'halāhala' (kalakuta) erupted from the churning ocean, which deity consumed it to save the cosmos?", "target_answer": "C"},
    {"q_order": 7,  "import_key_lower": "appsc_eo_p2_m4_q07", "question_en_norm": "which enchanting female form did lord vishnu assume to distribute the amrita (nectar) exclusively to the devas?", "target_answer": "A"},
    {"q_order": 8,  "import_key_lower": "appsc_eo_p2_m4_q08", "question_en_norm": "the demon swarbhanu, who deceitfully drank amrita sitting between surya and chandra, was severed by vishnu's sudarshana chakra into which two entities?", "target_answer": "B"},
    {"q_order": 9,  "import_key_lower": "appsc_eo_p2_m4_q09", "question_en_norm": "the sacred white horse with seven heads that emerged during the samudra manthana is named:", "target_answer": "D"},
    {"q_order": 10, "import_key_lower": "appsc_eo_p2_m4_q10", "question_en_norm": "what is the name of the divine jewel (gem) emerged from the ocean that permanently adorns the chest of lord vishnu?", "target_answer": "C"},
    {"q_order": 11, "import_key_lower": "appsc_eo_p2_m4_q11", "question_en_norm": "which celestial deity carrying the pot of nectar (amrita kalasha) and regarded as the divine physician of the gods emerged during samudra manthana?", "target_answer": "B"},
    {"q_order": 12, "import_key_lower": "appsc_eo_p2_m4_q12", "question_en_norm": "in the daksha yajna episode, who were created by lord shiva from his matted hair (jata) to destroy daksha's sacrifice?", "target_answer": "A"},
    {"q_order": 13, "import_key_lower": "appsc_eo_p2_m4_q13", "question_en_norm": "after daksha was decapitated in his ruined sacrificial hall, what animal's head was transplanted onto his body to restore his life?", "target_answer": "D"},
    {"q_order": 14, "import_key_lower": "appsc_eo_p2_m4_q14", "question_en_norm": "in the gajendra moksham episode, which gandharva had been cursed to become the crocodile that seized the elephant king gajendra?", "target_answer": "C"},
    {"q_order": 15, "import_key_lower": "appsc_eo_p2_m4_q15", "question_en_norm": "what was the name of the king of pandya who, due to sage agastya's curse, was reborn as the elephant king gajendra?", "target_answer": "A"},
    {"q_order": 16, "import_key_lower": "appsc_eo_p2_m4_q16", "question_en_norm": "which incarnation of lord vishnu manifested from a palace pillar at twilight (sandhya) to slay demon king hiranyakashipu?", "target_answer": "B"},
    {"q_order": 17, "import_key_lower": "appsc_eo_p2_m4_q17", "question_en_norm": "to save which 16-year-old ardent devotee from the noose of yama did lord shiva manifest from the linga and kick the god of death (kalasamhara murti)?", "target_answer": "D"},
    {"q_order": 18, "import_key_lower": "appsc_eo_p2_m4_q18", "question_en_norm": "in the destruction of the three flying demon citadels (tripurasura samhara), which mountain did lord shiva use as his divine bow?", "target_answer": "B"},
    {"q_order": 19, "import_key_lower": "appsc_eo_p2_m4_q19", "question_en_norm": "what is the name of lord vishnu's divine bow and sword respectively?", "target_answer": "C"},
    {"q_order": 20, "import_key_lower": "appsc_eo_p2_m4_q20", "question_en_norm": "what is the name of lord shiva's celestial bow that was later broken by sri rama at sita's swayamvaram?", "target_answer": "D"},
    {"q_order": 21, "import_key_lower": "appsc_eo_p2_m4_q21", "question_en_norm": "which sage voluntarily gave his backbone/bones to indra to fashion the invincible thunderbolt weapon 'vajrayudha'?", "target_answer": "A"},
    {"q_order": 22, "import_key_lower": "appsc_eo_p2_m4_q22", "question_en_norm": "what is the name of the divine weapon (shakti / spear) and the sacred vehicle (vahana) of lord kartikeya (subrahmanya)?", "target_answer": "C"},
    {"q_order": 23, "import_key_lower": "appsc_eo_p2_m4_q23", "question_en_norm": "according to hindu iconography and puranas, which animal is the sacred mount (vahana) of yama (the lord of death)?", "target_answer": "D"},
    {"q_order": 24, "import_key_lower": "appsc_eo_p2_m4_q24", "question_en_norm": "which aquatic creature is the divine mount (vahana) of lord varuna (the lord of waters)?", "target_answer": "A"},
    {"q_order": 25, "import_key_lower": "appsc_eo_p2_m4_q25", "question_en_norm": "in the 24 avatars of vishnu mentioned in the first skandha of bhagavata purana, who is the 22nd incarnation who appeared to establish non-violence?", "target_answer": "B"}
  ]$json$;
  v_targets jsonb := '[]'::jsonb;
begin
  select id into v_mock_test_id
  from public.mock_tests
  where paper_id = '48070adb-d7a4-4968-b474-5e642b107e9f'
    and subject_id = '4290a68c-c509-4461-b8bc-9f96604646de'
    and test_scope = 'subject'
    and series_number = 4
    and superseded_by_mock_test_id is null
  limit 1;

  if v_mock_test_id is null then
    v_mock_test_id := 'ba9acc09-2b13-44c5-975b-ffec54727a1d';
  end if;

  if not exists (select 1 from public.mock_tests where id = v_mock_test_id) then
    raise notice 'AP EO Hindu Puranams Mock Test 04 not found; skipping.';
    return;
  end if;

  -- Fix mixed-script Telugu typo in Q01 (idempotent)
  update public.questions q
  set
    question_text_te = replace(q.question_text_te, 'దశాavatarాలలో', 'దశావతారాలలో'),
    updated_at = now()
  from public.mock_test_questions mtq
  where mtq.mock_test_id = v_mock_test_id
    and q.id = mtq.question_id
    and q.question_text_te like '%దశాavatarాలలో%';

  select count(*) into v_assigned_count
  from public.mock_test_questions
  where mock_test_id = v_mock_test_id;

  -- Resolve each assigned question to its target_answer (key/text match first, question_order fallback)
  with spec as (
    select *
    from jsonb_to_recordset(v_spec) as x(
      q_order integer,
      import_key_lower text,
      question_en_norm text,
      target_answer text
    )
  ),
  direct_matches as (
    select distinct on (q.id)
      q.id as question_id,
      s.q_order,
      s.target_answer
    from public.mock_test_questions mtq
    join public.questions q on q.id = mtq.question_id
    join spec s
      on lower(coalesce(q.import_key, '')) in (
        s.import_key_lower,
        'mock:' || v_mock_test_id::text || ':q' || s.q_order::text
      )
      or replace(lower(regexp_replace(trim(q.question_text), '\s+', ' ', 'g')), '’', '''') = s.question_en_norm
    where mtq.mock_test_id = v_mock_test_id
    order by q.id, s.q_order
  ),
  fallback_matches as (
    select
      mtq.question_id,
      s.q_order,
      s.target_answer
    from public.mock_test_questions mtq
    join spec s on s.q_order = mtq.question_order
    where v_assigned_count = 25
      and mtq.mock_test_id = v_mock_test_id
      and not exists (select 1 from direct_matches d where d.question_id = mtq.question_id)
      and not exists (select 1 from direct_matches d where d.q_order = s.q_order)
  ),
  combined as (
    select question_id, q_order, target_answer from direct_matches
    union all
    select question_id, q_order, target_answer from fallback_matches
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'question_id', c.question_id,
    'target_answer', c.target_answer
  )), '[]'::jsonb)
  into v_targets
  from combined c;

  -- Keep Study Book mistake entries aligned with the new option letters for un-migrated questions
  update public.student_question_mistakes sqm
  set last_selected_answer = case
    when sqm.last_selected_answer = 'B' then t.target_answer
    when sqm.last_selected_answer = t.target_answer then 'B'
    else sqm.last_selected_answer
  end
  from jsonb_to_recordset(v_targets) as t(question_id uuid, target_answer text)
  join public.questions q on q.id = t.question_id
  where sqm.question_id = q.id
    and q.correct_answer = 'B'
    and t.target_answer <> 'B'
    and sqm.last_selected_answer in ('B', t.target_answer);

  -- Swap option B <-> target option (EN & TE) and update correct_answer (idempotent: only rows still at B)
  update public.questions q
  set
    option_a = case when t.target_answer = 'A' then q.option_b else q.option_a end,
    option_b = case
      when t.target_answer = 'A' then q.option_a
      when t.target_answer = 'C' then q.option_c
      when t.target_answer = 'D' then q.option_d
      else q.option_b
    end,
    option_c = case when t.target_answer = 'C' then q.option_b else q.option_c end,
    option_d = case when t.target_answer = 'D' then q.option_b else q.option_d end,
    option_a_te = case when t.target_answer = 'A' then q.option_b_te else q.option_a_te end,
    option_b_te = case
      when t.target_answer = 'A' then q.option_a_te
      when t.target_answer = 'C' then q.option_c_te
      when t.target_answer = 'D' then q.option_d_te
      else q.option_b_te
    end,
    option_c_te = case when t.target_answer = 'C' then q.option_b_te else q.option_c_te end,
    option_d_te = case when t.target_answer = 'D' then q.option_b_te else q.option_d_te end,
    correct_answer = t.target_answer,
    updated_at = now()
  from jsonb_to_recordset(v_targets) as t(question_id uuid, target_answer text)
  where q.id = t.question_id
    and q.correct_answer = 'B'
    and t.target_answer <> 'B';

  get diagnostics v_updated_count = row_count;
  raise notice 'AP EO Hindu Puranams Mock Test 04 (%) rebalanced: % question(s) updated.', v_mock_test_id, v_updated_count;
end $$;

commit;
