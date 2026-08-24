-- Paid access is sold as an Exam Pass. A pass unlocks every paid Mock Test
-- under its linked Exam (including future Papers and tests in that Exam).

create table public.access_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_inr numeric(8,2) not null check (price_inr >= 0),
  duration_days integer not null check (duration_days > 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.access_product_exam_groups (
  product_id uuid not null references public.access_products(id) on delete cascade,
  exam_group_id uuid not null references public.exam_groups(id) on delete restrict,
  primary key (product_id, exam_group_id)
);

create table public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.access_products(id) on delete restrict,
  provider text not null default 'phonepe' check (provider = 'phonepe'),
  merchant_order_id text not null unique,
  provider_order_id text,
  provider_transaction_id text,
  amount_paise integer not null check (amount_paise >= 0),
  currency text not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created', 'pending', 'paid', 'failed', 'cancelled', 'expired')),
  referral_code text,
  bonus_days integer not null default 0 check (bonus_days >= 0),
  provider_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_orders_user_created_idx on public.payment_orders(user_id, created_at desc);
create index payment_orders_provider_order_idx on public.payment_orders(provider_order_id) where provider_order_id is not null;

create table public.student_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.access_products(id) on delete restrict,
  payment_order_id uuid unique references public.payment_orders(id) on delete restrict,
  source text not null check (source in ('payment', 'referral', 'manual')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (expires_at > starts_at)
);

create index student_entitlements_active_idx on public.student_entitlements(user_id, expires_at desc);

create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  product_id uuid references public.access_products(id) on delete cascade,
  discount_type text not null check (discount_type in ('percent', 'amount', 'free_pass', 'bonus_days')),
  discount_value numeric(8,2) not null default 0 check (discount_value >= 0),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  per_user_limit integer not null default 1 check (per_user_limit > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (code = upper(code)),
  check (expires_at is null or starts_at is null or expires_at > starts_at)
);

create table public.referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references public.referral_codes(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  product_id uuid not null references public.access_products(id) on delete restrict,
  payment_order_id uuid unique references public.payment_orders(id) on delete restrict,
  discount_paise integer not null default 0 check (discount_paise >= 0),
  created_at timestamptz not null default now()
);

create index referral_redemptions_user_code_idx on public.referral_redemptions(user_id, referral_code_id);

create trigger update_access_products_updated_at before update on public.access_products
for each row execute function public.update_updated_at_column();
create trigger update_payment_orders_updated_at before update on public.payment_orders
for each row execute function public.update_updated_at_column();
create trigger update_referral_codes_updated_at before update on public.referral_codes
for each row execute function public.update_updated_at_column();

alter table public.access_products enable row level security;
alter table public.access_product_exam_groups enable row level security;
alter table public.payment_orders enable row level security;
alter table public.student_entitlements enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_redemptions enable row level security;

create policy "Public can view active access products" on public.access_products
for select using (is_active or public.is_admin());
create policy "Public can view access product exams" on public.access_product_exam_groups
for select using (exists (select 1 from public.access_products product where product.id = access_product_exam_groups.product_id and (product.is_active or public.is_admin())));
create policy "Admins can manage access products" on public.access_products for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage access product exams" on public.access_product_exam_groups for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "Students can view own payment orders" on public.payment_orders for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy "Students can view own entitlements" on public.student_entitlements for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy "Students can view own referral redemptions" on public.referral_redemptions for select to authenticated
using (user_id = auth.uid() or public.is_admin());
create policy "Admins can manage payment orders" on public.payment_orders for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage entitlements" on public.student_entitlements for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage referral codes" on public.referral_codes for all to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage referral redemptions" on public.referral_redemptions for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create or replace function public.can_access_mock_test(requested_mock_test_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.mock_tests mock_test
    join public.papers paper on paper.id = mock_test.paper_id
    where mock_test.id = requested_mock_test_id
      and mock_test.status = 'published'
      and (
        mock_test.access_type = 'free'
        or exists (
          select 1 from public.mock_test_entitlements legacy
          where legacy.mock_test_id = mock_test.id and legacy.user_id = auth.uid()
        )
        or exists (
          select 1
          from public.student_entitlements entitlement
          join public.access_product_exam_groups product_exam
            on product_exam.product_id = entitlement.product_id
          where entitlement.user_id = auth.uid()
            and entitlement.starts_at <= now()
            and entitlement.expires_at > now()
            and product_exam.exam_group_id = paper.exam_group_id
        )
      )
  );
$$;

