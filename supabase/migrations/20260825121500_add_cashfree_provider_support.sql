alter table public.payment_orders
  alter column provider drop default;

alter table public.payment_orders
  drop constraint if exists payment_orders_provider_check;

alter table public.payment_orders
  add constraint payment_orders_provider_check
  check (provider in ('phonepe', 'cashfree'));

alter table public.payment_orders
  alter column provider set default 'cashfree';

notify pgrst, 'reload schema';