create or replace function public.grant_payment_entitlement(requested_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  order_record public.payment_orders%rowtype;
  duration integer;
  entitlement_id uuid;
begin
  select * into order_record from public.payment_orders where id = requested_order_id for update;
  if order_record.id is null then raise exception 'Payment order not found.'; end if;
  if order_record.status <> 'paid' then raise exception 'Payment has not been completed.'; end if;
  select duration_days into duration from public.access_products where id = order_record.product_id;
  if duration is null then raise exception 'Access product not found.'; end if;
  insert into public.student_entitlements (user_id, product_id, payment_order_id, source, starts_at, expires_at)
  values (order_record.user_id, order_record.product_id, order_record.id, 'payment', now(), now() + (duration + order_record.bonus_days) * interval '1 day')
  on conflict (payment_order_id) do update set payment_order_id = excluded.payment_order_id
  returning id into entitlement_id;
  return entitlement_id;
end;
$$;

create or replace function public.get_published_mock_test_stats()
returns table (mock_test_id uuid, question_count bigint, total_marks numeric, maximum_negative_marks numeric)
language sql stable security definer set search_path = public
as $$
  select mock_test.id, count(question.id),
    coalesce(sum(case when question.id is not null then assignment.marks else 0 end), 0),
    coalesce(max(case when question.id is not null then assignment.negative_marks else 0 end), 0)
  from public.mock_tests mock_test
  left join public.mock_test_questions assignment on assignment.mock_test_id = mock_test.id
  left join public.questions question on question.id = assignment.question_id and question.is_active = true
    and (question.content_lifecycle <> 'expires' or question.expires_on >= (now() at time zone 'Asia/Kolkata')::date)
  where mock_test.status = 'published'
  group by mock_test.id;
$$;

create or replace function public.publish_mock_test_safely(requested_mock_test_id uuid)
returns table (question_count bigint, total_marks numeric)
language plpgsql security definer set search_path = public
as $$
declare test_record record; actual_question_count bigint; actual_total_marks numeric; invalid_question_count bigint;
begin
  if not public.is_admin() then raise exception 'Administrator MFA verification is required.'; end if;
  select mock_test.id, mock_test.status, mock_test.test_scope, mock_test.paper_id, mock_test.subject_id, mock_test.access_type,
    paper.question_count as configured_question_count into test_record
  from public.mock_tests mock_test join public.papers paper on paper.id = mock_test.paper_id
  where mock_test.id = requested_mock_test_id for update of mock_test;
  if test_record.id is null then raise exception 'Mock Test not found.'; end if;
  if test_record.status <> 'draft' then raise exception 'Only draft Mock Tests can be published.'; end if;
  if test_record.access_type = 'paid' and not exists (
    select 1 from public.access_product_exam_groups map join public.access_products product on product.id = map.product_id
    where map.exam_group_id = (select exam_group_id from public.papers where id = test_record.paper_id) and product.is_active
  ) then raise exception 'Create an active Exam Pass for this Exam before publishing a paid Mock Test.'; end if;
  select count(*), coalesce(sum(assignment.marks), 0), count(*) filter (
    where question.id is null or not question.is_active or subject.id is null or subject.paper_id <> test_record.paper_id
      or (test_record.test_scope = 'subject' and question.subject_id <> test_record.subject_id)
      or (question.content_lifecycle = 'expires' and question.expires_on < (now() at time zone 'Asia/Kolkata')::date)
      or assignment.marks <= 0 or assignment.negative_marks < 0
  ) into actual_question_count, actual_total_marks, invalid_question_count
  from public.mock_test_questions assignment left join public.questions question on question.id = assignment.question_id
  left join public.subjects subject on subject.id = question.subject_id where assignment.mock_test_id = requested_mock_test_id;
  if actual_question_count = 0 then raise exception 'Add at least one Question before publishing.'; end if;
  if invalid_question_count > 0 then raise exception 'Every assigned Question and mark must be active and valid.'; end if;
  if test_record.test_scope = 'paper' and test_record.configured_question_count is not null and actual_question_count <> test_record.configured_question_count then
    raise exception 'The assigned Question count must match the Paper Question count.';
  end if;
  update public.mock_tests set status = 'published', published_at = now() where id = requested_mock_test_id;
  return query select actual_question_count, actual_total_marks;
end;
$$;

revoke all on function public.can_access_mock_test(uuid) from public;
revoke all on function public.grant_payment_entitlement(uuid) from public;
grant execute on function public.can_access_mock_test(uuid) to authenticated;
grant execute on function public.grant_payment_entitlement(uuid) to service_role;

notify pgrst, 'reload schema';
